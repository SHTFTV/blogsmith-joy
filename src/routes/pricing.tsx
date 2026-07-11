import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "../components/SiteHeader";
import {
  CITY_EXAMPLES,
  SLOTS_PER_CITY,
  VENDOR_ANNUAL_FEE,
  territoryPrice,
} from "../lib/territoryPricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — One Territory Per City · $10 per 100K | Weddings.io" },
      {
        name: "description",
        content:
          "One exclusive territory per city. $10 USD per 100,000 population, rounded down. Minimum $10/month. Vendors join the IAM ECO System and bidding platform for $10/year.",
      },
      { property: "og:title", content: "Weddings.io Pricing — One City, One Slot" },
      {
        property: "og:description",
        content:
          "Simple formula: $10 USD per 100,000 population. One territory per city. Vendors $10/year to join the ecosystem.",
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
  const [popInput, setPopInput] = useState<string>("180000");
  const parsedPop = useMemo(() => {
    const n = Number(popInput.replace(/[,\s_]/g, ""));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }, [popInput]);
  const monthly = territoryPrice(parsedPop || 0);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          Territory Pricing · USD
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          One city. One territory. $10 per 100,000 people.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          One exclusive slot per city. Price = <strong className="text-foreground">$10 USD per 100,000 population</strong>,
          rounded down to the nearest $10. Minimum $10/month. Same formula everywhere in the world.
        </p>

        {/* Formula highlight */}
        <section className="mt-12 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">The Formula</p>
          <p className="mt-3 font-serif text-3xl md:text-4xl">
            $10 USD × ⌊ population ÷ 100,000 ⌋
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Rounded down. Minimum $10/month. {SLOTS_PER_CITY} slot per city. Month to month.
          </p>
        </section>

        {/* Calculator */}
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
            <span className="text-primary">{formatUsd(monthly)}</span>{" "}
            <span className="text-base text-muted-foreground">USD / month</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {parsedPop.toLocaleString("en-US")} population · $10 per 100K · rounded down
          </p>
        </section>

        {/* Examples */}
        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">City</th>
                <th className="px-4 py-3 text-left">Population</th>
                <th className="px-4 py-3 text-left">Monthly (USD)</th>
              </tr>
            </thead>
            <tbody>
              {CITY_EXAMPLES.map((c) => (
                <tr key={c.city} className="border-t border-border">
                  <td className="px-4 py-3">{c.city}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">{c.populationLabel}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    {formatUsd(territoryPrice(c.population))}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Vendor annual */}
        <section className="mt-16 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Vendors</p>
          <h2 className="mt-2 font-serif text-3xl">${VENDOR_ANNUAL_FEE}/year to join the ecosystem</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            All vendors get access to the IAM ECO System and the bidding platform for a flat{" "}
            <strong className="text-foreground">${VENDOR_ANNUAL_FEE} USD per year</strong>. No tiers.
            No add-ons. No planner pages. One price, one door in.
          </p>
          <ul className="mt-5 grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <li>✓ IAM ECO System directory listing</li>
            <li>✓ Bidding platform access</li>
            <li>✓ EyeSpyR verification eligibility</li>
            <li>✓ Month-to-month territory upgrade any time</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mt-16">
          <h2 className="font-serif text-2xl">FAQ</h2>
          <div className="mt-6 space-y-6 text-sm leading-6 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">How is my territory price calculated?</p>
              <p className="mt-1">
                $10 USD per 100,000 people in your city, rounded down to the nearest $10. Minimum $10/month.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">How many territories per city?</p>
              <p className="mt-1">
                Exactly one. One exclusive slot per city — that's it. When it's taken, it's sold out until released.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">What do vendors pay?</p>
              <p className="mt-1">
                ${VENDOR_ANNUAL_FEE}/year to join the IAM ECO System and bidding platform. Nothing else.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Is there a contract?</p>
              <p className="mt-1">Month to month on territories. Annual on the vendor ecosystem fee. Cancel any time.</p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
