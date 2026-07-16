import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

export type EvidenceAuditRow = {
  id: string;
  receipt_id: string;
  requester_ip_hash: string | null;
  user_agent: string | null;
  claim_count: number;
  all_matched: boolean;
  manifest_signature_valid: boolean;
  pdf_signature_valid: boolean;
  created_at: string;
};

export const listEvidenceAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      receiptId?: string;
      fromIso?: string;
      toIso?: string;
      limit?: number;
    }) =>
      z
        .object({
          receiptId: z.string().trim().max(64).optional(),
          fromIso: z.string().datetime().optional(),
          toIso: z.string().datetime().optional(),
          limit: z.number().int().min(1).max(1000).optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    let q = supabaseAdmin
      .from("evidence_verification_audit")
      .select(
        "id, receipt_id, requester_ip_hash, user_agent, claim_count, all_matched, manifest_signature_valid, pdf_signature_valid, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 500);
    if (data.receiptId) q = q.ilike("receipt_id", `%${data.receiptId}%`);
    if (data.fromIso) q = q.gte("created_at", data.fromIso);
    if (data.toIso) q = q.lte("created_at", data.toIso);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as EvidenceAuditRow[] };
  });
