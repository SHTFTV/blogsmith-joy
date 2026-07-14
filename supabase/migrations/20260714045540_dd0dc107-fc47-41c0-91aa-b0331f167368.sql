
CREATE TABLE public.guest_upload_alerts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  alert_type text NOT NULL,
  uploader_ip_hash text NOT NULL,
  event_id uuid NULL REFERENCES public.wedding_events(id) ON DELETE SET NULL,
  event_count integer NOT NULL DEFAULT 0,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_type, uploader_ip_hash, window_start)
);

GRANT SELECT ON public.guest_upload_alerts TO authenticated;
GRANT ALL ON public.guest_upload_alerts TO service_role;

ALTER TABLE public.guest_upload_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view guest upload alerts"
  ON public.guest_upload_alerts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX guest_upload_alerts_created_at_idx
  ON public.guest_upload_alerts (created_at DESC);
CREATE INDEX guest_upload_alerts_ip_hash_idx
  ON public.guest_upload_alerts (uploader_ip_hash, created_at DESC);

CREATE OR REPLACE FUNCTION public.scan_guest_upload_anomalies()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
  now_ts timestamptz := now();
  burst_window interval := interval '10 minutes';
  reject_window interval := interval '60 minutes';
  spray_window interval := interval '30 minutes';
  burst_threshold int := 50;
  reject_threshold int := 30;
  spray_threshold int := 10;
  rec record;
BEGIN
  -- 1. Upload bursts: >burst_threshold uploads from one IP hash in 10 min.
  FOR rec IN
    SELECT uploader_ip_hash, count(*) AS c
    FROM public.guest_uploads
    WHERE submitted_at >= now_ts - burst_window
      AND uploader_ip_hash IS NOT NULL
    GROUP BY uploader_ip_hash
    HAVING count(*) > burst_threshold
  LOOP
    INSERT INTO public.guest_upload_alerts
      (alert_type, uploader_ip_hash, event_count, window_start, window_end, details)
    VALUES
      ('upload_burst', rec.uploader_ip_hash, rec.c,
       now_ts - burst_window, now_ts,
       jsonb_build_object('threshold', burst_threshold, 'window', '10 minutes'))
    ON CONFLICT (alert_type, uploader_ip_hash, window_start) DO NOTHING;
    IF FOUND THEN inserted_count := inserted_count + 1; END IF;
  END LOOP;

  -- 2. Repeated rejections: >reject_threshold rejected uploads in 60 min.
  FOR rec IN
    SELECT uploader_ip_hash, count(*) AS c
    FROM public.guest_uploads
    WHERE submitted_at >= now_ts - reject_window
      AND uploader_ip_hash IS NOT NULL
      AND status = 'rejected'
    GROUP BY uploader_ip_hash
    HAVING count(*) > reject_threshold
  LOOP
    INSERT INTO public.guest_upload_alerts
      (alert_type, uploader_ip_hash, event_count, window_start, window_end, details)
    VALUES
      ('rejection_spike', rec.uploader_ip_hash, rec.c,
       now_ts - reject_window, now_ts,
       jsonb_build_object('threshold', reject_threshold, 'window', '60 minutes'))
    ON CONFLICT (alert_type, uploader_ip_hash, window_start) DO NOTHING;
    IF FOUND THEN inserted_count := inserted_count + 1; END IF;
  END LOOP;

  -- 3. Cross-event spraying: one IP hash touching >spray_threshold events in 30 min.
  FOR rec IN
    SELECT uploader_ip_hash, count(DISTINCT event_id) AS c
    FROM public.guest_uploads
    WHERE submitted_at >= now_ts - spray_window
      AND uploader_ip_hash IS NOT NULL
    GROUP BY uploader_ip_hash
    HAVING count(DISTINCT event_id) > spray_threshold
  LOOP
    INSERT INTO public.guest_upload_alerts
      (alert_type, uploader_ip_hash, event_count, window_start, window_end, details)
    VALUES
      ('cross_event_spray', rec.uploader_ip_hash, rec.c,
       now_ts - spray_window, now_ts,
       jsonb_build_object('threshold', spray_threshold, 'window', '30 minutes',
                          'metric', 'distinct_events'))
    ON CONFLICT (alert_type, uploader_ip_hash, window_start) DO NOTHING;
    IF FOUND THEN inserted_count := inserted_count + 1; END IF;
  END LOOP;

  RETURN inserted_count;
END;
$$;

-- Lock this function down: only backend roles run it.
REVOKE ALL ON FUNCTION public.scan_guest_upload_anomalies() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.scan_guest_upload_anomalies() FROM anon;
REVOKE ALL ON FUNCTION public.scan_guest_upload_anomalies() FROM authenticated;
GRANT EXECUTE ON FUNCTION public.scan_guest_upload_anomalies() TO service_role;

-- Schedule the scan every 5 minutes.
DO $$
BEGIN
  PERFORM cron.unschedule('scan-guest-upload-anomalies');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'scan-guest-upload-anomalies',
  '*/5 * * * *',
  $cron$ SELECT public.scan_guest_upload_anomalies(); $cron$
);
