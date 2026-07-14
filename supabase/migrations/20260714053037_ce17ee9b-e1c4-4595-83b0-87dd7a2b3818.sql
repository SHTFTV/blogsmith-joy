
ALTER TABLE public.launch_notify_subscribers
  ALTER COLUMN confirmed SET DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS confirmation_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS launch_notify_active_idx
  ON public.launch_notify_subscribers (source)
  WHERE confirmed = true AND unsubscribed_at IS NULL;

CREATE OR REPLACE FUNCTION public.launch_notify_subscribe(
  p_email TEXT,
  p_source TEXT DEFAULT 'ppp-launch',
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(trim(p_email));
  v_source TEXT := coalesce(nullif(trim(p_source), ''), 'ppp-launch');
  v_recent INT;
  v_row public.launch_notify_subscribers%ROWTYPE;
  v_token TEXT;
BEGIN
  IF v_email IS NULL OR length(v_email) < 5 OR length(v_email) > 254
     OR v_email !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
  END IF;

  IF p_ip_hash IS NOT NULL THEN
    SELECT count(*) INTO v_recent
    FROM public.launch_notify_subscribers
    WHERE ip_hash = p_ip_hash AND created_at >= now() - interval '10 minutes';
    IF v_recent >= 10 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'rate_limited');
    END IF;
  END IF;

  SELECT * INTO v_row
  FROM public.launch_notify_subscribers
  WHERE lower(email) = v_email AND source = v_source;

  IF FOUND THEN
    IF v_row.confirmed AND v_row.unsubscribed_at IS NULL THEN
      RETURN jsonb_build_object('ok', true, 'status', 'already_confirmed', 'email', v_email);
    END IF;
    IF v_row.confirmation_token IS NULL THEN
      v_token := encode(gen_random_bytes(24), 'hex');
    ELSE
      v_token := v_row.confirmation_token;
    END IF;
    UPDATE public.launch_notify_subscribers
      SET confirmation_token = v_token,
          confirmation_sent_at = now(),
          unsubscribed_at = NULL
      WHERE id = v_row.id;
    RETURN jsonb_build_object(
      'ok', true, 'status', 'confirmation_resent',
      'confirmation_token', v_token, 'email', v_email
    );
  END IF;

  v_token := encode(gen_random_bytes(24), 'hex');
  INSERT INTO public.launch_notify_subscribers
    (email, source, ip_hash, user_agent, confirmed, confirmation_token, confirmation_sent_at)
  VALUES
    (v_email, v_source, p_ip_hash, left(coalesce(p_user_agent, ''), 500),
     false, v_token, now());
  RETURN jsonb_build_object(
    'ok', true, 'status', 'confirmation_sent',
    'confirmation_token', v_token, 'email', v_email
  );
END;
$$;

REVOKE ALL ON FUNCTION public.launch_notify_subscribe(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.launch_notify_subscribe(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.launch_notify_confirm(p_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_row public.launch_notify_subscribers%ROWTYPE;
BEGIN
  IF p_token IS NULL OR length(p_token) < 20 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;
  SELECT * INTO v_row FROM public.launch_notify_subscribers WHERE confirmation_token = p_token;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_token');
  END IF;
  IF v_row.confirmed AND v_row.unsubscribed_at IS NULL THEN
    RETURN jsonb_build_object('ok', true, 'already_confirmed', true, 'email', v_row.email);
  END IF;
  UPDATE public.launch_notify_subscribers
    SET confirmed = true, confirmed_at = now(), unsubscribed_at = NULL
    WHERE id = v_row.id;
  RETURN jsonb_build_object('ok', true, 'already_confirmed', false, 'email', v_row.email);
END;
$$;
REVOKE ALL ON FUNCTION public.launch_notify_confirm(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.launch_notify_confirm(TEXT) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.launch_notify_unsubscribe_by_email(p_email TEXT)
RETURNS INT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_count INT;
BEGIN
  UPDATE public.launch_notify_subscribers
    SET unsubscribed_at = COALESCE(unsubscribed_at, now())
    WHERE lower(email) = lower(trim(p_email))
      AND unsubscribed_at IS NULL;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
REVOKE ALL ON FUNCTION public.launch_notify_unsubscribe_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.launch_notify_unsubscribe_by_email(TEXT) TO service_role;

CREATE TABLE IF NOT EXISTS public.launch_broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL,
  template_name TEXT NOT NULL,
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  total_recipients INT NOT NULL DEFAULT 0,
  enqueued INT NOT NULL DEFAULT 0,
  skipped INT NOT NULL DEFAULT 0,
  failed INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.launch_broadcasts TO authenticated;
GRANT ALL ON public.launch_broadcasts TO service_role;
ALTER TABLE public.launch_broadcasts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can read launch broadcasts" ON public.launch_broadcasts;
CREATE POLICY "Admins can read launch broadcasts"
  ON public.launch_broadcasts
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
