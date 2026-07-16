import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import {
  getPricingCalculatorFunnel,
  type BreakdownRow,
  type CityRow,
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

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? "" : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Array<Array<string | number>>): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\r\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function buildCsv(data: FunnelResponse): string {
  const sections: Array<Array<string | number>> = [];
  sections.push(["Pricing Calculator Funnel Export"]);
  sections.push(["Since", data.since]);
  sections.push(["Until", data.until]);
  sections.push(["City filter", data.city_filter ?? "(all cities)"]);
  sections.push([]);
  sections.push(["Totals"]);
  sections.push([
    "impressions",
    "form_changes",
    "cities_selected",
    "submits",
    "explainer_clicks",
    "submit_rate_pct",
    "change_to_submit_pct",
  ]);
  sections.push([
    data.totals.impressions,
    data.totals.form_changes,
    data.totals.cities_selected,
    data.totals.submits,
    data.totals.explainer_clicks,
    data.totals.submit_rate_pct,
    data.totals.change_to_submit_pct,
  ]);
  sections.push([]);

  const pageHeader: Array<string | number> = [
    "entry_page",
    "impressions",
    "form_changes",
    "cities_selected",
    "submits",
    "explainer_clicks",
    "submit_rate_pct",
    "change_to_submit_pct",
  ];
  sections.push(["By entry page"]);
  sections.push(pageHeader);
  for (const r of data.byEntryPage) {
    sections.push([
      r.entry_page,
      r.impressions,
      r.form_changes,
      r.cities_selected,
      r.submits,
      r.explainer_clicks,
      r.submit_rate_pct,
      r.change_to_submit_pct,
    ]);
  }
  sections.push([]);

  const breakdownHeader: Array<string | number> = [
    "key",
    "impressions",
    "form_changes",
    "cities_selected",
    "submits",
    "submit_rate_pct",
  ];
  sections.push(["By device type"]);
  sections.push(breakdownHeader);
  for (const r of data.byDevice) {
    sections.push([r.key, r.impressions, r.form_changes, r.cities_selected, r.submits, r.submit_rate_pct]);
  }
  sections.push([]);
  sections.push(["By referrer source"]);
  sections.push(breakdownHeader);
  for (const r of data.byReferrer) {
    sections.push([r.key, r.impressions, r.form_changes, r.cities_selected, r.submits, r.submit_rate_pct]);
  }
  sections.push([]);

  sections.push(["By city"]);
  sections.push(["city", "impressions", "form_changes", "cities_selected", "submits", "submit_rate_pct"]);
  for (const r of data.byCity) {
    sections.push([r.city, r.impressions, r.form_changes, r.cities_selected, r.submits, r.submit_rate_pct]);
  }
  sections.push([]);

  sections.push(["Submit destinations"]);
  sections.push(["destination", "count"]);
  for (const d of data.topDestinations) sections.push([d.destination, d.count]);
  sections.push([]);

  sections.push(["PPP explainer clicks by source"]);
  sections.push(["source", "count"]);
  for (const s of data.explainerBySource) sections.push([s.source, s.count]);
  sections.push([]);

  sections.push(["City fallback events"]);
  sections.push(["total", "invalid", "missing"]);
  sections.push([data.fallbacks.total, data.fallbacks.invalid, data.fallbacks.missing]);
  sections.push([]);
  sections.push(["Top attempted (broken) cities"]);
  sections.push(["attempted_city", "count"]);
  for (const a of data.fallbacks.topAttempted) sections.push([a.attempted_city, a.count]);

  return toCsv(sections);
}

function PricingFunnelPage() {
  const fetchFunnel = useServerFn(getPricingCalculatorFunnel);
  const [preset, setPreset] = useState<Preset>("30d");
  const [cityFilter, setCityFilter] = useState<string>("");
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
    fetchFunnel({ data: { since, until, city: cityFilter || null } })
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
  }, [fetchFunnel, since, until, cityFilter]);

  const handleExport = () => {
    if (!data) return;
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const suffix = cityFilter ? `_${cityFilter.replace(/[^a-z0-9]+/gi, "-")}` : "";
    downloadCsv(`pricing-funnel_${preset}${suffix}_${stamp}.csv`, buildCsv(data));
  };

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
          counts and percentages are grouped by the visitor's entry page, device type,
          referrer source, and selected city.
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

          <label className="ml-2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-widest">City</span>
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground"
            >
              <option value="">All cities</option>
              {(data?.cityList ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleExport}
            disabled={!data || loading}
            className="ml-auto rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary-foreground disabled:opacity-40"
          >
            Export CSV
          </button>
          <span className="w-full text-xs text-muted-foreground md:w-auto">
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
              <h2 className="font-serif text-xl">
                Overall funnel{data.city_filter ? ` · ${data.city_filter}` : ""}
              </h2>
              <FunnelBars row={data.totals} />
              <p className="mt-3 text-xs text-muted-foreground">
                Impression → submit conversion:{" "}
                <strong className="text-foreground">{pct(data.totals.submit_rate_pct)}</strong> · Form change → submit:{" "}
                <strong className="text-foreground">{pct(data.totals.change_to_submit_pct)}</strong>
              </p>
            </section>

            <section className="mt-8 rounded-lg border border-border bg-card p-5">
              <h3 className="font-serif text-lg">City fallback diagnostics</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Fires when a visitor lands with a missing or unsupported <code>?city=</code> and
                the app falls back to the default. Use this to catch broken share links.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <MiniStat label="Fallback events" value={data.fallbacks.total} />
                <MiniStat label="Invalid values" value={data.fallbacks.invalid} />
                <MiniStat label="Missing values" value={data.fallbacks.missing} />
              </div>
              {data.fallbacks.topAttempted.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Top broken city values
                  </p>
                  <ul className="mt-2 space-y-1 text-sm font-mono">
                    {data.fallbacks.topAttempted.map((a) => (
                      <li key={a.attempted_city} className="flex justify-between border-b border-border/30 py-1">
                        <span className="truncate pr-2">{a.attempted_city}</span>
                        <span className="text-primary">{a.count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <BreakdownCard title="By device type" rows={data.byDevice} />
              <BreakdownCard title="By referrer source" rows={data.byReferrer} />
            </section>

            <section className="mt-8">
              <h2 className="font-serif text-xl">By city</h2>
              <div className="mt-4 overflow-x-auto rounded-lg border border-border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="border-b border-border bg-secondary/40 text-xs uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2">City</th>
                      <th className="px-3 py-2 text-right">Impr.</th>
                      <th className="px-3 py-2 text-right">Form Δ</th>
                      <th className="px-3 py-2 text-right">City sel.</th>
                      <th className="px-3 py-2 text-right">Submits</th>
                      <th className="px-3 py-2 text-right">Impr→Sub</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {data.byCity.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                          No events in this window yet.
                        </td>
                      </tr>
                    )}
                    {data.byCity.map((row: CityRow) => (
                      <tr key={row.city} className="border-b border-border/40">
                        <td className="px-3 py-2 text-foreground">{row.city}</td>
                        <td className="px-3 py-2 text-right">{row.impressions}</td>
                        <td className="px-3 py-2 text-right">{row.form_changes}</td>
                        <td className="px-3 py-2 text-right">{row.cities_selected}</td>
                        <td className="px-3 py-2 text-right text-primary">{row.submits}</td>
                        <td className="px-3 py-2 text-right">{pct(row.submit_rate_pct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl text-foreground">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

function BreakdownCard({ title, rows }: { title: string; rows: BreakdownRow[] }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-serif text-lg">{title}</h3>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">No events in this window.</p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="py-1 pr-2 font-normal uppercase tracking-widest">Channel</th>
                <th className="py-1 pr-2 text-right font-normal uppercase tracking-widest">Impr.</th>
                <th className="py-1 pr-2 text-right font-normal uppercase tracking-widest">Δ</th>
                <th className="py-1 pr-2 text-right font-normal uppercase tracking-widest">Submits</th>
                <th className="py-1 text-right font-normal uppercase tracking-widest">Rate</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {rows.map((r) => (
                <tr key={r.key} className="border-t border-border/30">
                  <td className="py-1 pr-2 text-foreground">{r.key}</td>
                  <td className="py-1 pr-2 text-right">{r.impressions}</td>
                  <td className="py-1 pr-2 text-right">{r.form_changes}</td>
                  <td className="py-1 pr-2 text-right text-primary">{r.submits}</td>
                  <td className="py-1 text-right">{pct(r.submit_rate_pct)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
