import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import { TERRITORY_MATRIX, ADDON_PRICING } from "../lib/territoryPricing";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Territory Slots, Add-Ons & The 250 Scale | Weddings.io" },
      {
        name: "description",
        content:
          "The full IAM Territory Pricing matrix. 40 population brackets, flat $/slot/month. Sold-out only when every slot in a tier is taken. Add-ons: Position #1, Backlink Pack ($25), TALC.tv ($10/post), Hall Visualizer ($2/render).",
      },
      { property: "og:title", content: "Weddings.io Pricing — The 250 Scale" },
      {
        property: "og:description",
        content: "Population × Slots × Flat Price. Hardcoded. No interpolation.",
      },
      { property: "og:url", content: "https://weddings.io/pricing" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/pricing" }],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          The 250 Scale
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          Population × Slots × Flat Price
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Look up your city's population tier. That row tells you exactly how many slots exist
          and the flat monthly cost of each one. <strong className="text-foreground">SOLD OUT</strong>{" "}
          triggers only when every slot in that tier is taken.
        </p>

        <section className="mt-12 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Population Base</th>
                <th className="px-4 py-3 text-left">Slots Available</th>
                <th className="px-4 py-3 text-left">Flat Cost / Slot / Month</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {TERRITORY_MATRIX.map((b) => (
                <tr key={b.label} className="border-t border-border">
                  <td className="px-4 py-3 font-mono">{b.label}</td>
                  <td className="px-4 py-3">{b.slots}</td>
                  <td className="px-4 py-3 font-semibold text-primary">
                    ${b.pricePerSlot.toFixed(2)}/mo flat
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-3xl">Add-Ons (Flat)</h2>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            <li className="rounded-lg border border-border bg-card p-5">
              <p className="font-semibold text-foreground">Position #1 Placement</p>
              <p className="mt-1 text-sm text-muted-foreground">
                +{ADDON_PRICING.position1Multiplier * 100}% of your active slot's monthly cost.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-card p-5">
              <p className="font-semibold text-foreground">High-Authority Backlink Pack</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ${ADDON_PRICING.backlinkPack} one-time · 3 dofollow links.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-card p-5">
              <p className="font-semibold text-foreground">TALC.tv Visual Blast</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ${ADDON_PRICING.talcBlast} per post.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-card p-5">
              <p className="font-semibold text-foreground">Hall Visualizer (EyeSpyR Engine)</p>
              <p className="mt-1 text-sm text-muted-foreground">
                ${ADDON_PRICING.hallVisualizer} per render.
              </p>
            </li>
          </ul>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-2xl">Couples & Planners</h2>
          <p className="mt-2 text-sm text-muted-foreground">Hover any tier to preview the checkout gateways.</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { name: "Couples Free Starter", price: "$0", note: "hard limits" },
              { name: "Couples Cloud", price: "$4.99/mo", note: "unlimited" },
              { name: "Planner Starter", price: "$29/mo", note: "solo planners" },
              { name: "Planner Pro", price: "$59/mo", note: "growing studios" },
              { name: "Planner Agency", price: "$99/mo", note: "multi-city teams" },
              { name: "EyeSpyR Verification", price: "FREE", note: "with any monthly plan ($10/mo+)" },
              { name: "Guest Post", price: "$10", note: "per accepted post" },
            ].map((t) => (
              <li
                key={t.name}
                className="group relative overflow-hidden rounded-lg border border-border bg-card p-5 transition hover:border-primary/50"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold text-foreground">{t.name}</p>
                  <p className="font-mono text-primary">{t.price}</p>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{t.note}</p>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-background/95 px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground opacity-0 backdrop-blur transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100"
                >
                  <span className="mr-3 text-foreground">Pay with</span>
                  <span className="mr-2 rounded border border-border px-2 py-0.5">Stripe</span>
                  <span className="mr-2 rounded border border-border px-2 py-0.5">PayPal</span>
                  <span className="mr-2 rounded border border-border px-2 py-0.5"> Pay</span>
                  <span className="rounded border border-border px-2 py-0.5">G Pay</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Coming soon — gateway integration in progress. Invoices already support PayPal.
          </p>
        </section>
      </article>
    </main>
  );
}
