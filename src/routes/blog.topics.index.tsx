import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";
import { allCategories, allTags } from "../lib/blogPosts";

export const Route = createFileRoute("/blog/topics/")({
  head: () => {
    const url = "https://weddings.io/blog/topics/";
    const title = "Weddings World Topics — Categories & Tags | Weddings.io Blog";
    const description = `Browse every Weddings World category and tag. ${allCategories.length} categories and ${allTags.length} tags spanning weddings, events, cultural stories, technology, and vendor economics.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  component: TopicsPage,
});

function TopicsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40 px-5 py-16 text-center md:px-8 md:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Weddings World</p>
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">Topics</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          Browse the Weddings World archive by category or tag. Cultural coverage happens naturally through
          the PPP strategy — every region gets its own lane.
        </p>
      </section>
      <section className="px-5 py-14 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 font-serif text-2xl text-foreground">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {allCategories.map((c) => (
              <Link
                key={c.slug}
                to="/blog/category/$category"
                params={{ category: c.slug }}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
              >
                {c.label}
                <span className="ml-2 text-xs text-muted-foreground">{c.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="px-5 pb-20 md:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-6 font-serif text-2xl text-foreground">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {allTags.map((t) => (
              <Link
                key={t.slug}
                to="/blog/tag/$tag"
                params={{ tag: t.slug }}
                className="rounded-full border border-border px-3 py-1 text-xs font-medium uppercase tracking-wider hover:border-primary hover:text-primary"
              >
                #{t.label}
                <span className="ml-1.5 text-muted-foreground/70">{t.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
