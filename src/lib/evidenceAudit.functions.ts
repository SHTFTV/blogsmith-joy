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
      ipHash?: string;
      reasonCode?: string;
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
          ipHash: z.string().trim().max(80).optional(),
          reasonCode: z.string().trim().max(40).optional(),
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
    if (data.ipHash) q = q.ilike("requester_ip_hash", `%${data.ipHash}%`);
    if (data.reasonCode)
      q = q.contains("mismatch_reason_codes", [data.reasonCode]);
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

// ------------ Alerts: config, evaluation, notifications ------------

export type EvidenceAlertConfig = {
  id: number;
  enabled: boolean;
  failure_rate_threshold: number;
  throttle_count_threshold: number;
  window_hours: number;
  min_sample_size: number;
  notify_email: string | null;
  alert_cooldown_minutes: number;
  updated_at: string;
};

export type EvidenceAlertRow = {
  id: string;
  kind: "failure_rate" | "throttle_spike";
  metric_value: number;
  threshold_value: number;
  window_hours: number;
  sample_size: number;
  requester_ip_hash: string | null;
  details: Record<string, string | number | boolean | null>;
  notified: boolean;
  created_at: string;
  status: "active" | "acknowledged" | "dismissed";
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  dismissed_at: string | null;
  dismissed_by: string | null;
  admin_note: string | null;
};

const ALERT_SELECT =
  "id, kind, metric_value, threshold_value, window_hours, sample_size, requester_ip_hash, details, notified, created_at, status, acknowledged_at, acknowledged_by, dismissed_at, dismissed_by, admin_note";

export const getEvidenceAlertConfig = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data, error } = await supabaseAdmin
      .from("evidence_alert_config")
      .select(
        "id, enabled, failure_rate_threshold, throttle_count_threshold, window_hours, min_sample_size, notify_email, alert_cooldown_minutes, updated_at",
      )
      .eq("id", 1)
      .single();
    if (error) throw new Error(error.message);
    return { config: data as EvidenceAlertConfig };
  });

export const updateEvidenceAlertConfig = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: Partial<Omit<EvidenceAlertConfig, "id" | "updated_at">>) =>
    z
      .object({
        enabled: z.boolean().optional(),
        failure_rate_threshold: z.number().min(0).max(1).optional(),
        throttle_count_threshold: z.number().int().min(1).max(100000).optional(),
        window_hours: z.number().int().min(1).max(168).optional(),
        min_sample_size: z.number().int().min(1).max(100000).optional(),
        notify_email: z.string().email().max(254).nullable().optional(),
        alert_cooldown_minutes: z.number().int().min(1).max(10080).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: updated, error } = await supabaseAdmin
      .from("evidence_alert_config")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", 1)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { config: updated as EvidenceAlertConfig };
  });

export const listEvidenceAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      limit?: number;
      status?: "active" | "acknowledged" | "dismissed" | "all";
    }) =>
      z
        .object({
          limit: z.number().int().min(1).max(200).optional(),
          status: z
            .enum(["active", "acknowledged", "dismissed", "all"])
            .optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    let q = supabaseAdmin
      .from("evidence_alerts")
      .select(ALERT_SELECT)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    const status = data.status ?? "active";
    if (status !== "all") q = q.eq("status", status);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as EvidenceAlertRow[] };
  });

export const updateEvidenceAlertStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      id: string;
      action: "acknowledge" | "dismiss" | "reactivate";
      note?: string;
    }) =>
      z
        .object({
          id: z.string().uuid(),
          action: z.enum(["acknowledge", "dismiss", "reactivate"]),
          note: z.string().trim().max(500).optional(),
        })
        .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const nowIso = new Date().toISOString();
    const userId = (context as any).userId as string;
    const patch: Record<string, unknown> = { admin_note: data.note ?? null };
    if (data.action === "acknowledge") {
      patch.status = "acknowledged";
      patch.acknowledged_at = nowIso;
      patch.acknowledged_by = userId;
      patch.dismissed_at = null;
      patch.dismissed_by = null;
    } else if (data.action === "dismiss") {
      patch.status = "dismissed";
      patch.dismissed_at = nowIso;
      patch.dismissed_by = userId;
      patch.acknowledged_at = null;
      patch.acknowledged_by = null;
    } else {
      patch.status = "active";
      patch.acknowledged_at = null;
      patch.acknowledged_by = null;
      patch.dismissed_at = null;
      patch.dismissed_by = null;
    }
    const { data: row, error } = await supabaseAdmin
      .from("evidence_alerts")
      .update(patch)
      .eq("id", data.id)
      .select(ALERT_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return { row: row as EvidenceAlertRow };
  });


async function enqueueAlertEmail(
  supabaseAdmin: any,
  to: string,
  alert: EvidenceAlertRow,
) {
  const subject =
    alert.kind === "failure_rate"
      ? `[weddings.io] Evidence verification failure-rate spike (${(alert.metric_value * 100).toFixed(1)}%)`
      : `[weddings.io] Evidence verification throttling spike (${alert.metric_value} 429s from one IP)`;
  const lines = [
    `Alert kind: ${alert.kind}`,
    `Metric: ${alert.metric_value}`,
    `Threshold: ${alert.threshold_value}`,
    `Window (hours): ${alert.window_hours}`,
    `Sample size: ${alert.sample_size}`,
    alert.requester_ip_hash ? `IP hash: ${alert.requester_ip_hash}` : "",
    `Created: ${alert.created_at}`,
    "",
    "Review at https://weddings.io/evidence/audit",
  ].filter(Boolean);
  const text = lines.join("\n");
  const html = `<pre style="font:13px/1.4 monospace">${lines
    .map((l) => l.replace(/</g, "&lt;"))
    .join("<br>")}</pre>`;
  const messageId = `evidence-alert-${alert.id}`;
  await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      to,
      from: "alerts@notify.weddings.io",
      from_display_domain: "weddings.io",
      subject,
      html,
      text,
      message_id: messageId,
      idempotency_key: messageId,
      template_name: "evidence-alert",
      metadata: { alert_id: alert.id, kind: alert.kind },
    } as never,
  });
}

export const evaluateEvidenceAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );
    const { data: cfg, error: cfgErr } = await supabaseAdmin
      .from("evidence_alert_config")
      .select("*")
      .eq("id", 1)
      .single();
    if (cfgErr) throw new Error(cfgErr.message);
    if (!cfg.enabled) return { skipped: true, reason: "disabled" };

    const since = new Date(
      Date.now() - cfg.window_hours * 3600 * 1000,
    ).toISOString();

    const { data: rows, error } = await supabaseAdmin
      .from("evidence_verification_audit")
      .select(
        "requester_ip_hash, outcome, manifest_signature_valid, pdf_signature_valid, manifest_expired, mismatched_claim_count, created_at",
      )
      .gte("created_at", since)
      .limit(50000);
    if (error) throw new Error(error.message);

    let verified = 0;
    let failures = 0;
    const throttleByIp = new Map<string, number>();
    for (const r of rows ?? []) {
      if (r.outcome === "verified") {
        verified += 1;
        const sigFail =
          !r.manifest_signature_valid || !r.pdf_signature_valid;
        const mismatchFail = (r.mismatched_claim_count ?? 0) > 0;
        const expiredFail = !!r.manifest_expired;
        if (sigFail || mismatchFail || expiredFail) failures += 1;
      } else if (r.outcome === "rate_limited" && r.requester_ip_hash) {
        throttleByIp.set(
          r.requester_ip_hash,
          (throttleByIp.get(r.requester_ip_hash) ?? 0) + 1,
        );
      }
    }
    const failureRate = verified > 0 ? failures / verified : 0;

    const inserted: EvidenceAlertRow[] = [];
    const cooldownIso = new Date(
      Date.now() - cfg.alert_cooldown_minutes * 60 * 1000,
    ).toISOString();

    // Failure-rate alert
    if (
      verified >= cfg.min_sample_size &&
      failureRate >= cfg.failure_rate_threshold
    ) {
      const { count } = await supabaseAdmin
        .from("evidence_alerts")
        .select("id", { count: "exact", head: true })
        .eq("kind", "failure_rate")
        .gte("created_at", cooldownIso);
      if ((count ?? 0) === 0) {
        const { data: ins, error: insErr } = await supabaseAdmin
          .from("evidence_alerts")
          .insert({
            kind: "failure_rate",
            metric_value: failureRate,
            threshold_value: cfg.failure_rate_threshold,
            window_hours: cfg.window_hours,
            sample_size: verified,
            requester_ip_hash: null,
            details: { failures, verified },
          })
          .select()
          .single();
        if (!insErr && ins) inserted.push(ins as EvidenceAlertRow);
      }
    }

    // Throttle-spike alerts per IP
    for (const [ipHash, count] of throttleByIp.entries()) {
      if (count < cfg.throttle_count_threshold) continue;
      const { count: recent } = await supabaseAdmin
        .from("evidence_alerts")
        .select("id", { count: "exact", head: true })
        .eq("kind", "throttle_spike")
        .eq("requester_ip_hash", ipHash)
        .gte("created_at", cooldownIso);
      if ((recent ?? 0) > 0) continue;
      const { data: ins, error: insErr } = await supabaseAdmin
        .from("evidence_alerts")
        .insert({
          kind: "throttle_spike",
          metric_value: count,
          threshold_value: cfg.throttle_count_threshold,
          window_hours: cfg.window_hours,
          sample_size: count,
          requester_ip_hash: ipHash,
          details: {},
        })
        .select()
        .single();
      if (!insErr && ins) inserted.push(ins as EvidenceAlertRow);
    }

    // Notify (best-effort)
    if (cfg.notify_email && inserted.length > 0) {
      for (const a of inserted) {
        try {
          await enqueueAlertEmail(supabaseAdmin, cfg.notify_email, a);
          await supabaseAdmin
            .from("evidence_alerts")
            .update({ notified: true })
            .eq("id", a.id);
          a.notified = true;
        } catch (err) {
          console.warn("evidence alert email enqueue failed", err);
        }
      }
    }

    return {
      window_hours: cfg.window_hours,
      verified,
      failures,
      failure_rate: failureRate,
      throttle_ips: Array.from(throttleByIp.entries()).map(([ip, c]) => ({
        ip_hash: ip,
        count: c,
      })),
      alerts_created: inserted,
    };
  });

// Full server-side receipt report (used by the receipt detail page's
// downloadable PDF/JSON export).
export const getEvidenceReceiptReport = createServerFn({ method: "POST" })
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
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const auditRows = (rows ?? []) as EvidenceAuditRow[];
    const primary = auditRows[0] ?? null;
    return {
      receipt_id: data.receiptId,
      generated_at: new Date().toISOString(),
      issuer: "https://weddings.io",
      audit_entries: auditRows,
      summary: primary
        ? {
            outcome: primary.outcome,
            manifest_signature_valid: primary.manifest_signature_valid,
            pdf_signature_valid: primary.pdf_signature_valid,
            manifest_expired: primary.manifest_expired,
            claim_count: primary.claim_count,
            mismatched_claim_count: primary.mismatched_claim_count,
            all_matched: primary.all_matched,
            mismatch_reason_codes: primary.mismatch_reason_codes ?? [],
            requester_ip_hash: primary.requester_ip_hash,
            user_agent: primary.user_agent,
            created_at: primary.created_at,
          }
        : null,
    };
  });
