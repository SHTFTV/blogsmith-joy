ALTER TABLE public.evidence_alerts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS acknowledged_at timestamptz,
  ADD COLUMN IF NOT EXISTS acknowledged_by uuid,
  ADD COLUMN IF NOT EXISTS dismissed_at timestamptz,
  ADD COLUMN IF NOT EXISTS dismissed_by uuid,
  ADD COLUMN IF NOT EXISTS admin_note text;

ALTER TABLE public.evidence_alerts
  DROP CONSTRAINT IF EXISTS evidence_alerts_status_check;
ALTER TABLE public.evidence_alerts
  ADD CONSTRAINT evidence_alerts_status_check
  CHECK (status IN ('active','acknowledged','dismissed'));

CREATE INDEX IF NOT EXISTS evidence_alerts_status_created_idx
  ON public.evidence_alerts (status, created_at DESC);