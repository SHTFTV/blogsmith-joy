import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { GatewayComingSoon } from "../components/GatewayComingSoon";
import { SiteHeader } from "../components/SiteHeader";
import { BUILD_COMMIT_SHORT, BUILD_TIME_LABEL } from "../lib/buildInfo";
import {
  ADDON_PRICING,
  CITY_EXAMPLES,
  PRICING_CODE_VERSION,
  TERRITORY_MATRIX,
  VENDOR_ANNUAL_FEE,
  formatPopulationRange,
  getTerritoryBracket,
  positionOneMonthlyAddon,
  territoryPrice,
  territorySlots,
} from "../lib/territoryPricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Hardcoded Territory Matrix | Weddings.io" },
      {
        name: "description",
        content:
          "Hardcoded territory pricing matrix: 39 population brackets, exact slot counts, flat monthly slot costs, and add-ons locked as source-of-truth.",
      },
      { property: "og:title", content: "Weddings.io Pricing — Hardcoded Territory Matrix" },
      {
        property: "og:description",
        content:
          "39 immutable population brackets, exact slots, $10 baseline through 2M, and terminal metro cap at $290/slot/month.",
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
  const slots = activeBracket.totalAvailableSlots;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          Territory Pricing · USD · build {BUILD_COMMIT_SHORT}
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          Hardcoded territory pricing, line by line.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          The source of truth is a 39-row immutable matrix. Slot counts and monthly slot costs are not calculated,
          interpolated, or adjusted by formula. Each population bracket below is hardcoded exactly.
        </p>
        <p className="mt-3 font-mono text-xs text-muted-foreground">
          Pricing code {PRICING_CODE_VERSION.slice(0, 12)} · last updated {BUILD_TIME_LABEL}
        </p>

        <section data-testid="territory-rule" className="mt-10 rounded-lg border border-primary/60 bg-primary/5 p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The Rule</p>
          <p className="mt-3 font-serif text-3xl md:text-4xl">Sold out only when that bracket's exact slot count is filled.</p>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            A 245K city has 3 slots. A 570K city has 7 slots. A 29M+ market has 10 slots.
            A territory does not show SOLD OUT until every hardcoded slot for that population bracket is taken.
          </p>
        </section>

        <section className="mt-6 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Current Calculator Result</p>
          <p className="mt-3 font-serif text-3xl md:text-4xl">
            {slots} slots · {formatUsd(monthly)}/slot/month
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
            <span className="text-base text-muted-foreground">USD / slot / month</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {parsedPop.toLocaleString("en-US")} population · {slots} slots · {activeBracket.territoryStatus}
          </p>
        </section>

        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Population</th>
                <th className="px-4 py-3 text-left">Slots</th>
                <th className="px-4 py-3 text-left">$/slot/mo</th>
              </tr>
            </thead>
            <tbody data-testid="city-examples">
              {CITY_EXAMPLES.map((c) => (
                <tr key={c.city} data-testid="city-row" data-population={c.population} className="border-t border-border">
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c.populationLabel}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{territorySlots(c.population)} Slots</td>
                  <td data-testid="city-price" className="px-4 py-3 font-semibold text-primary">
                    {formatUsd(territoryPrice(c.population))}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Population Lower Bound</th>
                <th className="px-4 py-3 text-left">Population Upper Bound</th>
                <th className="px-4 py-3 text-left">Total Available Slots</th>
                <th className="px-4 py-3 text-left">Monthly Price Per Slot</th>
                <th className="px-4 py-3 text-left">Territory Status</th>
              </tr>
            </thead>
            <tbody>
              {TERRITORY_MATRIX.map((row) => (
                <tr key={`${row.lowerBound}-${row.upperBound ?? "plus"}`} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.lowerBound.toLocaleString("en-US")}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{row.upperBound === null ? "30,000,000+" : row.upperBound.toLocaleString("en-US")}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">{row.totalAvailableSlots} Slots</td>
                  <td className="px-4 py-3 font-semibold text-primary">${row.monthlyPricePerSlot}.00</td>
                  <td className="px-4 py-3 text-muted-foreground">{row.territoryStatus}</td>
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
              <p className="mt-2 text-sm text-muted-foreground">Adds exactly 50% of active slot cost to monthly billing.</p>
              <p className="mt-3 font-mono text-primary">$10 slot → +${positionOneMonthlyAddon(10).toFixed(2)}/mo · $290 slot → +${positionOneMonthlyAddon(290).toFixed(2)}/mo</p>
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
              <p className="mt-1">It is not calculated. The app selects the exact hardcoded population bracket and uses that row's flat monthly slot cost.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">How many territories per city?</p>
              <p className="mt-1">The matrix controls it: 3 slots at baseline, scaling to 10 slots. SOLD OUT appears only when that bracket's exact slot count is filled.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground">What do vendors pay?</p>
              <p className="mt-1">${VENDOR_ANNUAL_FEE}/year to join the IAM ECO System and bidding platform. Monthly territory slots use the matrix above.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
