
CREATE TABLE public.launch_notify_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'ppp-launch',
  ip_hash TEXT,
  user_agent TEXT,
  confirmed BOOLEAN NOT NULL DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX launch_notify_subscribers_email_source_key
  ON public.launch_notify_subscribers (lower(email), source);

GRANT SELECT, UPDATE ON public.launch_notify_subscribers TO authenticated;
GRANT ALL ON public.launch_notify_subscribers TO service_role;

ALTER TABLE public.launch_notify_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read launch subscribers"
  ON public.launch_notify_subscribers
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update launch subscribers"
  ON public.launch_notify_subscribers
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.launch_notify_subscribe(
  p_email TEXT,
  p_source TEXT DEFAULT 'ppp-launch',
  p_ip_hash TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email TEXT := lower(trim(p_email));
  v_source TEXT := coalesce(nullif(trim(p_source), ''), 'ppp-launch');
  v_recent INT;
  v_existing UUID;
BEGIN
  IF v_email IS NULL OR length(v_email) < 5 OR length(v_email) > 254
     OR v_email !~ '^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_email');
  END IF;

  IF p_ip_hash IS NOT NULL THEN
    SELECT count(*) INTO v_recent
    FROM public.launch_notify_subscribers
    WHERE ip_hash = p_ip_hash
      AND created_at >= now() - interval '10 minutes';
    IF v_recent >= 10 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'rate_limited');
    END IF;
  END IF;

  SELECT id INTO v_existing
  FROM public.launch_notify_subscribers
  WHERE lower(email) = v_email AND source = v_source;

  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', true, 'already_subscribed', true);
  END IF;

  INSERT INTO public.launch_notify_subscribers (email, source, ip_hash, user_agent)
  VALUES (v_email, v_source, p_ip_hash, left(coalesce(p_user_agent, ''), 500));

  RETURN jsonb_build_object('ok', true, 'already_subscribed', false);
END;
$$;

REVOKE ALL ON FUNCTION public.launch_notify_subscribe(TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.launch_notify_subscribe(TEXT, TEXT, TEXT, TEXT) TO anon, authenticated, service_role;
