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
          "The full IAM Territory Pricing matrix. 39 population brackets, flat $/slot/month. Sold-out only when every slot in a tier is taken. Add-ons: Position #1, Backlink Pack ($25), TALC.tv ($10/post), Hall Visualizer ($2/render).",
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

        <section className="mt-16 rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Couples & Planners</h2>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Couples Free Starter</strong> — $0 with hard limits.</li>
            <li><strong className="text-foreground">Couples Cloud</strong> — $4.99/mo unlimited.</li>
            <li><strong className="text-foreground">Planner Starter</strong> — $29/mo.</li>
            <li><strong className="text-foreground">Planner Pro</strong> — $59/mo.</li>
            <li><strong className="text-foreground">Planner Agency</strong> — $99/mo.</li>
            <li><strong className="text-foreground">EyeSpyR Verification</strong> — FREE with any monthly plan ($10/mo+). Locked on $10/yr baseline.</li>
            <li><strong className="text-foreground">Guest Post</strong> — $10 per accepted post.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}
