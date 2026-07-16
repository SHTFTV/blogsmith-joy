
CREATE TABLE IF NOT EXISTS public.evidence_alert_config (
  id INT PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT true,
  failure_rate_threshold NUMERIC NOT NULL DEFAULT 0.25 CHECK (failure_rate_threshold >= 0 AND failure_rate_threshold <= 1),
  throttle_count_threshold INT NOT NULL DEFAULT 20 CHECK (throttle_count_threshold >= 1),
  window_hours INT NOT NULL DEFAULT 1 CHECK (window_hours BETWEEN 1 AND 168),
  min_sample_size INT NOT NULL DEFAULT 20 CHECK (min_sample_size >= 1),
  notify_email TEXT,
  alert_cooldown_minutes INT NOT NULL DEFAULT 60 CHECK (alert_cooldown_minutes >= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT evidence_alert_config_singleton CHECK (id = 1)
);

GRANT ALL ON public.evidence_alert_config TO service_role;
ALTER TABLE public.evidence_alert_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_direct_access_config" ON public.evidence_alert_config
  FOR SELECT TO authenticated USING (false);

INSERT INTO public.evidence_alert_config (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.evidence_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('failure_rate','throttle_spike')),
  metric_value NUMERIC NOT NULL,
  threshold_value NUMERIC NOT NULL,
  window_hours INT NOT NULL,
  sample_size INT NOT NULL,
  requester_ip_hash TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.evidence_alerts TO service_role;
ALTER TABLE public.evidence_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_direct_access_alerts" ON public.evidence_alerts
  FOR SELECT TO authenticated USING (false);

CREATE INDEX IF NOT EXISTS idx_evidence_alerts_kind_created
  ON public.evidence_alerts (kind, created_at DESC);
