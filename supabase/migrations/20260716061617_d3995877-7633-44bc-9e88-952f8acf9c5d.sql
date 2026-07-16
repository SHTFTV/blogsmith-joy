CREATE TABLE public.evidence_verification_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  receipt_id TEXT NOT NULL,
  requester_ip_hash TEXT,
  user_agent TEXT,
  claim_count INT NOT NULL DEFAULT 0,
  all_matched BOOLEAN NOT NULL DEFAULT false,
  manifest_signature_valid BOOLEAN NOT NULL DEFAULT false,
  pdf_signature_valid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.evidence_verification_audit TO service_role;

ALTER TABLE public.evidence_verification_audit ENABLE ROW LEVEL SECURITY;

-- Append-only: no UPDATE/DELETE policies. Only service_role (bypasses RLS) can write/read.
CREATE POLICY "no_direct_access" ON public.evidence_verification_audit
  FOR SELECT TO authenticated USING (false);

CREATE INDEX idx_evidence_verification_audit_created_at
  ON public.evidence_verification_audit (created_at DESC);

-- Block UPDATE/DELETE at the DB level for defense-in-depth.
CREATE OR REPLACE FUNCTION public.evidence_verification_audit_immutable()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'evidence_verification_audit is append-only';
END;
$$;

CREATE TRIGGER evidence_verification_audit_no_update
  BEFORE UPDATE OR DELETE ON public.evidence_verification_audit
  FOR EACH ROW EXECUTE FUNCTION public.evidence_verification_audit_immutable();