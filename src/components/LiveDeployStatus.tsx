import { useEffect, useState } from "react";
import {
  fetchBuildInfo,
  type BuildInfoResponse,
} from "@/lib/noCacheFetch";
import {
  BUILD_COMMIT_FULL,
  BUILD_COMMIT_SHORT,
  BUILD_TIME_ISO,
} from "@/lib/buildInfo";

type Status = "loading" | "ok" | "error";

export function LiveDeployStatus() {
  const [status, setStatus] = useState<Status>("loading");
  const [info, setInfo] = useState<BuildInfoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);

  const run = async () => {
    setStatus("loading");
    setError(null);
    try {
      const data = await fetchBuildInfo();
      setInfo(data);
      setStatus("ok");
      setCheckedAt(new Date().toISOString());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setStatus("error");
    }
  };

  useEffect(() => {
    run();
    const id = window.setInterval(run, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const commitMatch =
    info && info.commit === BUILD_COMMIT_FULL ? "match" : info ? "stale" : null;

  return (
    <section className="mt-10 rounded-lg border border-primary/40 bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Live edge (your region)
        </p>
        <button
          onClick={run}
          className="rounded-md border border-border bg-background px-3 py-1 text-xs hover:border-primary"
        >
          Re-check
        </button>
      </div>

      {status === "loading" && (
        <p className="mt-4 text-sm text-muted-foreground">Checking edge…</p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-destructive">Edge check failed: {error}</p>
      )}
      {status === "ok" && info && (
        <dl className="mt-4 grid gap-3 text-sm md:grid-cols-[180px_1fr]">
          <dt className="text-muted-foreground">Live commit</dt>
          <dd className="font-mono text-foreground">
            {info.commitShort}
            <span
              className={`ml-2 rounded px-2 py-0.5 text-xs ${
                commitMatch === "match"
                  ? "bg-primary/15 text-primary"
                  : "bg-destructive/15 text-destructive"
              }`}
            >
              {commitMatch === "match" ? "matches bundle" : "STALE vs bundle"}
            </span>
          </dd>
          <dt className="text-muted-foreground">Bundle commit</dt>
          <dd className="font-mono text-xs text-muted-foreground">
            {BUILD_COMMIT_SHORT} · {BUILD_TIME_ISO}
          </dd>
          <dt className="text-muted-foreground">Edge colo</dt>
          <dd className="font-mono text-foreground">
            {info.edge.colo ?? "—"}
            {info.edge.country ? ` · ${info.edge.country}` : ""}
          </dd>
          <dt className="text-muted-foreground">Host</dt>
          <dd className="font-mono text-xs text-foreground">{info.host}</dd>
          <dt className="text-muted-foreground">Served at</dt>
          <dd className="font-mono text-xs text-muted-foreground">
            {info.servedAtIso}
          </dd>
          <dt className="text-muted-foreground">Last check</dt>
          <dd className="font-mono text-xs text-muted-foreground">
            {checkedAt ?? "—"}
          </dd>
        </dl>
      )}
    </section>
  );
}
