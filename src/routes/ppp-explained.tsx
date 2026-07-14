import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import {
  COUNTRY_PPP,
  MAX_MONTHLY_PRICE,
  MIN_MONTHLY_PRICE,
  SUPPORTED_CITIES,
  pppIndex,
  priceForCity,
} from "../lib/territoryPricing";

export const Route = createFileRoute("/ppp-explained")({
  head: () => ({
    meta: [
      { title: "PPP Pricing Explained — How Your City's Monthly USD Price Is Calculated | Weddings.io" },
      {
        name: "description",
        content:
          "Purchasing Power Parity (PPP) explained in plain English. See exactly how your monthly USD price is calculated from your city's population and your country's PPP index. $10–$2,000/mo, no tiers, no hidden add-ons.",
      },
      { property: "og:title", content: "PPP Pricing Explained — Weddings.io" },
      {
        property: "og:description",
        content:
          "How PPP (Purchasing Power Parity) sets your monthly USD price. Worked examples for couples, vendors, and enterprise.",
      },
      { property: "og:url", content: "https://weddings.io/ppp-explained" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/ppp-explained" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is PPP pricing?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "PPP (Purchasing Power Parity) scales the monthly USD price to what a local currency actually buys, so a vendor in Mumbai does not pay the same USD as a vendor in New York for the same population base.",
              },
            },
            {
              "@type": "Question",
              name: "Are all prices monthly and in USD?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Every calculator price on Weddings.io is a monthly amount in US dollars, and updates live the moment you change your selected city.",
              },
            },
            {
              "@type": "Question",
              name: "Does PPP apply to couples?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. Couples plan for free — forever, in every country. PPP does not apply to couples.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: PppExplainedPage,
});

function fmt(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

function PppExplainedPage() {
  const examples = [
    SUPPORTED_CITIES.find((c) => c.city === "Colombo, LK"),
    SUPPORTED_CITIES.find((c) => c.city === "Mumbai"),
    SUPPORTED_CITIES.find((c) => c.city === "London"),
    SUPPORTED_CITIES.find((c) => c.city === "Vancouver, BC"),
    SUPPORTED_CITIES.find((c) => c.city === "Toronto, ON"),
    SUPPORTED_CITIES.find((c) => c.city === "New York"),
  ].filter((c): c is NonNullable<typeof c> => Boolean(c));

  const countries = Object.entries(COUNTRY_PPP)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 12);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          PPP Pricing · Monthly · USD · Plain-English Explainer
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          How your monthly USD price is calculated.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Every price on Weddings.io is a <strong>monthly amount in US dollars</strong>. Change
          your city in the calculator and the price updates live — instantly, no reload, no
          hidden fine print. This page explains the formula, the country factors, and worked
          examples for couples, vendors, and enterprise.
        </p>

        <section className="mt-12 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <h2 className="font-serif text-3xl">The formula</h2>
          <pre className="mt-4 overflow-x-auto rounded-md bg-secondary/40 p-4 font-mono text-sm text-foreground">
{`monthly_usd = clamp(
  round10( basePrice(city_population) × pppIndex(country) ),
  ${fmt(MIN_MONTHLY_PRICE)}, ${fmt(MAX_MONTHLY_PRICE)}
)

basePrice(pop) = floor(pop / 100,000) × $10   // min $10
pppIndex(country) = World Bank PPP factor (US = 1.00)`}
          </pre>
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            One exclusive planner per city. That single line item — a monthly USD price —
            is the whole price. No tiers. No bundles. No add-ons buried in fine print.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-3xl">What "live update" means</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            When you pick a different city in the calculator, three things recalculate
            instantly on your device:
          </p>
          <ul className="mt-4 space-y-2 text-base leading-7 text-muted-foreground">
            <li>· The base price (city population ÷ 100K, × $10)</li>
            <li>· The PPP multiplier for that city's country</li>
            <li>· The final monthly USD price, rounded to the nearest $10 and clamped between {fmt(MIN_MONTHLY_PRICE)} and {fmt(MAX_MONTHLY_PRICE)}</li>
          </ul>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Nothing is submitted, saved, or charged when you change the selection — the
            calculator is a preview. You only enter a commitment when you click{" "}
            <em>Apply</em> or <em>Claim your city</em>, and even then payment gateways are
            currently closed until launch.
          </p>
        </section>

        <section className="mt-12 rounded-lg border border-border bg-secondary/20 p-6 md:p-8">
          <h2 className="font-serif text-3xl">Worked examples</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">City</th>
                  <th className="px-3 py-2">Population</th>
                  <th className="px-3 py-2">Country PPP</th>
                  <th className="px-3 py-2">Monthly USD</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {examples.map((c) => (
                  <tr key={c.city} className="border-b border-border/40">
                    <td className="px-3 py-3">{c.city}</td>
                    <td className="px-3 py-3">{c.population.toLocaleString("en-US")}</td>
                    <td className="px-3 py-3">
                      {c.countryName} · {pppIndex(c.country).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-primary">{fmt(priceForCity(c))}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-3xl">Country PPP factors (sample)</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Lower PPP = lower USD price for the same city size. US = 1.00 is the reference.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {countries.map(([code, ppp]) => (
              <div
                key={code}
                className="rounded-md border border-border bg-card px-3 py-2 font-mono text-sm"
              >
                {code} · {ppp.toFixed(2)}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-serif text-xl">Couples</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Free — forever, everywhere. PPP does not apply to you.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-serif text-xl">Vendors</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Directory: $10/yr flat, already at the PPP floor. Exclusive city slot:
              monthly USD via the formula above.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-serif text-xl">Enterprise</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Same PPP-adjusted per-city math, clamped at {fmt(MAX_MONTHLY_PRICE)}/mo. No
              tiers, no bundles.
            </p>
          </div>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
          >
            Try the city calculator →
          </Link>
          <Link
            to="/pricing"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
          >
            Full pricing page
          </Link>
        </div>
      </article>
    </main>
  );
}
