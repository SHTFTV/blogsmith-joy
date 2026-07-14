import { createFileRoute } from "@tanstack/react-router";
import { GatewayComingSoon } from "../components/GatewayComingSoon";
import { SiteHeader } from "../components/SiteHeader";
import heroAsset from "../assets/iam-weddings-seo.jpg.asset.json" with { type: "json" };

const HERO_URL = `https://weddings.io${heroAsset.url}`;

export const Route = createFileRoute("/seo")({
  head: () => ({
    meta: [
      { title: "IAM Weddings SEO — Done-for-You SEO for Wedding Vendors | Weddings.io" },
      {
        name: "description",
        content:
          "IAM Weddings SEO: done-for-you SEO for wedding vendors. City-scoped SEO Marketing Pages, high-authority dofollow backlinks, technical SEO, and real editorial content. $10/mo per 100K population.",
      },
      { name: "keywords", content: "IAM Weddings SEO, wedding SEO, wedding vendor SEO, SEO Marketing Page, wedding backlinks, wedding industry SEO, done-for-you SEO wedding" },
      { property: "og:title", content: "IAM Weddings SEO — Done-for-You SEO for Wedding Vendors" },
      {
        property: "og:description",
        content:
          "City-scoped SEO Marketing Pages, high-authority dofollow backlinks, technical SEO, and real editorial content. Priced by population in clean $10 increments.",
      },
      { property: "og:url", content: "https://weddings.io/seo/" },
      { property: "og:type", content: "product" },
      { property: "og:image", content: HERO_URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: HERO_URL },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/seo/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          name: "IAM Weddings SEO",
          serviceType: "Search Engine Optimization",
          provider: {
            "@type": "Organization",
            name: "Industry Army Marketing",
            url: "https://industryarmymarketing.com",
          },
          areaServed: "Worldwide",
          description:
            "Done-for-you SEO for wedding vendors. City-scoped SEO Marketing Pages, high-authority dofollow backlinks, technical SEO, and real editorial content.",
          offers: {
            "@type": "Offer",
            price: "10.00",
            priceCurrency: "USD",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: "10.00",
              priceCurrency: "USD",
              unitText: "per 100,000 population per month",
            },
          },
          image: HERO_URL,
          url: "https://weddings.io/seo/",
        }),
      },
    ],
  }),
  component: SeoPage,
});

function SeoPage() {
  const pillars = [
    {
      title: "City-Scoped SEO Marketing Pages",
      body: "One exclusive marketing page per city, built to rank for the queries couples actually type. Real copy, real structure, real internal links — not spun content.",
    },
    {
      title: "High-Authority Dofollow Backlinks",
      body: "Editorial placements from the IAM domain network and real wedding-industry publishers. Dofollow. Permanent. No PBN garbage.",
    },
    {
      title: "Technical SEO That Actually Ships",
      body: "Core Web Vitals, schema.org markup, canonical hygiene, XML sitemaps, and crawl budget managed by a team that also builds the software.",
    },
    {
      title: "Real Editorial Content",
      body: "Written by humans who understand weddings. Photography, planning guides, cultural expertise, and city-level detail — indexed, cited, and shared.",
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          IAM Weddings SEO · By Industry Army Marketing
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          Done-for-you SEO for wedding vendors.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          IAM Weddings SEO is the SEO team behind Weddings.io — city-scoped marketing pages,
          high-authority dofollow backlinks, technical SEO, and real editorial content. Priced
          by population in clean $10 increments. We're picky about who we take on.
        </p>

        <figure className="mt-10 overflow-hidden rounded-lg border border-border">
          <img
            src={heroAsset.url}
            alt="IAM Weddings SEO — search rankings climbing for a wedding vendor with editorial flat-lay of laptop analytics, wedding ring and blush roses"
            width={1600}
            height={900}
            className="h-auto w-full"
          />
        </figure>

        <section className="mt-12 grid gap-4 md:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-md border border-border bg-card p-6">
              <h2 className="font-serif text-2xl text-card-foreground">{p.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{p.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Pricing</p>
          <h2 className="mt-2 font-serif text-3xl">$10 USD / month per 100,000 population</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Rounded down to the nearest $10. Minimum $10. Same clean formula for every city on earth.
            One exclusive territory per city — the moment it's filled, that city is sold out.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <GatewayComingSoon
              context="Apply for IAM Weddings SEO"
              subject="IAM Weddings SEO — early access"
            />
            <a
              href="/pricing/"
              className="inline-block rounded-md border border-primary px-4 py-2 text-sm font-bold text-primary"
            >
              See Full Pricing
            </a>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-serif text-2xl">FAQ</h2>
          <div className="mt-6 space-y-6 text-sm leading-6 text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground">What's included?</p>
              <p className="mt-1">
                Your city-scoped SEO Marketing Page, ongoing technical SEO, editorial content,
                and high-authority dofollow backlinks from the IAM domain network.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">Why is it "picky"?</p>
              <p className="mt-1">
                One territory per city. We only work with vendors we'd recommend to our own family.
                Everyone else gets the free directory.
              </p>
            </div>
            <div>
              <p className="font-semibold text-foreground">How is the price calculated?</p>
              <p className="mt-1">
                $10 USD per 100,000 city population, rounded down to the nearest $10.
                A 570K city is $50/mo. A 2.1M city is $210/mo. No hidden tiers.
              </p>
            </div>
          </div>
        </section>
      </article>
    </main>
  );
}
