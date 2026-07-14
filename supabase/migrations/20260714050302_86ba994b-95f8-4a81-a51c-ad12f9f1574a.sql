
-- Config table for anomaly detection thresholds (singleton row id=1).
CREATE TABLE public.guest_upload_alert_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  burst_window_minutes integer NOT NULL DEFAULT 10 CHECK (burst_window_minutes BETWEEN 1 AND 1440),
  burst_threshold integer NOT NULL DEFAULT 50 CHECK (burst_threshold BETWEEN 1 AND 100000),
  reject_window_minutes integer NOT NULL DEFAULT 60 CHECK (reject_window_minutes BETWEEN 1 AND 1440),
  reject_threshold integer NOT NULL DEFAULT 30 CHECK (reject_threshold BETWEEN 1 AND 100000),
  spray_window_minutes integer NOT NULL DEFAULT 30 CHECK (spray_window_minutes BETWEEN 1 AND 1440),
  spray_threshold integer NOT NULL DEFAULT 10 CHECK (spray_threshold BETWEEN 1 AND 100000),
  notify_webhook_url text NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid NULL
);

GRANT SELECT ON public.guest_upload_alert_config TO authenticated;
GRANT ALL ON public.guest_upload_alert_config TO service_role;

ALTER TABLE public.guest_upload_alert_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view alert config"
  ON public.guest_upload_alert_config
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update alert config"
  ON public.guest_upload_alert_config
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.guest_upload_alert_config (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Update the scan function to read thresholds from config.
CREATE OR REPLACE FUNCTION public.scan_guest_upload_anomalies()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
  now_ts timestamptz := now();
  cfg public.guest_upload_alert_config%ROWTYPE;
  burst_window interval;
  reject_window interval;
  spray_window interval;
  rec record;
BEGIN
  SELECT * INTO cfg FROM public.guest_upload_alert_config WHERE id = 1;
  IF NOT FOUND THEN
    -- Fallback defaults if config row is missing.
    cfg.burst_window_minutes := 10; cfg.burst_threshold := 50;
    cfg.reject_window_minutes := 60; cfg.reject_threshold := 30;
    cfg.spray_window_minutes := 30; cfg.spray_threshold := 10;
  END IF;
  burst_window := make_interval(mins => cfg.burst_window_minutes);
  reject_window := make_interval(mins => cfg.reject_window_minutes);
  spray_window := make_interval(mins => cfg.spray_window_minutes);

  FOR rec IN
    SELECT uploader_ip_hash, count(*) AS c
    FROM public.guest_uploads
    WHERE submitted_at >= now_ts - burst_window
      AND uploader_ip_hash IS NOT NULL
    GROUP BY uploader_ip_hash
    HAVING count(*) > cfg.burst_threshold
  LOOP
    INSERT INTO public.guest_upload_alerts
      (alert_type, uploader_ip_hash, event_count, window_start, window_end, details)
    VALUES
      ('upload_burst', rec.uploader_ip_hash, rec.c,
       now_ts - burst_window, now_ts,
       jsonb_build_object('threshold', cfg.burst_threshold,
                          'window_minutes', cfg.burst_window_minutes))
    ON CONFLICT (alert_type, uploader_ip_hash, window_start) DO NOTHING;
    IF FOUND THEN inserted_count := inserted_count + 1; END IF;
  END LOOP;

  FOR rec IN
    SELECT uploader_ip_hash, count(*) AS c
    FROM public.guest_uploads
    WHERE submitted_at >= now_ts - reject_window
      AND uploader_ip_hash IS NOT NULL
      AND status = 'rejected'
    GROUP BY uploader_ip_hash
    HAVING count(*) > cfg.reject_threshold
  LOOP
    INSERT INTO public.guest_upload_alerts
      (alert_type, uploader_ip_hash, event_count, window_start, window_end, details)
    VALUES
      ('rejection_spike', rec.uploader_ip_hash, rec.c,
       now_ts - reject_window, now_ts,
       jsonb_build_object('threshold', cfg.reject_threshold,
                          'window_minutes', cfg.reject_window_minutes))
    ON CONFLICT (alert_type, uploader_ip_hash, window_start) DO NOTHING;
    IF FOUND THEN inserted_count := inserted_count + 1; END IF;
  END LOOP;

  FOR rec IN
    SELECT uploader_ip_hash, count(DISTINCT event_id) AS c
    FROM public.guest_uploads
    WHERE submitted_at >= now_ts - spray_window
      AND uploader_ip_hash IS NOT NULL
    GROUP BY uploader_ip_hash
    HAVING count(DISTINCT event_id) > cfg.spray_threshold
  LOOP
    INSERT INTO public.guest_upload_alerts
      (alert_type, uploader_ip_hash, event_count, window_start, window_end, details)
    VALUES
      ('cross_event_spray', rec.uploader_ip_hash, rec.c,
       now_ts - spray_window, now_ts,
       jsonb_build_object('threshold', cfg.spray_threshold,
                          'window_minutes', cfg.spray_window_minutes,
                          'metric', 'distinct_events'))
    ON CONFLICT (alert_type, uploader_ip_hash, window_start) DO NOTHING;
    IF FOUND THEN inserted_count := inserted_count + 1; END IF;
  END LOOP;

  RETURN inserted_count;
END;
$$;

-- Trigger to notify admins when a new alert row is inserted.
-- Posts to a public webhook route which fans out to Slack and email.
CREATE OR REPLACE FUNCTION public.guest_upload_alerts_notify()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  cfg_url text;
BEGIN
  SELECT notify_webhook_url INTO cfg_url
  FROM public.guest_upload_alert_config WHERE id = 1;

  -- Fixed same-origin dispatch route (bypasses site auth via /api/public/*).
  IF cfg_url IS NULL OR cfg_url = '' THEN
    cfg_url := 'https://project--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app/api/public/hooks/guest-upload-alert';
  END IF;

  BEGIN
    PERFORM net.http_post(
      url := cfg_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-alert-source', 'guest_upload_alerts_trigger'
      ),
      body := jsonb_build_object(
        'id', NEW.id,
        'alert_type', NEW.alert_type,
        'uploader_ip_hash', NEW.uploader_ip_hash,
        'event_id', NEW.event_id,
        'event_count', NEW.event_count,
        'window_start', NEW.window_start,
        'window_end', NEW.window_end,
        'details', NEW.details,
        'created_at', NEW.created_at
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'guest_upload_alerts_notify: http_post failed: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.guest_upload_alerts_notify() FROM PUBLIC;

DROP TRIGGER IF EXISTS guest_upload_alerts_notify_tr ON public.guest_upload_alerts;
CREATE TRIGGER guest_upload_alerts_notify_tr
AFTER INSERT ON public.guest_upload_alerts
FOR EACH ROW EXECUTE FUNCTION public.guest_upload_alerts_notify();
