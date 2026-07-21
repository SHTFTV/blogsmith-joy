import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

/**
 * Internal dashboard for the production /seo/health batch job.
 *
 * - "Live" tab: calls /seo/health/batch on demand against the chosen origin
 *   and renders per-slug ok / failed / diffs.
 * - "History" tab: reads /seo-health/history.json (written by
 *   scripts/scheduled-seo-health.mjs, published as a static asset) and shows
 *   the last runs with per-slug alert timeline.
 *
 * Noindex — internal only.
 */
export const Route = createFileRoute("/admin/seo-health")({
  head: () => ({
    meta: [
      { title: "SEO Health Dashboard | Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: SeoHealthPage,
});

type Diff = { field: string; expected?: unknown; actual?: unknown };
type Result = {
  slug: string;
  ok: boolean;
  liveStatus?: number | null;
  status?: number;
  diffs: Diff[];
  imageHash?: { expected?: string | null; live?: string | null; match?: boolean | null } | null;
  error?: string | null;
};
type BatchReport = {
  ok: boolean;
  origin: string;
  checkedAt: string;
  total: number;
  failed: number;
  results: Result[];
};
type HistoryRun = {
  checkedAt: string;
  origin: string;
  ok: boolean;
  total: number;
  failed: number;
  runUrl: string | null;
  results: Result[];
};

function SeoHealthPage() {
  const [tab, setTab] = useState<"live" | "history">("live");
  const [origin, setOrigin] = useState("https://weddings.io");
  const [report, setReport] = useState<BatchReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryRun[]>([]);

  const runBatch = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(`/seo/health/batch?origin=${encodeURIComponent(origin)}`, { cache: "no-store" });
      const b = (await r.json()) as BatchReport;
      setReport(b);
    } catch (e: any) { setErr(e?.message ?? String(e)); }
    finally { setLoading(false); }
  };

  useEffect(() => { runBatch(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);
  useEffect(() => {
    fetch("/seo-health/history.json", { cache: "no-store" })
      .then(r => r.ok ? r.json() : { runs: [] })
      .then((h) => setHistory(Array.isArray(h?.runs) ? h.runs : []))
      .catch(() => setHistory([]));
  }, []);

  const alertsBySlug = useMemo(() => {
    const map = new Map<string, { checkedAt: string; ok: boolean; diffs: Diff[]; error?: string | null }[]>();
    for (const run of history) {
      for (const r of run.results ?? []) {
        if (!map.has(r.slug)) map.set(r.slug, []);
        map.get(r.slug)!.push({ checkedAt: run.checkedAt, ok: r.ok, diffs: r.diffs ?? [], error: r.error ?? null });
      }
    }
    return map;
  }, [history]);

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">SEO Health Dashboard</h1>
          <p className="text-sm text-muted-foreground">Production /seo/health batch results, diffs & alert history.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setTab("live")} className={`px-3 py-1.5 rounded text-sm border ${tab === "live" ? "bg-primary text-primary-foreground" : ""}`}>Live</button>
          <button onClick={() => setTab("history")} className={`px-3 py-1.5 rounded text-sm border ${tab === "history" ? "bg-primary text-primary-foreground" : ""}`}>History</button>
        </div>
      </header>

      {tab === "live" && (
        <section className="space-y-4">
          <div className="flex gap-2 items-center">
            <input value={origin} onChange={(e) => setOrigin(e.target.value)} className="border rounded px-2 py-1 text-sm w-80" />
            <button onClick={runBatch} disabled={loading} className="px-3 py-1.5 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50">
              {loading ? "Checking…" : "Run batch"}
            </button>
            {report && (
              <span className={`text-sm ${report.ok ? "text-green-600" : "text-red-600"}`}>
                {report.ok ? "✅ all healthy" : `❌ ${report.failed}/${report.total} failing`} · {new Date(report.checkedAt).toLocaleString()}
              </span>
            )}
          </div>
          {err && <div className="text-red-600 text-sm">{err}</div>}
          {report && (
            <div className="border rounded divide-y">
              {report.results.map((r) => (
                <details key={r.slug} className="p-3" open={!r.ok}>
                  <summary className="cursor-pointer flex justify-between items-center">
                    <span className="font-mono text-sm">{r.slug}</span>
                    <span className={`text-xs ${r.ok ? "text-green-600" : "text-red-600"}`}>
                      {r.ok ? "OK" : `${r.diffs?.length ?? 0} diff(s) · HTTP ${r.liveStatus ?? r.status ?? "?"}`}
                    </span>
                  </summary>
                  {!r.ok && (
                    <div className="mt-2 space-y-1 text-xs">
                      {r.error && <div className="text-red-600">Error: {r.error}</div>}
                      {(r.diffs ?? []).map((d, i) => (
                        <div key={i} className="grid grid-cols-3 gap-2 font-mono">
                          <span className="text-muted-foreground">{d.field}</span>
                          <span className="truncate" title={String(d.expected ?? "")}>exp: {String(d.expected ?? "")}</span>
                          <span className="truncate text-red-600" title={String(d.actual ?? "")}>got: {String(d.actual ?? "")}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </div>
          )}
        </section>
      )}

      {tab === "history" && (
        <section className="space-y-6">
          <div className="text-sm text-muted-foreground">
            {history.length
              ? `Last ${history.length} scheduled run(s).`
              : "No history yet. Scheduled runs write to public/seo-health/history.json."}
          </div>

          <div>
            <h2 className="font-semibold mb-2">Recent runs</h2>
            <div className="border rounded divide-y text-sm">
              {history.slice(0, 20).map((run, i) => (
                <div key={i} className="p-2 flex justify-between">
                  <span>{new Date(run.checkedAt).toLocaleString()} · {run.origin}</span>
                  <span className={run.ok ? "text-green-600" : "text-red-600"}>
                    {run.ok ? "OK" : `${run.failed}/${run.total} failing`}
                    {run.runUrl && <> · <a className="underline" href={run.runUrl} target="_blank" rel="noreferrer">run</a></>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-semibold mb-2">Alerts by slug</h2>
            <div className="border rounded divide-y">
              {[...alertsBySlug.entries()].map(([slug, events]) => {
                const failures = events.filter((e) => !e.ok);
                return (
                  <details key={slug} className="p-3" open={failures.length > 0}>
                    <summary className="cursor-pointer flex justify-between">
                      <span className="font-mono text-sm">{slug}</span>
                      <span className="text-xs">{failures.length} alert(s) / {events.length} run(s)</span>
                    </summary>
                    <ul className="mt-2 space-y-1 text-xs">
                      {events.slice(0, 10).map((e, i) => (
                        <li key={i} className={e.ok ? "text-muted-foreground" : "text-red-600"}>
                          {new Date(e.checkedAt).toLocaleString()} — {e.ok ? "OK" : (e.error || `${e.diffs.length} diff(s): ${e.diffs.map(d => d.field).join(", ")}`)}
                        </li>
                      ))}
                    </ul>
                  </details>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
