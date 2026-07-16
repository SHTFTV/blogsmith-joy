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
  outcome: "verified" | "rate_limited" | "error";
  manifest_expired: boolean;
  mismatched_claim_count: number;
  mismatch_reason_codes: string[];
};

const SORT_COLUMNS = [
  "created_at",
  "receipt_id",
  "outcome",
  "claim_count",
  "mismatched_claim_count",
  "requester_ip_hash",
] as const;

const SELECT_COLUMNS =
  "id, receipt_id, requester_ip_hash, user_agent, claim_count, all_matched, manifest_signature_valid, pdf_signature_valid, created_at, outcome, manifest_expired, mismatched_claim_count, mismatch_reason_codes";

export const listEvidenceAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      receiptId?: string;
      fromIso?: string;
      toIso?: string;
      outcome?: "verified" | "rate_limited" | "error" | "all";
      limit?: number;
      offset?: number;
      sortColumn?: (typeof SORT_COLUMNS)[number];
      sortDirection?: "asc" | "desc";
    }) =>
      z
        .object({
          receiptId: z.string().trim().max(64).optional(),
          fromIso: z.string().datetime().optional(),
          toIso: z.string().datetime().optional(),
          outcome: z
            .enum(["verified", "rate_limited", "error", "all"])
            .optional(),
          limit: z.number().int().min(1).max(200).optional(),
          offset: z.number().int().min(0).max(100_000).optional(),
          sortColumn: z.enum(SORT_COLUMNS).optional(),
          sortDirection: z.enum(["asc", "desc"]).optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const limit = data.limit ?? 50;
    const offset = data.offset ?? 0;
    const sortColumn = data.sortColumn ?? "created_at";
    const sortDirection = data.sortDirection ?? "desc";

    let q = supabaseAdmin
      .from("evidence_verification_audit")
      .select(SELECT_COLUMNS, { count: "exact" })
      .order(sortColumn, { ascending: sortDirection === "asc" })
      .range(offset, offset + limit - 1);
    if (data.receiptId) q = q.ilike("receipt_id", `%${data.receiptId}%`);
    if (data.fromIso) q = q.gte("created_at", data.fromIso);
    if (data.toIso) q = q.lte("created_at", data.toIso);
    if (data.outcome && data.outcome !== "all")
      q = q.eq("outcome", data.outcome);
    const { data: rows, error, count } = await q;
    if (error) throw new Error(error.message);
    return {
      rows: (rows ?? []) as EvidenceAuditRow[],
      total: count ?? 0,
      limit,
      offset,
      sortColumn,
      sortDirection,
    };
  });

export const getEvidenceAuditReceipt = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { receiptId: string }) =>
    z.object({ receiptId: z.string().trim().min(1).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: rows, error } = await supabaseAdmin
      .from("evidence_verification_audit")
      .select(SELECT_COLUMNS)
      .eq("receipt_id", data.receiptId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as EvidenceAuditRow[] };
  });

export type EvidenceMetricsBucket = {
  bucket_start: string;
  verified: number;
  rate_limited: number;
  errored: number;
  sig_failures: number;
  mismatch_failures: number;
  expired_failures: number;
};

export type EvidenceIpAbuseRow = {
  requester_ip_hash: string;
  total: number;
  rate_limited: number;
  sig_failures: number;
  mismatch_failures: number;
  last_seen: string;
};

export const getEvidenceMetrics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { hours?: number; bucketMinutes?: 15 | 60 | 360 | 1440 }) =>
      z
        .object({
          hours: z.number().int().min(1).max(24 * 30).optional(),
          bucketMinutes: z
            .union([z.literal(15), z.literal(60), z.literal(360), z.literal(1440)])
            .optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const hours = data.hours ?? 24;
    const bucketMinutes = data.bucketMinutes ?? 60;
    const since = new Date(Date.now() - hours * 3600 * 1000).toISOString();

    // Pull rows in the window; small volume expected. Aggregate in JS to avoid
    // adding SQL functions.
    const { data: rows, error } = await supabaseAdmin
      .from("evidence_verification_audit")
      .select(
        "requester_ip_hash, outcome, manifest_signature_valid, pdf_signature_valid, manifest_expired, mismatched_claim_count, created_at",
      )
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(20000);
    if (error) throw new Error(error.message);

    const bucketMs = bucketMinutes * 60 * 1000;
    const bucketMap = new Map<string, EvidenceMetricsBucket>();
    const ipMap = new Map<string, EvidenceIpAbuseRow>();

    let totals = {
      total: 0,
      verified: 0,
      rate_limited: 0,
      errored: 0,
      sig_failures: 0,
      mismatch_failures: 0,
      expired_failures: 0,
    };

    for (const r of rows ?? []) {
      const ts = new Date(r.created_at).getTime();
      const bucketStart = new Date(Math.floor(ts / bucketMs) * bucketMs).toISOString();
      const b =
        bucketMap.get(bucketStart) ??
        {
          bucket_start: bucketStart,
          verified: 0,
          rate_limited: 0,
          errored: 0,
          sig_failures: 0,
          mismatch_failures: 0,
          expired_failures: 0,
        };
      const outcome = (r.outcome as string) ?? "verified";
      totals.total += 1;
      if (outcome === "verified") {
        b.verified += 1;
        totals.verified += 1;
      } else if (outcome === "rate_limited") {
        b.rate_limited += 1;
        totals.rate_limited += 1;
      } else {
        b.errored += 1;
        totals.errored += 1;
      }
      const sigFail =
        outcome === "verified" &&
        (!r.manifest_signature_valid || !r.pdf_signature_valid);
      const mismatchFail =
        outcome === "verified" && (r.mismatched_claim_count ?? 0) > 0;
      const expiredFail = outcome === "verified" && !!r.manifest_expired;
      if (sigFail) {
        b.sig_failures += 1;
        totals.sig_failures += 1;
      }
      if (mismatchFail) {
        b.mismatch_failures += 1;
        totals.mismatch_failures += 1;
      }
      if (expiredFail) {
        b.expired_failures += 1;
        totals.expired_failures += 1;
      }
      bucketMap.set(bucketStart, b);

      const ip = r.requester_ip_hash ?? "anonymous";
      const cur =
        ipMap.get(ip) ??
        {
          requester_ip_hash: ip,
          total: 0,
          rate_limited: 0,
          sig_failures: 0,
          mismatch_failures: 0,
          last_seen: r.created_at,
        };
      cur.total += 1;
      if (outcome === "rate_limited") cur.rate_limited += 1;
      if (sigFail) cur.sig_failures += 1;
      if (mismatchFail) cur.mismatch_failures += 1;
      if (new Date(r.created_at) > new Date(cur.last_seen)) {
        cur.last_seen = r.created_at;
      }
      ipMap.set(ip, cur);
    }

    const buckets = Array.from(bucketMap.values()).sort((a, b) =>
      a.bucket_start.localeCompare(b.bucket_start),
    );
    const ipRows = Array.from(ipMap.values())
      .sort(
        (a, b) =>
          b.rate_limited - a.rate_limited ||
          b.total - a.total ||
          b.sig_failures + b.mismatch_failures -
            (a.sig_failures + a.mismatch_failures),
      )
      .slice(0, 50);

    const failureRate =
      totals.verified > 0
        ? (totals.sig_failures +
            totals.mismatch_failures +
            totals.expired_failures) /
          totals.verified
        : 0;

    return {
      window: { since, hours, bucketMinutes },
      totals: { ...totals, failure_rate: failureRate },
      buckets,
      ip_abuse: ipRows,
    };
  });
