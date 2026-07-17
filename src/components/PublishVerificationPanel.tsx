import { useEffect, useMemo, useState } from "react";

type VerifyResult = {
  slug: string;
  url: string;
  status: number;
  match: boolean;
  fallback: boolean;
  expected: { title: string; canonical: string; ogUrl: string };
  actual: { title: string | null; canonical: string | null; ogUrl: string | null };
  diffs: string[];
  error?: string;
};

type VerifySummary = {
  origin: string;
  checkedAt: string;
  total: number;
  matched: number;
  mismatched: number;
  allMatched: boolean;
  results: VerifyResult[];
};

type Props = {
  /** Blog slugs to verify. Empty = 10 most recent posts. */
  slugs?: string[];
  /** Production origin to probe. Defaults to https://weddings.io. */
  origin?: string;
  /** Auto-poll interval (ms). 0 or omitted = manual only. */
  pollIntervalMs?: number;
  /** Stop polling after allMatched is true. Default: true. */
  stopWhenMatched?: boolean;
};

/**
 * Live production verification panel.
 *
 * Polls /api/public/verify-posts and shows per-URL match / fallback / diff.
 * Success = the deployed bundle on {origin} is serving the same title,
 * canonical, and og:url that this build expects. Failure with
 * fallback=true means production is on an older build that doesn't
 * contain the post.
 */
export function PublishVerificationPanel({
  slugs,
  origin,
  pollIntervalMs = 15000,
  stopWhenMatched = true,
}: Props) {
  const [data, setData] = useState<VerifySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoPoll, setAutoPoll] = useState(pollIntervalMs > 0);

  const query = useMemo(() => {
    const p = new URLSearchParams();
    for (const s of slugs ?? []) p.append("slug", s);
    if (origin) p.set("origin", origin);
    const q = p.toString();
    return q ? `?${q}` : "";
  }, [slugs, origin]);

  async function runCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/verify-posts${query}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as VerifySummary;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!autoPoll || pollIntervalMs <= 0) return;
    if (stopWhenMatched && data?.allMatched) return;
    const t = setInterval(() => void runCheck(), pollIntervalMs);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPoll, pollIntervalMs, stopWhenMatched, data?.allMatched, query]);

  return (
    <section className="mt-10 rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Production publish verification
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Polls production for expected title, canonical, and og:url.
            {data && ` · ${data.matched}/${data.total} matched`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={autoPoll}
              onChange={(e) => setAutoPoll(e.target.checked)}
              className="h-3 w-3"
            />
            Auto-poll {Math.round(pollIntervalMs / 1000)}s
          </label>
          <button
            type="button"
            onClick={() => void runCheck()}
            disabled={loading}
            className="rounded border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            {loading ? "Checking…" : "Re-check now"}
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {data && (
        <>
          <div
            className={`mt-4 rounded border p-3 text-sm ${
              data.allMatched
                ? "border-green-500/40 bg-green-500/10 text-green-500"
                : "border-yellow-500/40 bg-yellow-500/10 text-yellow-500"
            }`}
          >
            {data.allMatched
              ? `✓ All ${data.total} URL(s) match on ${data.origin}`
              : `⚠ ${data.mismatched} of ${data.total} URL(s) mismatched on ${data.origin} — publish likely still rolling out`}
            <span className="ml-2 text-xs opacity-70">
              checked {new Date(data.checkedAt).toLocaleTimeString()}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {data.results.map((r) => (
              <li
                key={r.slug}
                className="rounded border border-border bg-background/50 p-3 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-foreground hover:underline"
                  >
                    /blog/{r.slug}/
                  </a>
                  <span
                    className={`rounded px-2 py-0.5 font-semibold ${
                      r.match
                        ? "bg-green-500/20 text-green-500"
                        : r.fallback
                          ? "bg-destructive/20 text-destructive"
                          : "bg-yellow-500/20 text-yellow-500"
                    }`}
                  >
                    {r.match ? "MATCH" : r.fallback ? "FALLBACK ON PROD" : "MISMATCH"}
                    {" · "}HTTP {r.status}
                  </span>
                </div>
                {r.diffs.length > 0 && (
                  <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                    {r.diffs.map((d, i) => (
                      <li key={i} className="break-words font-mono">
                        {d}
                      </li>
                    ))}
                  </ul>
                )}
                {r.error && <p className="mt-2 text-destructive">error: {r.error}</p>}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
