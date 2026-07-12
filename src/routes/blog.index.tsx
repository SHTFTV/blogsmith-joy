import { createFileRoute, Link } from "@tanstack/react-router";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import {
  blogPageCount,
  getBlogPagePosts,
  sortedBlogPosts,
} from "../lib/blogPosts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: `Weddings World — ${sortedBlogPosts.length} Global Wedding Stories | Weddings.io Blog` },
      {
        name: "description",
        content:
          "Weddings World is the Weddings.io blog: global wedding stories, planning intelligence, catering, venues, honeymoons, and industry analysis across every culture.",
      },
      { property: "og:title", content: "Weddings World — The Weddings.io Blog" },
      {
        property: "og:description",
        content: "Global wedding stories and eventful reporting from Weddings.io — sister publication to WeddingSaaS.com. Every culture, every city.",
      },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { property: "og:url", content: "https://weddings.io/blog/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://weddings.io/blog/" },
      { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "https://weddings.io/rss.xml" },
      ...(blogPageCount > 1
        ? [{ rel: "next", href: "https://weddings.io/blog/page/2/" }]
        : []),
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  return <BlogIndexView page={1} />;
}

export function BlogIndexView({ page }: { page: number }) {
  const posts = getBlogPagePosts(page);
  const total = sortedBlogPosts.length;
  const pageCount = blogPageCount;
  const prevHref = page > 2 ? `/blog/page/${page - 1}/` : page === 2 ? "/blog/" : null;
  const nextHref = page < pageCount ? `/blog/page/${page + 1}/` : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40 px-5 py-16 text-center md:px-8 md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Weddings World · The Weddings.io Blog</p>
        <h1 className="font-serif text-5xl text-foreground md:text-6xl">Weddings World</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Global wedding stories, planning intelligence, and eventful industry reporting from Weddings.io —
          sister publication to WeddingSaaS.com. Every culture, every city.
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {total} articles · page {page} of {pageCount} · 2015–2026
        </p>
      </section>
      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 rounded-lg border border-border bg-card p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Vote & Rank</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vote for the best post of the <strong>day</strong>, <strong>week</strong>, <strong>month</strong>, or <strong>year</strong>.
              Your picks shape what rises to the top across the network.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} showVote />
            ))}
          </div>

        {pageCount > 1 && (
          <nav
            className="mx-auto mt-14 flex max-w-7xl items-center justify-between gap-4 border-t border-border pt-8"
            aria-label="Blog pagination"
          >
            {prevHref ? (
              <Link
                to={prevHref}
                className="rounded-md border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider hover:border-primary hover:text-primary"
              >
                ← Newer posts
              </Link>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => {
                const href = p === 1 ? "/blog/" : `/blog/page/${p}/`;
                const active = p === page;
                return (
                  <Link
                    key={p}
                    to={href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md border px-3 py-2 text-sm font-bold ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
            {nextHref ? (
              <Link
                to={nextHref}
                className="rounded-md border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider hover:border-primary hover:text-primary"
              >
                Older posts →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
        </div>
      </section>
    </main>
  );
}
