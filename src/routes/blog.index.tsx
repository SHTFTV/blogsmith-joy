import { createFileRoute } from "@tanstack/react-router";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import { blogPosts } from "../lib/blogPosts";

export const Route = createFileRoute("/blog/")({
  head: () => ({
    meta: [
      { title: `Weddings.io Blog — ${blogPosts.length} South Asian Wedding Articles` },
      {
        name: "description",
        content:
          "All Weddings.io blog posts, newest first: wedding technology, planning, catering, venues, honeymoons, and South Asian industry analysis.",
      },
      { property: "og:title", content: "Weddings.io Blog — South Asian Wedding Articles" },
      {
        property: "og:description",
        content: "The full Weddings.io archive with newest posts first and every article linked to a real page.",
      },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://weddings.io/blog/" },
      { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "https://weddings.io/rss.xml" },
    ],
  }),
  component: BlogPage,
});

function BlogPage() {
  const articleCount = blogPosts.length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40 px-5 py-16 text-center md:px-8 md:py-24">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">All Posts</p>
        <h1 className="font-serif text-5xl text-foreground md:text-6xl">South Asian Wedding Blog</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Expert guides, technical analysis, planning systems, and industry intelligence from Weddings.io.
        </p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">{articleCount} articles · 2015–2026</p>
      </section>
      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}
