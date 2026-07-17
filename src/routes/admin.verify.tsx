import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import { LiveDeployStatus } from "../components/LiveDeployStatus";
import { PublishVerificationPanel } from "../components/PublishVerificationPanel";
import { BUILD_COMMIT_FULL, BUILD_COMMIT_SHORT, BUILD_TIME_LABEL, BUILD_TIME_ISO, LATEST_PRICING_CODE_VERSION } from "../lib/buildInfo";
import { sortedBlogPosts } from "../lib/blogPosts";
import { ADDON_PRICING, PRICING_CODE_VERSION, TERRITORY_MATRIX, formatPopulationRange } from "../lib/territoryPricing";

export const Route = createFileRoute("/admin/verify")({
  head: () => ({
    meta: [
      { title: "Deployment Verification | Weddings.io" },
      { name: "description", content: "Internal verification: current deployed commit, published routes, and blog slugs." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminVerifyPage,
});

// Curated list of user-facing routes — kept in-source so this page never
// depends on filesystem introspection at runtime.
const KEY_ROUTES: Array<{ path: string; label: string }> = [
  { path: "/", label: "Home" },
  { path: "/pricing", label: "Pricing" },
  { path: "/planners", label: "Planners" },
  { path: "/vendors", label: "Vendors" },
  { path: "/directory", label: "Directory" },
  { path: "/cultures", label: "Cultures" },
  { path: "/destinations", label: "Destinations" },
  { path: "/tools", label: "Tools index" },
  { path: "/ecosystem", label: "Ecosystem" },
  { path: "/blog", label: "Blog index" },
  { path: "/guest-post", label: "Guest post" },
  { path: "/eyespyr", label: "EyeSpyR" },
  { path: "/backlinks", label: "Backlinks" },
  { path: "/talc", label: "TALC.tv" },
  { path: "/journal/the-master-plan", label: "Journal · Master Plan" },
  { path: "/admin/verify", label: "This page" },
  { path: "/admin/propagation", label: "Edge propagation watchdog" },
  { path: "/api/public/build-info", label: "Build info JSON (no-store)" },
];

function AdminVerifyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-4xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Deployment Verification</p>
        <h1 className="font-serif text-4xl md:text-5xl">Is the latest publish live?</h1>
        <p className="mt-4 text-muted-foreground">
          If the commit and timestamp below match what you just published, you're viewing the latest build.
          Hard-refresh with <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-xs">Cmd/Ctrl + Shift + R</kbd> if not.
        </p>

        <LiveDeployStatus />

        <section className="mt-10 rounded-lg border border-primary/40 bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Current Build</p>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-[180px_1fr]">
            <dt className="text-muted-foreground">Commit (short)</dt>
            <dd className="font-mono text-foreground">{BUILD_COMMIT_SHORT}</dd>
            <dt className="text-muted-foreground">Commit (full)</dt>
            <dd className="break-all font-mono text-xs text-foreground">{BUILD_COMMIT_FULL}</dd>
            <dt className="text-muted-foreground">Last updated</dt>
            <dd className="text-foreground">
              {BUILD_TIME_LABEL} <span className="ml-2 text-xs text-muted-foreground">({BUILD_TIME_ISO})</span>
            </dd>
            <dt className="text-muted-foreground">Total blog posts</dt>
            <dd className="font-mono text-foreground">{sortedBlogPosts.length}</dd>
            <dt className="text-muted-foreground">Pricing code</dt>
            <dd className={PRICING_CODE_VERSION === LATEST_PRICING_CODE_VERSION ? "font-mono text-foreground" : "font-mono text-destructive"}>
              {PRICING_CODE_VERSION === LATEST_PRICING_CODE_VERSION ? "current" : "mismatch"} · {PRICING_CODE_VERSION.slice(0, 12)}
            </dd>
            <dt className="text-muted-foreground">Territory matrix</dt>
            <dd className="font-mono text-foreground">{TERRITORY_MATRIX.length} display rows · formula priced</dd>
          </dl>
        </section>

        <section className="mt-10 rounded-lg border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Pricing source of truth</h2>
          <dl className="mt-4 grid gap-3 text-sm md:grid-cols-[220px_1fr]">
            <dt className="text-muted-foreground">Exclusive planner slot</dt>
            <dd className="text-foreground">$10–$2,000/mo · PPP-adjusted (base $10/100K × country PPP, clamped)</dd>
            <dt className="text-muted-foreground">Guest Post 3-Pack</dt>
            <dd className="text-foreground">${ADDON_PRICING.backlinkPackOneTime} one-time for 3 guest posts with high-authority dofollow links</dd>
            <dt className="text-muted-foreground">TALC.tv</dt>
            <dd className="text-foreground">${ADDON_PRICING.talcTvVisualBlastPerPost}/post</dd>
            <dt className="text-muted-foreground">Guest Post</dt>
            <dd className="text-foreground">${ADDON_PRICING.guestPostAcceptedPost}/accepted post</dd>
          </dl>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl">Territory brackets ({TERRITORY_MATRIX.length})</h2>
          <div className="mt-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Population</th>
                  <th className="px-4 py-3 text-left">Slots</th>
                  <th className="px-4 py-3 text-left">$/slot/mo</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {TERRITORY_MATRIX.map((row) => (
                  <tr key={`${row.lowerBound}-${row.upperBound ?? "plus"}`} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{formatPopulationRange(row)}</td>
                    <td className="px-4 py-2 text-foreground">{row.totalAvailableSlots} Slots</td>
                    <td className="px-4 py-2 font-mono text-primary">${row.monthlyPricePerSlot}.00</td>
                    <td className="px-4 py-2 text-muted-foreground">{row.territoryStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-2xl">Published routes</h2>
          <p className="mt-2 text-sm text-muted-foreground">Click any route to smoke-test in a new tab.</p>
          <ul className="mt-5 grid gap-2 md:grid-cols-2">
            {KEY_ROUTES.map((r) => (
              <li key={r.path}>
                <a
                  href={r.path}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-primary"
                >
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="font-mono text-xs text-muted-foreground">{r.path}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">Blog slugs ({sortedBlogPosts.length})</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            All blog posts currently deployed. If a post you just published isn't here, the deploy hasn't rolled out yet.
          </p>
          <div className="mt-5 overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-card text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                </tr>
              </thead>
              <tbody>
                {sortedBlogPosts.map((p) => (
                  <tr key={p.slug} className="border-t border-border">
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-xs text-muted-foreground">{p.date}</td>
                    <td className="px-4 py-2">
                      <Link
                        to="/blog/$slug"
                        params={{ slug: p.slug }}
                        className="text-foreground hover:text-primary"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{p.slug}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </article>
    </main>
  );
}
