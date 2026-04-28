import { createFileRoute } from "@tanstack/react-router";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import { featuredPosts } from "../lib/blogPosts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weddings.io | South Asian Wedding Intelligence" },
      {
        name: "description",
        content:
          "Weddings.io is the original South Asian wedding platform with planning intelligence, vendor infrastructure, and industry analysis since 2015.",
      },
      { property: "og:title", content: "Weddings.io | South Asian Wedding Intelligence" },
      {
        property: "og:description",
        content:
          "The original South Asian wedding platform with planning intelligence, vendor infrastructure, and expert wedding industry analysis.",
      },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://weddings.io/" },
      { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "https://weddings.io/rss.xml" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="border-b border-border bg-secondary/40 px-5 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Est. 2015 · South Asian Wedding Infrastructure</p>
          <h1 className="max-w-4xl font-serif text-5xl leading-tight text-foreground md:text-7xl">
            Weddings.io is the intelligence layer for modern South Asian weddings.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Planning guides, vendor infrastructure, logistics systems, and market analysis for families and professionals building high-stakes celebrations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/blog/" className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
              Read Latest Posts
            </a>
            <a href="/ecosystem/" className="rounded-md border border-border px-5 py-3 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
              View Ecosystem
            </a>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-primary">From the Blog</p>
              <h2 className="font-serif text-4xl text-foreground md:text-5xl">Newest Articles</h2>
            </div>
            <a href="/blog/" className="text-sm font-semibold text-primary">All 21 posts →</a>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featuredPosts.map((post, index) => (
              <BlogCard key={post.slug} post={post} featured={index === 0} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
