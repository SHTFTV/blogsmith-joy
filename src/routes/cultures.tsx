import { createFileRoute } from "@tanstack/react-router";
import { CULTURES } from "../components/CultureFeatures";

export const Route = createFileRoute("/cultures")({
  head: () => ({
    meta: [
      { title: "All Cultures — Weddings.io | The World's Wedding Platform" },
      {
        name: "description",
        content:
          "Every culture, every ceremony, one platform. South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, and Western wedding planning tools.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Weddings.io" },
      { property: "og:title", content: "All Cultures — Weddings.io" },
      {
        property: "og:description",
        content:
          "Every culture, every ceremony, one platform. South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, Western, and Traditional wedding tools.",
      },
      { property: "og:url", content: "https://weddings.io/cultures/" },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { property: "og:image:alt", content: "Weddings.io — every culture, every ceremony, one platform" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@weddingsio" },
      { name: "twitter:title", content: "All Cultures — Weddings.io" },
      {
        name: "twitter:description",
        content:
          "South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, Western, and Traditional wedding planning tools.",
      },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/cultures/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              "@id": "https://weddings.io/cultures/#page",
              url: "https://weddings.io/cultures/",
              name: "All Cultures — Weddings.io",
              description:
                "Every culture, every ceremony, one platform. South Asian, Chinese, Persian, Jewish, Hispanic Heritage, Nordic, Southeast Asian, Western, and Traditional wedding planning tools.",
              isPartOf: { "@id": "https://weddings.io/#website" },
              inLanguage: "en",
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
                { "@type": "ListItem", position: 2, name: "Cultures", item: "https://weddings.io/cultures/" },
              ],
            },
            {
              "@type": "ItemList",
              name: "Wedding Cultures Covered by Weddings.io",
              itemListElement: CULTURES.map((c, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: c.name,
                url: `https://weddings.io${c.href}`,
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: CulturesPage,
});


function CulturesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-5 py-6 md:px-8">
        <a href="/" className="flex items-center gap-3 text-lg font-semibold text-primary">
          <span aria-hidden="true">🪔</span>
          <span>Weddings.io</span>
        </a>
      </header>
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">
            Est. 2015 · 24 Countries · 1,018 Cities
          </p>
          <h1 className="font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Every Culture. Every Ceremony. One Platform.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
            Industrial-grade planning tools built for every tradition. Pick your culture to open
            its dedicated suite.
          </p>
          <div
            className="mt-12 grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {CULTURES.map((c) => (
              <a
                key={c.slug}
                href={c.href}
                className="group block rounded-xl border border-border bg-card p-6 transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between">
                  <span className="text-4xl" aria-hidden="true">{c.emoji}</span>
                  <span className="rounded-md bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                    {c.toolsLabel}
                  </span>
                </div>
                <h2 className="mt-4 font-serif text-2xl text-card-foreground">{c.name}</h2>
                <p className="mt-1 font-mono text-[13px] text-primary">{c.native}</p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{c.description}</p>
                <span className="mt-5 inline-block text-xs font-bold uppercase tracking-wider text-primary">
                  {c.cta} →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
