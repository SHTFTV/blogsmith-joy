
CREATE TABLE public.domain_repush_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  triggered_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  bundle_commit TEXT NOT NULL,
  bundle_commit_short TEXT NOT NULL,
  targets_total INT NOT NULL,
  targets_recovered INT NOT NULL DEFAULT 0,
  targets_still_stale INT NOT NULL DEFAULT 0,
  targets JSONB NOT NULL,
  before_summary JSONB NOT NULL,
  after_summary JSONB NOT NULL,
  notes TEXT
);

GRANT SELECT ON public.domain_repush_audit TO authenticated;
GRANT ALL ON public.domain_repush_audit TO service_role;

ALTER TABLE public.domain_repush_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view repush audit"
  ON public.domain_repush_audit FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX domain_repush_audit_run_at_idx
  ON public.domain_repush_audit (run_at DESC);
