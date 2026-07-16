import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  listEvidenceAudit,
  getEvidenceMetrics,
  getEvidenceAlertConfig,
  updateEvidenceAlertConfig,
  listEvidenceAlerts,
  evaluateEvidenceAlerts,
  updateEvidenceAlertStatus,
  type EvidenceAuditRow,
  type EvidenceMetricsBucket,
  type EvidenceIpAbuseRow,
  type EvidenceAlertConfig,
  type EvidenceAlertRow,
} from "@/lib/evidenceAudit.functions";



export const Route = createFileRoute("/evidence/audit")({
  head: () => ({
    meta: [
      { title: "Evidence Verification Audit — Weddings.io™" },
      {
        name: "description",
        content:
          "Admin-only view of evidence verification requests, throttling trends, and per-receipt outcome detail.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EvidenceAuditPage,
});

type SortColumn =
  | "created_at"
  | "receipt_id"
  | "outcome"
  | "claim_count"
  | "mismatched_claim_count"
  | "requester_ip_hash";
type SortDirection = "asc" | "desc";

function toIsoOrUndefined(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function toCsv(rows: EvidenceAuditRow[]): string {
  const headers = [
    "id",
    "receipt_id",
    "created_at",
    "outcome",
    "requester_ip_hash",
    "user_agent",
    "claim_count",
    "mismatched_claim_count",
    "all_matched",
    "manifest_signature_valid",
    "pdf_signature_valid",
    "manifest_expired",
    "mismatch_reason_codes",
    "verification_result",
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const summarize = (r: EvidenceAuditRow) => {
    if (r.outcome === "rate_limited") return "throttled";
    if (r.outcome === "error") return "error";
    if (!r.manifest_signature_valid || !r.pdf_signature_valid)
      return "signature_invalid";
    if (r.manifest_expired) return "manifest_expired";
    if (r.claim_count === 0) return "artifacts_only";
    return r.all_matched ? "match" : "mismatch";
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.receipt_id,
        r.created_at,
        r.outcome,
        r.requester_ip_hash ?? "",
        r.user_agent ?? "",
        r.claim_count,
        r.mismatched_claim_count,
        r.all_matched,
        r.manifest_signature_valid,
        r.pdf_signature_valid,
        r.manifest_expired,
        (r.mismatch_reason_codes ?? []).join("|"),
        summarize(r),
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}

const PAGE_SIZES = [25, 50, 100, 200];

function EvidenceAuditPage() {
  const fetchAudit = useServerFn(listEvidenceAudit);
  const fetchMetrics = useServerFn(getEvidenceMetrics);
  const fetchAlertConfig = useServerFn(getEvidenceAlertConfig);
  const saveAlertConfig = useServerFn(updateEvidenceAlertConfig);
  const fetchAlerts = useServerFn(listEvidenceAlerts);
  const runAlertEval = useServerFn(evaluateEvidenceAlerts);
  const setAlertStatus = useServerFn(updateEvidenceAlertStatus);

  // Hydrate initial state from ?query on first render so shareable links work.
  const initial = useMemo(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);
    return {
      receiptId: p.get("receiptId") ?? "",
      ipHash: p.get("ipHash") ?? "",
      reasonCode: p.get("reasonCode") ?? "",
      from: p.get("from") ?? "",
      to: p.get("to") ?? "",
      outcome:
        (p.get("outcome") as "all" | "verified" | "rate_limited" | "error") ||
        "all",
      pageSize: Number(p.get("pageSize")) || 50,
      page: Number(p.get("page")) || 0,
      sortColumn: (p.get("sortColumn") as SortColumn) || "created_at",
      sortDirection: (p.get("sortDirection") as SortDirection) || "desc",
    };
  }, []);

  const [receiptId, setReceiptId] = useState(initial?.receiptId ?? "");
  const [ipHash, setIpHash] = useState(initial?.ipHash ?? "");
  const [reasonCode, setReasonCode] = useState(initial?.reasonCode ?? "");
  const [from, setFrom] = useState(initial?.from ?? "");
  const [to, setTo] = useState(initial?.to ?? "");
  const [outcome, setOutcome] = useState<
    "all" | "verified" | "rate_limited" | "error"
  >(initial?.outcome ?? "all");
  const [rows, setRows] = useState<EvidenceAuditRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(initial?.pageSize ?? 50);
  const [page, setPage] = useState(initial?.page ?? 0);
  const [sortColumn, setSortColumn] = useState<SortColumn>(
    initial?.sortColumn ?? "created_at",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initial?.sortDirection ?? "desc",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const [metricsHours, setMetricsHours] = useState<number>(24);
  const [bucketMinutes, setBucketMinutes] = useState<15 | 60 | 360 | 1440>(60);
  const [metrics, setMetrics] = useState<{
    totals: {
      total: number;
      verified: number;
      rate_limited: number;
      errored: number;
      sig_failures: number;
      mismatch_failures: number;
      expired_failures: number;
      failure_rate: number;
    };
    buckets: EvidenceMetricsBucket[];
    ip_abuse: EvidenceIpAbuseRow[];
  } | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState<EvidenceAlertConfig | null>(
    null,
  );
  const [alerts, setAlerts] = useState<EvidenceAlertRow[]>([]);
  const [alertBusy, setAlertBusy] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [alertStatusFilter, setAlertStatusFilter] = useState<
    "active" | "acknowledged" | "dismissed" | "all"
  >("active");


  async function runList(opts?: { page?: number }) {
    setLoading(true);
    setError(null);
    try {
      const nextPage = opts?.page ?? page;
      const res = await fetchAudit({
        data: {
          receiptId: receiptId.trim() || undefined,
          ipHash: ipHash.trim() || undefined,
          reasonCode: reasonCode.trim() || undefined,
          fromIso: toIsoOrUndefined(from),
          toIso: toIsoOrUndefined(to),
          outcome,
          limit: pageSize,
          offset: nextPage * pageSize,
          sortColumn,
          sortDirection,
        },
      });
      setRows(res.rows);
      setTotal(res.total);
      setPage(nextPage);
    } catch (e: any) {
      setError(
        String(e?.message ?? e).includes("Forbidden")
          ? "You need admin access to view this page."
          : String(e?.message ?? e),
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadAlerts(statusOverride?: typeof alertStatusFilter) {
    try {
      const [cfgRes, listRes] = await Promise.all([
        fetchAlertConfig({}),
        fetchAlerts({
          data: { limit: 50, status: statusOverride ?? alertStatusFilter },
        }),
      ]);
      setAlertConfig(cfgRes.config);
      setAlerts(listRes.rows);
    } catch {
      /* admin gate handled by main list */
    }
  }

  async function saveAlerts(partial: Partial<EvidenceAlertConfig>) {
    if (!alertConfig) return;
    setAlertBusy(true);
    setAlertMessage(null);
    try {
      const res = await saveAlertConfig({ data: partial as any });
      setAlertConfig(res.config);
      setAlertMessage("Alert config saved.");
    } catch (e: any) {
      setAlertMessage(String(e?.message ?? e));
    } finally {
      setAlertBusy(false);
    }
  }

  async function actOnAlert(
    id: string,
    action: "acknowledge" | "dismiss" | "reactivate",
  ) {
    setAlertBusy(true);
    setAlertMessage(null);
    try {
      await setAlertStatus({ data: { id, action } });
      await loadAlerts();
      setAlertMessage(`Alert ${action}d.`);
    } catch (e: any) {
      setAlertMessage(String(e?.message ?? e));
    } finally {
      setAlertBusy(false);
    }
  }

  async function runEvaluationNow() {
    setAlertBusy(true);
    setAlertMessage(null);
    try {
      const res: any = await runAlertEval({});
      if (res?.skipped) {
        setAlertMessage("Alerting is disabled.");
      } else {
        setAlertMessage(
          `Evaluated: ${res.verified} verified, ${res.failures} failed (rate ${(res.failure_rate * 100).toFixed(1)}%). ${res.alerts_created.length} alert(s) fired.`,
        );
      }
      await loadAlerts();
    } catch (e: any) {
      setAlertMessage(String(e?.message ?? e));
    } finally {
      setAlertBusy(false);
    }
  }


  async function runMetrics() {
    setMetricsLoading(true);
    try {
      const res = await fetchMetrics({
        data: { hours: metricsHours, bucketMinutes },
      });
      setMetrics(res as any);
    } catch (e) {
      // Silently ignore — the row error surface already communicates auth failures.
    } finally {
      setMetricsLoading(false);
    }
  }

  useEffect(() => {
    runList({ page: initial?.page ?? 0 });
    runMetrics();
    loadAlerts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Re-fetch when sort/page-size changes.
  useEffect(() => {
    runList({ page: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortColumn, sortDirection, pageSize]);

  useEffect(() => {
    runMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricsHours, bucketMinutes]);

  useEffect(() => {
    loadAlerts(alertStatusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertStatusFilter]);

  const filenameBase = useMemo(() => {
    const suffix = receiptId.trim()
      ? `-${receiptId.trim().replace(/[^a-z0-9]/gi, "").slice(0, 16)}`
      : "";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `evidence-audit${suffix}-${stamp}`;
  }, [receiptId]);

  function currentFilters() {
    return {
      receiptId: receiptId.trim() || null,
      ipHash: ipHash.trim() || null,
      reasonCode: reasonCode.trim() || null,
      from: from || null,
      to: to || null,
      outcome,
      pageSize,
      page,
      sortColumn,
      sortDirection,
    };
  }

  function triggerDownload(
    content: string,
    mime: string,
    name: string,
  ) {
    const blob = new Blob([content], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadCsv() {
    triggerDownload(toCsv(rows), "text/csv", `${filenameBase}.csv`);
  }

  function downloadJson() {
    const payload = {
      generated_at: new Date().toISOString(),
      filters: currentFilters(),
      total,
      page,
      page_size: pageSize,
      sort: { column: sortColumn, direction: sortDirection },
      rows,
    };
    triggerDownload(
      JSON.stringify(payload, null, 2),
      "application/json",
      `${filenameBase}.json`,
    );
  }

  async function copyShareLink() {
    const p = new URLSearchParams();
    const f = currentFilters();
    if (f.receiptId) p.set("receiptId", f.receiptId);
    if (f.ipHash) p.set("ipHash", f.ipHash);
    if (f.reasonCode) p.set("reasonCode", f.reasonCode);
    if (f.from) p.set("from", f.from);
    if (f.to) p.set("to", f.to);
    if (f.outcome !== "all") p.set("outcome", f.outcome);
    if (f.pageSize !== 50) p.set("pageSize", String(f.pageSize));
    if (f.page !== 0) p.set("page", String(f.page));
    if (f.sortColumn !== "created_at") p.set("sortColumn", f.sortColumn);
    if (f.sortDirection !== "desc") p.set("sortDirection", f.sortDirection);
    const qs = p.toString();
    const url = `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ""}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied to clipboard.");
    } catch {
      setShareMsg(url);
    }
    window.history.replaceState(null, "", url);
    setTimeout(() => setShareMsg(null), 4000);
  }



  function toggleSort(col: SortColumn) {
    if (col === sortColumn) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(col);
      setSortDirection("desc");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const sortArrow = (col: SortColumn) =>
    col === sortColumn ? (sortDirection === "asc" ? " ▲" : " ▼") : "";

  const maxBucket = useMemo(() => {
    if (!metrics) return 0;
    return metrics.buckets.reduce(
      (m, b) =>
        Math.max(m, b.verified + b.rate_limited + b.errored),
      0,
    );
  }, [metrics]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold mb-2">
        Evidence Verification Audit
      </h1>
      <p className="text-sm text-neutral-600 mb-6">
        Append-only log of every{" "}
        <code>POST /api/public/evidence/verify</code> request. No raw evidence
        or claimed hashes are stored — only receipt IDs, hashed requester IPs,
        user agent, outcome, and signature validity flags.
      </p>

      {/* Metrics panel */}
      <section className="border rounded p-4 mb-8 bg-neutral-50">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-semibold">Abuse & failure metrics</h2>
            <p className="text-xs text-neutral-600">
              Verification failures and throttled (429) counts by hashed IP.
            </p>
          </div>
          <div className="flex gap-2 items-end">
            <label className="text-xs">
              <span className="block text-neutral-700 mb-1">Window</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={metricsHours}
                onChange={(e) => setMetricsHours(Number(e.target.value))}
              >
                <option value={1}>1h</option>
                <option value={6}>6h</option>
                <option value={24}>24h</option>
                <option value={24 * 7}>7d</option>
                <option value={24 * 30}>30d</option>
              </select>
            </label>
            <label className="text-xs">
              <span className="block text-neutral-700 mb-1">Bucket</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={bucketMinutes}
                onChange={(e) =>
                  setBucketMinutes(Number(e.target.value) as 15 | 60 | 360 | 1440)
                }
              >
                <option value={15}>15m</option>
                <option value={60}>1h</option>
                <option value={360}>6h</option>
                <option value={1440}>1d</option>
              </select>
            </label>
            <button
              type="button"
              onClick={runMetrics}
              disabled={metricsLoading}
              className="rounded border border-neutral-400 px-3 py-1 text-sm disabled:opacity-60"
            >
              {metricsLoading ? "…" : "Refresh"}
            </button>
          </div>
        </div>

        {metrics && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4 text-xs">
              <Stat label="Total requests" value={metrics.totals.total} />
              <Stat
                label="Verified"
                value={metrics.totals.verified}
                tone="ok"
              />
              <Stat
                label="Throttled (429)"
                value={metrics.totals.rate_limited}
                tone={metrics.totals.rate_limited > 0 ? "warn" : "muted"}
              />
              <Stat
                label="Failure rate"
                value={`${(metrics.totals.failure_rate * 100).toFixed(1)}%`}
                tone={metrics.totals.failure_rate > 0 ? "warn" : "muted"}
              />
              <Stat
                label="Signature failures"
                value={metrics.totals.sig_failures}
                tone={metrics.totals.sig_failures > 0 ? "warn" : "muted"}
              />
              <Stat
                label="Claim mismatches"
                value={metrics.totals.mismatch_failures}
                tone={metrics.totals.mismatch_failures > 0 ? "warn" : "muted"}
              />
              <Stat
                label="Expired manifest hits"
                value={metrics.totals.expired_failures}
                tone={metrics.totals.expired_failures > 0 ? "warn" : "muted"}
              />
              <Stat label="Errored" value={metrics.totals.errored} />
            </div>

            {/* Sparkline-style bar chart */}
            <div className="mb-4">
              <div className="text-xs text-neutral-700 mb-1">
                Requests per bucket ({bucketMinutes}m)
              </div>
              <div className="flex items-end gap-[2px] h-24 bg-white border rounded p-1">
                {metrics.buckets.length === 0 && (
                  <div className="text-xs text-neutral-500 self-center mx-auto">
                    No data in window
                  </div>
                )}
                {metrics.buckets.map((b) => {
                  const tot = b.verified + b.rate_limited + b.errored;
                  const h = maxBucket > 0 ? (tot / maxBucket) * 100 : 0;
                  const vH = tot > 0 ? (b.verified / tot) * h : 0;
                  const rH = tot > 0 ? (b.rate_limited / tot) * h : 0;
                  const eH = Math.max(0, h - vH - rH);
                  return (
                    <div
                      key={b.bucket_start}
                      title={`${new Date(b.bucket_start).toLocaleString()} — verified ${b.verified}, throttled ${b.rate_limited}, errored ${b.errored}`}
                      className="flex-1 flex flex-col justify-end min-w-[3px]"
                    >
                      <div style={{ height: `${eH}%` }} className="bg-neutral-400" />
                      <div style={{ height: `${rH}%` }} className="bg-amber-500" />
                      <div style={{ height: `${vH}%` }} className="bg-emerald-500" />
                    </div>
                  );
                })}
              </div>
              <div className="text-[10px] text-neutral-500 mt-1 flex gap-3">
                <span><span className="inline-block w-2 h-2 bg-emerald-500 mr-1" />verified</span>
                <span><span className="inline-block w-2 h-2 bg-amber-500 mr-1" />throttled</span>
                <span><span className="inline-block w-2 h-2 bg-neutral-400 mr-1" />errored</span>
              </div>
            </div>

            {/* IP abuse table */}
            <div>
              <div className="text-xs text-neutral-700 mb-1">
                Top hashed IPs by throttle count
              </div>
              <div className="overflow-x-auto border rounded bg-white">
                <table className="min-w-full text-xs">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left p-2">IP hash</th>
                      <th className="text-left p-2">Total</th>
                      <th className="text-left p-2">Throttled</th>
                      <th className="text-left p-2">Sig fail</th>
                      <th className="text-left p-2">Mismatch</th>
                      <th className="text-left p-2">Last seen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.ip_abuse.slice(0, 10).map((r) => (
                      <tr key={r.requester_ip_hash} className="border-t">
                        <td className="p-2 font-mono break-all">
                          {r.requester_ip_hash}
                        </td>
                        <td className="p-2">{r.total}</td>
                        <td className="p-2">{r.rate_limited}</td>
                        <td className="p-2">{r.sig_failures}</td>
                        <td className="p-2">{r.mismatch_failures}</td>
                        <td className="p-2 whitespace-nowrap">
                          {new Date(r.last_seen).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {metrics.ip_abuse.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-3 text-center text-neutral-500">
                          No verification traffic in this window.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Alerts config panel */}
      {alertConfig && (
        <section className="border rounded p-4 mb-8 bg-white">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold">Spike alerts</h2>
              <p className="text-xs text-neutral-600">
                Email notifications when the recent verification failure rate
                or per-IP 429 counts cross configurable thresholds.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={alertConfig.enabled}
                  disabled={alertBusy}
                  onChange={(e) => saveAlerts({ enabled: e.target.checked })}
                />
                Enabled
              </label>
              <button
                type="button"
                onClick={runEvaluationNow}
                disabled={alertBusy}
                className="rounded border border-neutral-400 px-3 py-1 disabled:opacity-60"
              >
                {alertBusy ? "…" : "Check now"}
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3 text-xs">
            <NumField
              label="Failure rate threshold (0–1)"
              step={0.05}
              min={0}
              max={1}
              value={alertConfig.failure_rate_threshold}
              onCommit={(v) => saveAlerts({ failure_rate_threshold: v })}
              disabled={alertBusy}
            />
            <NumField
              label="Throttle count threshold (429s/IP)"
              step={1}
              min={1}
              value={alertConfig.throttle_count_threshold}
              onCommit={(v) => saveAlerts({ throttle_count_threshold: v })}
              disabled={alertBusy}
            />
            <NumField
              label="Window (hours)"
              step={1}
              min={1}
              max={168}
              value={alertConfig.window_hours}
              onCommit={(v) => saveAlerts({ window_hours: v })}
              disabled={alertBusy}
            />
            <NumField
              label="Min sample size"
              step={1}
              min={1}
              value={alertConfig.min_sample_size}
              onCommit={(v) => saveAlerts({ min_sample_size: v })}
              disabled={alertBusy}
            />
            <NumField
              label="Alert cooldown (minutes)"
              step={1}
              min={1}
              value={alertConfig.alert_cooldown_minutes}
              onCommit={(v) => saveAlerts({ alert_cooldown_minutes: v })}
              disabled={alertBusy}
            />
            <label>
              <span className="block mb-1 text-neutral-700">
                Notify email
              </span>
              <input
                type="email"
                className="w-full border rounded px-2 py-1"
                defaultValue={alertConfig.notify_email ?? ""}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v === (alertConfig.notify_email ?? "")) return;
                  saveAlerts({ notify_email: v ? v : null });
                }}
                disabled={alertBusy}
                placeholder="alerts@example.com"
              />
            </label>
          </div>
          {alertMessage && (
            <p className="mt-2 text-xs text-neutral-700">{alertMessage}</p>
          )}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-neutral-700">
                Recent alerts ({alerts.length})
              </div>
              <label className="text-xs flex items-center gap-1">
                Show
                <select
                  className="border rounded px-1 py-0.5"
                  value={alertStatusFilter}
                  onChange={(e) =>
                    setAlertStatusFilter(e.target.value as any)
                  }
                >
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="dismissed">Dismissed</option>
                  <option value="all">All</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left p-2">Fired</th>
                    <th className="text-left p-2">Kind</th>
                    <th className="text-left p-2">Metric</th>
                    <th className="text-left p-2">Threshold</th>
                    <th className="text-left p-2">Sample</th>
                    <th className="text-left p-2">IP hash</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Notified</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleString()}
                      </td>
                      <td className="p-2">{a.kind}</td>
                      <td className="p-2">
                        {a.kind === "failure_rate"
                          ? `${(Number(a.metric_value) * 100).toFixed(1)}%`
                          : String(a.metric_value)}
                      </td>
                      <td className="p-2">
                        {a.kind === "failure_rate"
                          ? `${(Number(a.threshold_value) * 100).toFixed(1)}%`
                          : String(a.threshold_value)}
                      </td>
                      <td className="p-2">{a.sample_size}</td>
                      <td className="p-2 font-mono break-all">
                        {a.requester_ip_hash ?? "—"}
                      </td>
                      <td className="p-2">
                        <AlertStatusBadge status={a.status} />
                        {a.acknowledged_at && (
                          <div className="text-[10px] text-neutral-500">
                            {new Date(a.acknowledged_at).toLocaleString()}
                          </div>
                        )}
                        {a.dismissed_at && (
                          <div className="text-[10px] text-neutral-500">
                            {new Date(a.dismissed_at).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="p-2">{a.notified ? "✓" : "—"}</td>
                      <td className="p-2 whitespace-nowrap">
                        {a.status === "active" ? (
                          <div className="flex gap-1">
                            <button
                              type="button"
                              className="rounded border border-neutral-400 px-2 py-0.5 disabled:opacity-60"
                              disabled={alertBusy}
                              onClick={() => actOnAlert(a.id, "acknowledge")}
                            >
                              Ack
                            </button>
                            <button
                              type="button"
                              className="rounded border border-neutral-400 px-2 py-0.5 disabled:opacity-60"
                              disabled={alertBusy}
                              onClick={() => actOnAlert(a.id, "dismiss")}
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="rounded border border-neutral-400 px-2 py-0.5 disabled:opacity-60"
                            disabled={alertBusy}
                            onClick={() => actOnAlert(a.id, "reactivate")}
                          >
                            Reactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {alerts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-3 text-center text-neutral-500">
                        No alerts in this view.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}


      {/* Filters */}
      <div className="grid gap-3 md:grid-cols-7 mb-4">

        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">Receipt ID</span>
          <input
            className="w-full border rounded px-2 py-1"
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
            placeholder="partial or full"
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">From</span>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">To</span>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">IP hash</span>
          <input
            className="w-full border rounded px-2 py-1"
            value={ipHash}
            onChange={(e) => setIpHash(e.target.value)}
            placeholder="sha256:… partial ok"
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">Reason code</span>
          <select
            className="w-full border rounded px-2 py-1"
            value={reasonCode}
            onChange={(e) => setReasonCode(e.target.value)}
          >
            <option value="">Any</option>
            <option value="not_in_registry">not_in_registry</option>
            <option value="malformed_hash">malformed_hash</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">Outcome</span>
          <select
            className="w-full border rounded px-2 py-1"
            value={outcome}
            onChange={(e) => setOutcome(e.target.value as any)}
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="rate_limited">Rate-limited</option>
            <option value="error">Error</option>
          </select>
        </label>

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => runList({ page: 0 })}
            disabled={loading}
            className="rounded bg-neutral-900 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Loading…" : "Search"}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="rounded border border-neutral-400 px-4 py-2 text-sm disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-700 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between text-xs text-neutral-600 mb-2 gap-2">
        <span>
          {total.toLocaleString()} row{total === 1 ? "" : "s"} • page{" "}
          {page + 1} / {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <label>
            Page size{" "}
            <select
              className="border rounded px-1 py-0.5"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="border rounded px-2 py-0.5 disabled:opacity-40"
            disabled={page === 0 || loading}
            onClick={() => runList({ page: page - 1 })}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="border rounded px-2 py-0.5 disabled:opacity-40"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => runList({ page: page + 1 })}
          >
            Next →
          </button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-xs">
          <thead className="bg-neutral-50">
            <tr>
              <Th onClick={() => toggleSort("created_at")}>
                Created{sortArrow("created_at")}
              </Th>
              <Th onClick={() => toggleSort("receipt_id")}>
                Receipt ID{sortArrow("receipt_id")}
              </Th>
              <Th onClick={() => toggleSort("outcome")}>
                Outcome{sortArrow("outcome")}
              </Th>
              <Th onClick={() => toggleSort("requester_ip_hash")}>
                IP hash{sortArrow("requester_ip_hash")}
              </Th>
              <Th onClick={() => toggleSort("claim_count")}>
                Claims{sortArrow("claim_count")}
              </Th>
              <Th onClick={() => toggleSort("mismatched_claim_count")}>
                Mismatch{sortArrow("mismatched_claim_count")}
              </Th>
              <th className="text-left p-2">Manifest sig</th>
              <th className="text-left p-2">PDF sig</th>
              <th className="text-left p-2">Expired</th>
              <th className="text-left p-2">Reasons</th>
              <th className="text-left p-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-2 font-mono">
                  {r.receipt_id === "rate_limited" ? (
                    <span className="text-amber-700">rate_limited</span>
                  ) : (
                    r.receipt_id
                  )}
                </td>
                <td className="p-2">
                  <OutcomeBadge outcome={r.outcome} />
                </td>
                <td className="p-2 font-mono break-all">
                  {r.requester_ip_hash ?? "—"}
                </td>
                <td className="p-2">{r.claim_count}</td>
                <td className="p-2">
                  {r.mismatched_claim_count > 0 ? (
                    <span className="text-red-700">
                      {r.mismatched_claim_count}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2">
                  {r.manifest_signature_valid ? "✓" : "✗"}
                </td>
                <td className="p-2">{r.pdf_signature_valid ? "✓" : "✗"}</td>
                <td className="p-2">{r.manifest_expired ? "⚠︎" : "—"}</td>
                <td className="p-2 text-[11px]">
                  {(r.mismatch_reason_codes ?? []).join(", ") || "—"}
                </td>
                <td className="p-2">
                  {r.receipt_id !== "rate_limited" && (
                    <Link
                      to="/evidence/receipt/$receiptId"
                      params={{ receiptId: r.receipt_id }}
                      className="text-blue-700 underline"
                    >
                      Detail
                    </Link>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={11} className="p-4 text-center text-neutral-500">
                  No audit entries match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Th({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <th
      onClick={onClick}
      className="text-left p-2 cursor-pointer select-none hover:bg-neutral-100"
    >
      {children}
    </th>
  );
}

function OutcomeBadge({ outcome }: { outcome: EvidenceAuditRow["outcome"] }) {
  const cls =
    outcome === "verified"
      ? "bg-emerald-100 text-emerald-800"
      : outcome === "rate_limited"
        ? "bg-amber-100 text-amber-800"
        : "bg-red-100 text-red-800";
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-[10px] ${cls}`}>
      {outcome}
    </span>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "ok" | "warn" | "muted";
}) {
  const toneCls =
    tone === "ok"
      ? "text-emerald-700"
      : tone === "warn"
        ? "text-amber-700"
        : tone === "muted"
          ? "text-neutral-500"
          : "text-neutral-900";
  return (
    <div className="border rounded bg-white p-2">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div className={`text-lg font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}

function NumField({
  label,
  value,
  onCommit,
  step = 1,
  min,
  max,
  disabled,
}: {
  label: string;
  value: number;
  onCommit: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}) {
  const [local, setLocal] = useState<string>(String(value));
  useEffect(() => setLocal(String(value)), [value]);
  return (
    <label>
      <span className="block mb-1 text-neutral-700">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        max={max}
        value={local}
        disabled={disabled}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => {
          const n = Number(local);
          if (Number.isFinite(n) && n !== value) onCommit(n);
        }}
        className="w-full border rounded px-2 py-1"
      />
    </label>
  );
}
