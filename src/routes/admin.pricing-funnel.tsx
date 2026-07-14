import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getPricingCalculatorFunnel,
  type FunnelResponse,
  type FunnelRow,
} from "@/lib/pricingFunnel.functions";

export const Route = createFileRoute("/admin/pricing-funnel")({
  head: () => ({
    meta: [
      { title: "Pricing Calculator Funnel | Weddings.io Admin" },
      {
        name: "description",
        content: "Impression → form change → submission funnel for the pricing calculator, by entry page.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PricingFunnelPage,
});

type Preset = "24h" | "7d" | "30d" | "90d";

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();
}

function pct(n: number) {
  return `${n.toFixed(1)}%`;
}

function PricingFunnelPage() {
  const fetchFunnel = useServerFn(getPricingCalculatorFunnel);
  const [preset, setPreset] = useState<Preset>("30d");
  const [data, setData] = useState<FunnelResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { since, until } = useMemo(() => {
    const days = preset === "24h" ? 1 : preset === "7d" ? 7 : preset === "30d" ? 30 : 90;
    return { since: isoDaysAgo(days), until: new Date().toISOString() };
  }, [preset]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchFunnel({ data: { since, until } })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchFunnel, since, until]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-6xl px-5 py-10 md:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Admin · Analytics
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">Pricing Calculator Funnel</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          Impression → form change → city selected → submit → PPP explainer click. Drop-off
          counts and percentages are grouped by the visitor's entry page (the first page they
          hit in their session).
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {(["24h", "7d", "30d", "90d"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`rounded-md border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest ${
                preset === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {p}
            </button>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">
            {new Date(since).toLocaleString()} → {new Date(until).toLocaleString()}
          </span>
        </div>

        {loading && <p className="mt-8 text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="mt-8 rounded-md border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        )}

        {data && (
          <>
            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <Stat label="Impressions" value={data.totals.impressions} />
              <Stat label="Form changes" value={data.totals.form_changes} />
              <Stat label="Cities selected" value={data.totals.cities_selected} />
              <Stat label="Submits" value={data.totals.submits} accent />
              <Stat label="Explainer clicks" value={data.totals.explainer_clicks} />
            </section>

            <section className="mt-8 rounded-lg border border-border bg-card p-6">
              <h2 className="font-serif text-xl">Overall funnel</h2>
              <FunnelBars row={data.totals} />
              <p className="mt-3 text-xs text-muted-foreground">
                Impression → submit conversion: <strong className="text-foreground">{pct(data.totals.submit_rate_pct)}</strong>{" "}
                · Form change → submit: <strong className="text-foreground">{pct(data.totals.change_to_submit_pct)}</strong>
              </p>
            </section>

            <section className="mt-8">
              <h2 className="font-serif text-xl">By entry page</h2>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">Entry page</th>
                      <th className="px-3 py-2 text-right">Impr.</th>
                      <th className="px-3 py-2 text-right">Form Δ</th>
                      <th className="px-3 py-2 text-right">City sel.</th>
                      <th className="px-3 py-2 text-right">Submits</th>
                      <th className="px-3 py-2 text-right">Explainer</th>
                      <th className="px-3 py-2 text-right">Impr→Sub</th>
                      <th className="px-3 py-2 text-right">Δ→Sub</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.byEntryPage.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">
                          No events in this window yet.
                        </td>
                      </tr>
                    )}
                    {data.byEntryPage.map((row) => (
                      <tr key={row.entry_page} className="border-b border-border/40">
                        <td className="px-3 py-2 text-foreground">{row.entry_page}</td>
                        <td className="px-3 py-2 text-right">{row.impressions}</td>
                        <td className="px-3 py-2 text-right">{row.form_changes}</td>
                        <td className="px-3 py-2 text-right">{row.cities_selected}</td>
                        <td className="px-3 py-2 text-right text-primary">{row.submits}</td>
                        <td className="px-3 py-2 text-right">{row.explainer_clicks}</td>
                        <td className="px-3 py-2 text-right">{pct(row.submit_rate_pct)}</td>
                        <td className="px-3 py-2 text-right">{pct(row.change_to_submit_pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-serif text-lg">Submit destinations</h3>
                {data.topDestinations.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">No submits yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1 text-sm font-mono">
                    {data.topDestinations.map((d) => (
                      <li key={d.destination} className="flex justify-between border-b border-border/30 py-1">
                        <span>{d.destination}</span>
                        <span className="text-primary">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-serif text-lg">PPP explainer clicks by source</h3>
                {data.explainerBySource.length === 0 ? (
                  <p className="mt-3 text-sm text-muted-foreground">No explainer clicks yet.</p>
                ) : (
                  <ul className="mt-3 space-y-1 text-sm font-mono">
                    {data.explainerBySource.map((s) => (
                      <li key={s.source} className="flex justify-between border-b border-border/30 py-1">
                        <span>{s.source}</span>
                        <span className="text-primary">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        )}
      </article>
    </main>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-lg border p-4 ${accent ? "border-primary bg-primary/5" : "border-border bg-card"}`}
    >
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className={`mt-1 font-serif text-3xl ${accent ? "text-primary" : "text-foreground"}`}>
        {value.toLocaleString("en-US")}
      </p>
    </div>
  );
}

function FunnelBars({ row }: { row: FunnelRow }) {
  const max = Math.max(row.impressions, 1);
  const steps: Array<[string, number]> = [
    ["Impressions", row.impressions],
    ["Form changes", row.form_changes],
    ["Cities selected", row.cities_selected],
    ["Submits", row.submits],
  ];
  return (
    <div className="mt-4 space-y-2">
      {steps.map(([label, val]) => {
        const width = Math.max(2, Math.round((val / max) * 100));
        return (
          <div key={label} className="grid grid-cols-[130px_1fr_60px] items-center gap-3 text-xs">
            <span className="text-muted-foreground">{label}</span>
            <div className="h-3 rounded bg-secondary">
              <div
                className="h-3 rounded bg-primary"
                style={{ width: `${width}%` }}
                aria-hidden
              />
            </div>
            <span className="text-right font-mono text-foreground">
              {val.toLocaleString("en-US")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
