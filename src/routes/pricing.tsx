import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GatewayComingSoon } from "../components/GatewayComingSoon";
import { SiteHeader } from "../components/SiteHeader";
import { BUILD_COMMIT_SHORT, BUILD_TIME_LABEL } from "../lib/buildInfo";
import {
  ADDON_PRICING,
  CITY_EXAMPLES,
  PRICING_CODE_VERSION,
  VENDOR_ANNUAL_FEE,
  getTerritoryBracket,
  positionOneMonthlyAddon,
  territoryPrice,
} from "../lib/territoryPricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Exclusive SEO Marketing Pages | Weddings.io" },
      {
        name: "description",
        content:
          "Exclusive SEO Marketing Pages: 1 territory per city, priced at $10 USD per 100,000 population, rounded down to the nearest $10 (minimum $10). Clean $10 brackets, no odd numbers.",
      },
      { property: "og:title", content: "Weddings.io Pricing — $10 per 100K, One Territory per City" },
      {
        property: "og:description",
        content:
          "One exclusive SEO Marketing Page per city. $10 USD per 100,000 population, rounded down to the nearest $10. Minimum $10. Same formula worldwide.",
      },
      { property: "og:url", content: "https://weddings.io/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/pricing" }],
  }),
  component: PricingPage,
});

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function PricingPage() {
  const [popInput, setPopInput] = useState<string>("570000");
  const parsedPop = useMemo(() => {
    const n = Number(popInput.replace(/[,\s_]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [popInput]);
  const activeBracket = getTerritoryBracket(parsedPop || 0);
  const monthly = activeBracket.monthlyPricePerSlot;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          Territory Pricing · USD · build {BUILD_COMMIT_SHORT}
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          Exclusive SEO Marketing Pages. $10 per 100K population.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          One exclusive SEO Marketing Page per city. Priced by a clean formula: <strong>$10 USD per 100,000 population,
          rounded down to the nearest $10</strong>. Minimum $10. No odd numbers. Same formula worldwide.
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Pricing code {PRICING_CODE_VERSION.slice(0, 12)} · last updated {BUILD_TIME_LABEL}
        </p>

        <section data-testid="territory-rule" className="mt-10 rounded-lg border border-primary/60 bg-primary/5 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The Rule</p>
          <p className="mt-3 font-serif text-3xl md:text-4xl">1 territory per city. Sold out the moment that territory is filled.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Every city — from a 50K town to a 20M metro — offers exactly one exclusive vendor territory.
            The population bracket only controls the monthly price.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Current Calculator Result</p>
          <p className="mt-3 font-serif text-3xl md:text-4xl">
            1 territory · {formatUsd(monthly)}/month
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Active bracket: {formatPopulationRange(activeBracket)} · {activeBracket.territoryStatus}
          </p>
          <div className="mt-5">
            <GatewayComingSoon context="Claim territory" subject="Claim territory — early access" />
          </div>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-card p-6 md:p-8">
          <h2 className="font-serif text-2xl">City Price Calculator</h2>
          <label className="mt-4 block text-sm font-medium text-muted-foreground" htmlFor="pop">
            Enter your city's population
          </label>
          <input
            id="pop"
            type="text"
            inputMode="numeric"
            value={popInput}
            onChange={(e) => setPopInput(e.target.value)}
            className="mt-2 w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 font-mono text-lg text-foreground focus:border-primary focus:outline-none"
            placeholder="e.g. 570000"
          />
          <p className="mt-4 font-serif text-3xl">
            <span data-testid="calc-price" className="text-primary">{formatUsd(monthly)}</span>{" "}
            <span className="text-base text-muted-foreground">USD / month · 1 territory</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {parsedPop.toLocaleString("en-US")} population · 1 territory per city · {activeBracket.territoryStatus}
          </p>
        </section>

        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Population</th>
                <th className="px-4 py-3 text-left">Territories</th>
                <th className="px-4 py-3 text-left">$/mo</th>
              </tr>
            </thead>
            <tbody data-testid="city-examples">
              {CITY_EXAMPLES.map((c) => (
                <tr key={c.city} data-testid="city-row" data-population={c.population} className="border-t border-border">
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c.populationLabel}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">1 Territory</td>
                  <td data-testid="city-price" className="px-4 py-3 font-semibold text-primary">
                    {formatUsd(territoryPrice(c.population))}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>


        <section className="mt-16 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Vendors</p>
          <h2 className="mt-2 font-serif text-3xl">${VENDOR_ANNUAL_FEE}/year to join the ecosystem</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            All vendors get access to the IAM ECO System and the bidding platform for a flat{" "}
            <strong className="text-foreground">${VENDOR_ANNUAL_FEE} USD per year</strong>. EyeSpyR is free with monthly plans ($10/mo+) and locked on the $10/year baseline.
          </p>
        </section>

        <section className="mt-16 rounded-lg border border-border bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Dashboard Upsells & Add-ons</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-border bg-background p-4">
              <p className="font-serif text-2xl">Position #1 Feature</p>
              <p className="mt-2 text-sm text-muted-foreground">Adds exactly 50% of the active monthly territory cost to monthly billing.</p>
              <p className="mt-3 font-mono text-primary">$10 territory → +${positionOneMonthlyAddon(10).toFixed(2)}/mo · $290 territory → +${positionOneMonthlyAddon(290).toFixed(2)}/mo</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="font-serif text-2xl">Backlink Pack</p>
              <p className="mt-2 text-sm text-muted-foreground">3 dofollow links. One-time flat cost.</p>
              <p className="mt-3 font-mono text-primary">${ADDON_PRICING.backlinkPackOneTime}.00 one-time</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="font-serif text-2xl">TALC.tv Visual Blast</p>
              <p className="mt-2 text-sm text-muted-foreground">Pay-as-you-go post credit.</p>
              <p className="mt-3 font-mono text-primary">${ADDON_PRICING.talcTvVisualBlastPerPost}.00/post</p>
            </div>
            <div className="rounded-md border border-border bg-background p-4">
              <p className="font-serif text-2xl">Hall Visualizer</p>
              <p className="mt-2 text-sm text-muted-foreground">EyeSpyR Engine render credit.</p>
              <p className="mt-3 font-mono text-primary">${ADDON_PRICING.hallVisualizerEyeSpyrPerRender}.00/render</p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-2xl">FAQ</h2>
          <div className="mt-6 space-y-6 text-sm leading-6 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">How is my territory price calculated?</p>
              <p className="mt-1">$10 USD per 100,000 population, rounded down to the nearest $10. Minimum $10. Same clean formula for every city on earth.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">How many territories per city?</p>
              <p className="mt-1">Exactly one. Every city offers a single exclusive vendor territory — SOLD OUT the moment that territory is filled.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">What do vendors pay?</p>
              <p className="mt-1">${VENDOR_ANNUAL_FEE}/year to join the IAM ECO System and bidding platform. The single monthly city territory uses the matrix above.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
