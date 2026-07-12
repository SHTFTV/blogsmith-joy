import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { fetchBuildInfo, noCacheFetch, type BuildInfoResponse } from "@/lib/noCacheFetch";
import { BUILD_COMMIT_FULL, BUILD_COMMIT_SHORT, BUILD_TIME_ISO } from "@/lib/buildInfo";
import { supabase } from "@/integrations/supabase/client";

type HistoryRow = {
  id: string;
  run_at: string;
  bundle_commit_short: string;
  origins_checked: number;
  match_count: number;
  stale_count: number;
  error_count: number;
  alert_sent: boolean;
  alert_error: string | null;
};

export const Route = createFileRoute("/admin/propagation")({
  head: () => ({
    meta: [
      { title: "Edge Propagation Watchdog | Weddings.io" },
      { name: "description", content: "Continuously polls every published origin to detect stale edge caches." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PropagationPage,
});

const DEFAULT_ORIGINS: Array<{ url: string; label: string }> = [
  { url: "https://weddings.io", label: "weddings.io (apex)" },
  { url: "https://www.weddings.io", label: "www.weddings.io" },
  { url: "https://blogsmith-joy.lovable.app", label: "blogsmith-joy.lovable.app" },
  { url: "https://project--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app", label: "project stable URL" },
];

type CheckState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; info: BuildInfoResponse; at: string; latencyMs: number }
  | { status: "error"; at: string; error: string; latencyMs: number };

function PropagationPage() {
  const [origins, setOrigins] = useState(DEFAULT_ORIGINS);
  const [state, setState] = useState<Record<string, CheckState>>({});
  const [intervalSec, setIntervalSec] = useState(30);
  const [running, setRunning] = useState(true);
  const [newOrigin, setNewOrigin] = useState("");
  const timer = useRef<number | null>(null);

  const bundleCommit = BUILD_COMMIT_FULL;

  const check = async (url: string) => {
    setState((s) => ({ ...s, [url]: { status: "loading" } }));
    const started = performance.now();
    try {
      const info = await fetchBuildInfo(url);
      const latency = Math.round(performance.now() - started);
      setState((s) => ({
        ...s,
        [url]: { status: "ok", info, at: new Date().toISOString(), latencyMs: latency },
      }));
    } catch (e) {
      const latency = Math.round(performance.now() - started);
      setState((s) => ({
        ...s,
        [url]: {
          status: "error",
          at: new Date().toISOString(),
          error: e instanceof Error ? e.message : String(e),
          latencyMs: latency,
        },
      }));
    }
  };

  const runAll = () => {
    origins.forEach((o) => void check(o.url));
  };

  useEffect(() => {
    runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origins]);

  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (!running) return;
    timer.current = window.setInterval(runAll, Math.max(5, intervalSec) * 1000);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intervalSec, running, origins]);

  const summary = useMemo(() => {
    let match = 0;
    let stale = 0;
    let err = 0;
    for (const o of origins) {
      const s = state[o.url];
      if (!s || s.status === "loading" || s.status === "idle") continue;
      if (s.status === "error") err++;
      else if (s.info.commit === bundleCommit) match++;
      else stale++;
    }
    return { match, stale, err };
  }, [state, origins, bundleCommit]);

  const addOrigin = () => {
    const v = newOrigin.trim().replace(/\/$/, "");
    if (!/^https?:\/\//i.test(v)) return;
    if (origins.some((o) => o.url === v)) return;
    setOrigins((prev) => [...prev, { url: v, label: v.replace(/^https?:\/\//, "") }]);
    setNewOrigin("");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Watchdog</p>
        <h1 className="font-serif text-4xl md:text-5xl">Edge propagation monitor</h1>
        <p className="mt-4 text-muted-foreground">
          Polls every configured origin using no-store fetches with cache-busting query strings.
          If an origin returns a commit older than the bundle you're viewing, that edge is stale.
        </p>

        <section className="mt-8 rounded-lg border border-primary/40 bg-card p-6">
          <div className="grid gap-3 text-sm md:grid-cols-[220px_1fr]">
            <div className="text-muted-foreground">Bundle commit</div>
            <div className="font-mono text-foreground">
              {BUILD_COMMIT_SHORT} · {BUILD_TIME_ISO}
            </div>
            <div className="text-muted-foreground">Summary</div>
            <div className="font-mono">
              <span className="text-primary">{summary.match} match</span>
              {" · "}
              <span className="text-destructive">{summary.stale} stale</span>
              {" · "}
              <span className="text-muted-foreground">{summary.err} errored</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
            <label className="flex items-center gap-2">
              <span className="text-muted-foreground">Interval (s)</span>
              <input
                type="number"
                min={5}
                value={intervalSec}
                onChange={(e) => setIntervalSec(Number(e.target.value) || 30)}
                className="w-20 rounded border border-border bg-background px-2 py-1"
              />
            </label>
            <button
              onClick={() => setRunning((r) => !r)}
              className="rounded-md border border-border bg-background px-3 py-1 hover:border-primary"
            >
              {running ? "Pause" : "Resume"}
            </button>
            <button
              onClick={runAll}
              className="rounded-md border border-primary/60 bg-background px-3 py-1 text-primary hover:bg-primary/10"
            >
              Check now
            </button>
          </div>
        </section>

        <section className="mt-8 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Origin</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Commit</th>
                <th className="px-4 py-3 text-left">Edge colo</th>
                <th className="px-4 py-3 text-left">Latency</th>
                <th className="px-4 py-3 text-left">Checked</th>
              </tr>
            </thead>
            <tbody>
              {origins.map((o) => {
                const s = state[o.url];
                return (
                  <tr key={o.url} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{o.label}</div>
                      <div className="font-mono text-xs text-muted-foreground break-all">{o.url}</div>
                    </td>
                    <td className="px-4 py-3">
                      {!s || s.status === "loading" || s.status === "idle" ? (
                        <span className="text-muted-foreground">…</span>
                      ) : s.status === "error" ? (
                        <span className="rounded bg-destructive/15 px-2 py-0.5 text-xs text-destructive">error</span>
                      ) : s.info.commit === bundleCommit ? (
                        <span className="rounded bg-primary/15 px-2 py-0.5 text-xs text-primary">match</span>
                      ) : (
                        <span className="rounded bg-destructive/15 px-2 py-0.5 text-xs text-destructive">stale</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {s && s.status === "ok" ? s.info.commitShort : s && s.status === "error" ? "—" : "…"}
                      {s && s.status === "error" && (
                        <div className="mt-1 text-destructive">{s.error}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {s && s.status === "ok"
                        ? `${s.info.edge.colo ?? "—"}${s.info.edge.country ? " · " + s.info.edge.country : ""}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {s && (s.status === "ok" || s.status === "error") ? `${s.latencyMs}ms` : "—"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {s && (s.status === "ok" || s.status === "error") ? s.at : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <section className="mt-6 flex flex-wrap items-center gap-2 text-sm">
          <input
            value={newOrigin}
            onChange={(e) => setNewOrigin(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 min-w-[240px] rounded border border-border bg-background px-3 py-2"
          />
          <button
            onClick={addOrigin}
            className="rounded-md border border-primary/60 bg-background px-3 py-2 text-primary hover:bg-primary/10"
          >
            Add origin
          </button>
        </section>

        <p className="mt-6 text-xs text-muted-foreground">
          Note: cross-origin checks depend on each origin exposing /api/public/build-info with CORS.
          Origins that block CORS will show as errored even if healthy.
        </p>
      </article>
    </main>
  );
}
