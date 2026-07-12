import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import {
  repushStaleDomains,
  listDomainRepushAudit,
} from "@/lib/domainAdmin.functions";
import type { DomainStatusReport } from "@/lib/domainStatus";
import { BUILD_COMMIT_FULL } from "@/lib/buildInfo";

export const Route = createFileRoute("/admin/domain-status")({
  head: () => ({
    meta: [
      { title: "Domain Status Dashboard | Weddings.io Admin" },
      {
        name: "description",
        content: "Live per-domain build match/stale/error status with repush controls.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DomainStatusPage,
});

type TargetResult = {
  url: string;
  label: string;
  before_status: "match" | "stale" | "error";
  after_status: "match" | "stale" | "error";
  recovered: boolean;
};

type AuditRow = {
  id: string;
  run_at: string;
  triggered_by: string | null;
  bundle_commit_short: string;
  targets_total: number;
  targets_recovered: number;
  targets_still_stale: number;
  targets: TargetResult[];
  notes: string | null;
};

type PerDomainEntry = {
  auditId: string;
  run_at: string;
  triggered_by: string | null;
  bundle_commit_short: string;
  notes: string | null;
  target: TargetResult;
};

const REFRESH_OPTIONS = [10, 30, 60, 300];
const PAGE_SIZES = [10, 25, 50, 100];

function DomainStatusPage() {
  const [report, setReport] = useState<DomainStatusReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [intervalSec, setIntervalSec] = useState(30);

  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditPageSize, setAuditPageSize] = useState(25);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [domainFilter, setDomainFilter] = useState<string>("");
  const [auditLoading, setAuditLoading] = useState(false);

  const [repushing, setRepushing] = useState(false);
  const [repushMsg, setRepushMsg] = useState<string | null>(null);
  const [waitingForMatch, setWaitingForMatch] = useState(false);
  const timer = useRef<number | null>(null);

  const listAudit = useServerFn(listDomainRepushAudit);
  const repush = useServerFn(repushStaleDomains);

  const fetchStatus = useCallback(async (opts?: { wait?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("expectedCommit", BUILD_COMMIT_FULL);
      if (opts?.wait) {
        params.set("wait", "1");
        params.set("timeoutMs", "90000");
        params.set("intervalMs", "3000");
      }
      const qs = params.toString();
      const res = await fetch(
        `/api/public/domain-status${qs ? `?${qs}` : ""}`,
        { cache: "no-store", headers: { "cache-control": "no-cache" } },
      );
      const body = await res.json();
      if (!res.ok || body?.ok === false) {
        const msg =
          body?.details?.map((d: any) => `${d.param}: ${d.message}`).join("; ") ||
          body?.error ||
          `HTTP ${res.status}`;
        throw new Error(msg);
      }
      setReport(body as DomainStatusReport);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAudit = useCallback(async () => {
    setAuditLoading(true);
    try {
      const res = await listAudit({
        data: {
          page: auditPage,
          pageSize: auditPageSize,
          domainUrl: domainFilter || undefined,
        },
      });
      setAudit(res.rows as AuditRow[]);
      setAuditTotal(res.total);
      setAuditTotalPages(res.totalPages);
    } catch {
      // silent — usually just "Forbidden" for non-admins
    } finally {
      setAuditLoading(false);
    }
  }, [listAudit, auditPage, auditPageSize, domainFilter]);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (!autoRefresh) return;
    timer.current = window.setInterval(() => {
      void fetchStatus();
    }, intervalSec * 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [autoRefresh, intervalSec, fetchStatus]);

  // Flatten audit rows to per-domain entries; server has already filtered
  // rows containing the target domain, so we filter individual entries here.
  const perDomainEntries = useMemo<PerDomainEntry[]>(() => {
    const out: PerDomainEntry[] = [];
    for (const row of audit) {
      for (const t of row.targets ?? []) {
        if (domainFilter && t.url !== domainFilter) continue;
        out.push({
          auditId: row.id,
          run_at: row.run_at,
          triggered_by: row.triggered_by,
          bundle_commit_short: row.bundle_commit_short,
          notes: row.notes,
          target: t,
        });
      }
    }
    return out;
  }, [audit, domainFilter]);

  const domainOptions = useMemo(() => {
    return report?.domains.map((d) => ({ url: d.url, label: d.label })) ?? [];
  }, [report]);

  const runWaitForMatch = async () => {
    setWaitingForMatch(true);
    try {
      await fetchStatus({ wait: true });
    } finally {
      setWaitingForMatch(false);
    }
  };

  const runRepush = async () => {
    const stale = report?.domains.filter((d) => d.status !== "match") ?? [];
    if (stale.length === 0) {
      setRepushMsg("Nothing to repush — all domains match.");
      return;
    }
    const ok = window.confirm(
      `Repush ${stale.length} stale/error domain(s)?\n\n` +
        stale.map((d) => `  • ${d.label} (${d.status})`).join("\n") +
        `\n\nThis primes each edge with cache-busting probes and writes an audit row.`,
    );
    if (!ok) return;
    const notes = window.prompt("Optional note for the audit log:", "") ?? undefined;
    setRepushing(true);
    setRepushMsg(null);
    try {
      const result = await repush({
        data: { confirm: true, notes: notes || undefined },
      });
      setRepushMsg(
        `Repushed ${result.targets.length} · recovered ${result.recovered} · still stale ${result.stillStale}`,
      );
      setReport(result.after as DomainStatusReport);
      setAuditPage(1);
      void loadAudit();
    } catch (e) {
      setRepushMsg(`Repush failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRepushing(false);
    }
  };

  const badge = (status: "match" | "stale" | "error") => {
    const cls =
      status === "match"
        ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
        : status === "stale"
          ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
          : "bg-red-500/15 text-red-700 border-red-500/30";
    return (
      <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
        {status}
      </span>
    );
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold">Domain Status</h1>
        <p className="mt-2 text-muted-foreground">
          Live per-domain check against the current bundle. Auto-refreshes and
          lets admins repush stale edges.
        </p>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
          <button
            onClick={() => void fetchStatus()}
            disabled={loading}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {loading ? "Checking…" : "Check now"}
          </button>
          <button
            onClick={() => void runWaitForMatch()}
            disabled={waitingForMatch}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
          >
            {waitingForMatch ? "Waiting for match…" : "Wait for match (90s)"}
          </button>
          <button
            onClick={() => void runRepush()}
            disabled={repushing || !report}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-500/20 disabled:opacity-50"
          >
            {repushing ? "Repushing…" : "Repush stale/error"}
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <select
              value={intervalSec}
              onChange={(e) => setIntervalSec(Number(e.target.value))}
              className="rounded border border-border bg-background px-2 py-1"
            >
              {REFRESH_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  every {n}s
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {repushMsg && (
          <div className="mt-4 rounded border border-border bg-muted p-3 text-sm">
            {repushMsg}
          </div>
        )}

        {/* Expected bundle */}
        {report && (
          <div className="mt-6 rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <div>
                <span className="text-muted-foreground">Expected commit:</span>{" "}
                <code className="font-mono">{report.expected.commitShort}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Built:</span>{" "}
                {report.expected.buildTimeLabel}
              </div>
              <div>
                <span className="text-muted-foreground">Checked:</span>{" "}
                {new Date(report.checkedAtIso).toLocaleTimeString()}
              </div>
              <div>
                <span className="text-muted-foreground">Summary:</span>{" "}
                <span className="text-emerald-700">{report.summary.match} match</span>
                {" · "}
                <span className="text-amber-700">{report.summary.stale} stale</span>
                {" · "}
                <span className="text-red-700">{report.summary.error} error</span>
              </div>
              {report.waited && (
                <div className="text-muted-foreground">
                  Waited {Math.round(report.waited.elapsedMs / 1000)}s ·{" "}
                  {report.waited.attempts} attempts{" "}
                  {report.waited.timedOut ? "· timed out" : "· matched"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Domain grid */}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {report?.domains.map((d) => (
            <div
              key={d.url}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold">{d.label}</div>
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    {d.url}
                  </a>
                </div>
                {badge(d.status)}
              </div>
              <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Commit</dt>
                <dd className="font-mono">{d.detected.commitShort ?? "—"}</dd>
                <dt className="text-muted-foreground">Signal</dt>
                <dd>{d.source ?? "—"}</dd>
                <dt className="text-muted-foreground">Built</dt>
                <dd>{d.detected.buildTimeLabel ?? "—"}</dd>
                <dt className="text-muted-foreground">Served</dt>
                <dd>
                  {d.detected.servedAtIso
                    ? new Date(d.detected.servedAtIso).toLocaleTimeString()
                    : "—"}
                </dd>
                <dt className="text-muted-foreground">Edge</dt>
                <dd>
                  {d.edge.colo ?? "—"}
                  {d.edge.country ? ` · ${d.edge.country}` : ""}
                </dd>
                <dt className="text-muted-foreground">Latency</dt>
                <dd>{d.latencyMs}ms</dd>
                {d.error && (
                  <>
                    <dt className="text-muted-foreground">Error</dt>
                    <dd className="text-red-700">{d.error}</dd>
                  </>
                )}
              </dl>
            </div>
          ))}
        </div>

        {/* Per-domain audit log */}
        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Per-domain repush audit</h2>
              <p className="text-xs text-muted-foreground">
                Flattened one row per (repush, domain) pair. Filter by domain and
                paginate.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <label>
                <span className="mr-1 text-muted-foreground">Domain:</span>
                <select
                  value={domainFilter}
                  onChange={(e) => {
                    setDomainFilter(e.target.value);
                    setAuditPage(1);
                  }}
                  className="rounded border border-border bg-background px-2 py-1"
                >
                  <option value="">All domains</option>
                  {domainOptions.map((d) => (
                    <option key={d.url} value={d.url}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mr-1 text-muted-foreground">Per page:</span>
                <select
                  value={auditPageSize}
                  onChange={(e) => {
                    setAuditPageSize(Number(e.target.value));
                    setAuditPage(1);
                  }}
                  className="rounded border border-border bg-background px-2 py-1"
                >
                  {PAGE_SIZES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {auditLoading ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading audit…</p>
          ) : perDomainEntries.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No repush entries yet (or you're not an admin).
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted text-left">
                  <tr>
                    <th className="px-3 py-2">When</th>
                    <th className="px-3 py-2">Domain</th>
                    <th className="px-3 py-2">Before → After</th>
                    <th className="px-3 py-2">Result</th>
                    <th className="px-3 py-2">Bundle</th>
                    <th className="px-3 py-2">Triggered by</th>
                    <th className="px-3 py-2">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {perDomainEntries.map((e, i) => (
                    <tr key={`${e.auditId}-${e.target.url}-${i}`} className="border-t border-border">
                      <td className="px-3 py-2 whitespace-nowrap">
                        {new Date(e.run_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{e.target.label}</td>
                      <td className="px-3 py-2">
                        <span className="mr-1">{badge(e.target.before_status)}</span>
                        <span className="text-muted-foreground">→</span>{" "}
                        {badge(e.target.after_status)}
                      </td>
                      <td className="px-3 py-2">
                        {e.target.recovered ? (
                          <span className="font-semibold text-emerald-700">Recovered</span>
                        ) : (
                          <span className="font-semibold text-amber-700">Still stale</span>
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{e.bundle_commit_short}</td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {e.triggered_by ? e.triggered_by.slice(0, 8) : "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{e.notes ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {auditTotal === 0
                ? "0 audit rows"
                : `Page ${auditPage} of ${auditTotalPages} · ${auditTotal} audit rows`}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                disabled={auditPage <= 1 || auditLoading}
                className="rounded border border-border bg-background px-2 py-1 disabled:opacity-40"
              >
                ← Prev
              </button>
              <button
                onClick={() => setAuditPage((p) => Math.min(auditTotalPages, p + 1))}
                disabled={auditPage >= auditTotalPages || auditLoading}
                className="rounded border border-border bg-background px-2 py-1 disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
