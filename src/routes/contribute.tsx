import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Write for Weddings.io | Guest Post Program" },
      {
        name: "description",
        content:
          "Share your expertise with 1,018 cities. Get a permanent byline, a dofollow backlink, and distribution to our global vendor and couple network.",
      },
      { property: "og:title", content: "Write for Weddings.io" },
      {
        property: "og:description",
        content: "Write one post. Permanent byline, dofollow backlink, TALC.tv distribution.",
      },
      { property: "og:url", content: "https://weddings.io/contribute/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/contribute/" }],
  }),
  component: Contribute,
});

const topics: Array<[string, string[]]> = [
  ["🪔 South Asian", [
    "Regional sub-tradition deep-dives (Marwari, Tamil Brahmin, Bohra Muslim)",
    "Multi-day logistics: Sangeet to Vidaai in tight venues",
    "Vendor coordination for 800+ guest weddings",
  ]],
  ["🏮 Chinese", [
    "Lunar calendar date selection for diaspora couples",
    "Banquet menu structuring for mixed-culture guests",
    "Guo Da Li gift logistics across borders",
  ]],
  ["🌹 Persian", [
    "Sofreh Aghd symbolism beyond the seven mirrors",
    "Aghd vs Aroosi timeline pacing",
    "Calligrapher briefing for the bilingual ketubah",
  ]],
  ["✡️ Jewish", [
    "Chuppah engineering for outdoor weddings",
    "Ketubah signing logistics and witness coordination",
    "Hora calculations: chair, music, floor capacity",
  ]],
  ["🎺 Mexican", [
    "Padrinos selection and gift-tracking templates",
    "Mariachi vs DJ scheduling for the cocktail-to-reception flip",
    "Lasso and arras handling without losing the moment",
  ]],
  ["🌿 Nordic", [
    "Weather contingency planning for Midsommar weddings",
    "Foraged-floral sourcing inside event timelines",
    "Folk-music programming for non-Nordic guests",
  ]],
  ["🙏 Southeast Asian", [
    "Monk scheduling across Thai, Lao, Khmer traditions",
    "Outfit-change timelines without breaking ceremony flow",
    "Water blessing logistics for hotel ballrooms",
  ]],
  ["💍 Western Traditional", [
    "Order-of-speeches calculus for blended families",
    "String quartet vs DJ acoustic ceremony staging",
    "First-dance choreography under 8 weeks",
  ]],
];

function Contribute() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold text-primary"><span>🪔</span><span>Weddings.io</span></a>
          <nav className="flex gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <a href="/" className="hover:text-primary">Home</a>
            <a href="/cultures/" className="hover:text-primary">Cultures</a>
            <a href="/tools/" className="hover:text-primary">Tools</a>
            <a href="/blog/" className="hover:text-primary">Blog</a>
          </nav>
        </div>
      </header>

      <section className="border-b border-border px-5 py-20 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">Guest Post Program — $10</p>
          <h1 className="font-serif text-5xl text-foreground md:text-6xl">Share Your Expertise With 1,018 Cities</h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            $10 per accepted post. Permanent byline, dofollow backlink, and distribution to our global vendor and couple network.
          </p>
        </div>
      </section>

      <section className="border-b border-border px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {[
            ["What You Get", ["Permanent byline + author profile page", "Dofollow backlink to your site", "TALC.tv content blast across the network", "Featured in city-specific newsletters"]],
            ["What We Publish", ["Culture-specific planning guides", "Operational logistics breakdowns", "Vendor-perspective field pieces", "City-specific planning content"]],
            ["What We Don't Publish", ["Generic 'top 10 tips' listicles", "Promotional or sales posts", "AI content without expert review", "Anything thinner than 1,500 words"]],
          ].map(([title, items]) => (
            <div key={title as string} className="rounded-lg border border-border bg-card p-6">
              <h3 className="font-serif text-2xl text-card-foreground">{title}</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {(items as string[]).map((it) => <li key={it}>· {it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-b border-border px-5 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="font-serif text-4xl text-foreground md:text-5xl">Priority Topics</h2>
          <p className="mt-3 text-muted-foreground">Eight cultures. Pick a lane. Bring receipts.</p>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {topics.map(([name, ideas]) => (
              <div key={name} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-serif text-xl text-card-foreground">{name}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {ideas.map((i) => <li key={i}>· {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-10 text-center">
          <h2 className="font-serif text-4xl text-foreground">Submit Your Pitch</h2>
          <p className="mt-4 text-muted-foreground">
            Email <strong className="text-foreground">partnerships@industryarmymarketing.com</strong> with subject line:
          </p>
          <p className="mt-2 font-mono text-primary">Guest Post: [Your Title]</p>
          <p className="mt-6 text-sm text-muted-foreground">Response within 48 hours.</p>
          <a
            href="mailto:partnerships@industryarmymarketing.com?subject=Guest%20Post%3A%20%5BYour%20Title%5D"
            className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Email Partnerships
          </a>
        </div>
      </section>
    </main>
  );
}
