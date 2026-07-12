
CREATE TABLE public.propagation_check_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  bundle_commit TEXT NOT NULL,
  bundle_commit_short TEXT NOT NULL,
  origins_checked INT NOT NULL,
  match_count INT NOT NULL,
  stale_count INT NOT NULL,
  error_count INT NOT NULL,
  results JSONB NOT NULL,
  alert_sent BOOLEAN NOT NULL DEFAULT false,
  alert_error TEXT
);

CREATE INDEX propagation_check_runs_run_at_idx ON public.propagation_check_runs (run_at DESC);

GRANT SELECT ON public.propagation_check_runs TO anon;
GRANT SELECT ON public.propagation_check_runs TO authenticated;
GRANT ALL ON public.propagation_check_runs TO service_role;

ALTER TABLE public.propagation_check_runs ENABLE ROW LEVEL SECURITY;

-- Watchdog history is internal-diagnostic (no PII) and admin.verify/admin.propagation are noindex.
-- Allow read-only access; writes only via service role from the /api/public/hooks/propagation-check route.
CREATE POLICY "Anyone can read watchdog history"
  ON public.propagation_check_runs
  FOR SELECT
  USING (true);
