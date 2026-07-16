
ALTER TABLE public.evidence_verification_audit
  ADD COLUMN IF NOT EXISTS outcome TEXT NOT NULL DEFAULT 'verified',
  ADD COLUMN IF NOT EXISTS manifest_expired BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mismatched_claim_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mismatch_reason_codes TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE public.evidence_verification_audit
  DROP CONSTRAINT IF EXISTS evidence_verification_audit_outcome_check;
ALTER TABLE public.evidence_verification_audit
  ADD CONSTRAINT evidence_verification_audit_outcome_check
  CHECK (outcome IN ('verified','rate_limited','error'));

CREATE INDEX IF NOT EXISTS idx_evidence_verification_audit_outcome_created
  ON public.evidence_verification_audit (outcome, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_verification_audit_ip_created
  ON public.evidence_verification_audit (requester_ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evidence_verification_audit_receipt
  ON public.evidence_verification_audit (receipt_id);
