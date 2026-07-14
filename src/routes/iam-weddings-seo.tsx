import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import { sortedBlogPosts, slugifyTopic, type BlogPost } from "../lib/blogPosts";

const SEO_KEYWORDS = [
  "seo",
  "iam weddings seo",
  "backlink",
  "search",
  "ranking",
  "geo-fencing",
  "digital waterfront",
  "marketing page",
  "territory",
];

function isSeoPost(p: BlogPost): boolean {
  const hay = [
    p.category,
    p.title,
    p.excerpt,
    ...(p.focusKeywords ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return SEO_KEYWORDS.some((k) => hay.includes(k));
}

const seoPosts = sortedBlogPosts.filter(isSeoPost);
const seoCategories = Array.from(new Set(seoPosts.map((p) => p.category))).sort();

export const Route = createFileRoute("/iam-weddings-seo")({
  head: () => ({
    meta: [
      { title: "IAM Weddings SEO Blog — Wedding Vendor SEO Insights | Weddings.io" },
      {
        name: "description",
        content:
          "Every IAM Weddings SEO post — done-for-you wedding vendor SEO, backlinks, territory pricing, and search strategy. Filter and search across the full library.",
      },
      { name: "keywords", content: "IAM Weddings SEO blog, wedding SEO, wedding vendor SEO, wedding backlinks, wedding search rankings" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "IAM Weddings SEO Blog" },
      {
        property: "og:description",
        content: "Wedding vendor SEO insights, backlinks, territory pricing, and search strategy from IAM Weddings SEO.",
      },
      { property: "og:url", content: "https://weddings.io/iam-weddings-seo/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "IAM Weddings SEO Blog" },
      { name: "twitter:description", content: "Wedding vendor SEO insights, backlinks, territory pricing, and search strategy." },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/iam-weddings-seo/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "IAM Weddings SEO Blog",
          url: "https://weddings.io/iam-weddings-seo/",
          description:
            "Wedding vendor SEO insights, backlinks, territory pricing, and search strategy from IAM Weddings SEO.",
          isPartOf: { "@type": "WebSite", name: "Weddings.io", url: "https://weddings.io" },
        }),
      },
    ],
  }),
  component: IamWeddingsSeoBlog,
});

function IamWeddingsSeoBlog() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return seoPosts.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      const hay = [p.title, p.excerpt, p.category, ...(p.focusKeywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, category]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
          IAM Weddings SEO · Insights
        </p>
        <h1 className="font-serif text-5xl leading-tight md:text-6xl">
          IAM Weddings SEO Blog
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground">
          Every post from IAM Weddings SEO — done-for-you SEO for wedding vendors. Search
          the library, filter by category, and see how city-scoped Marketing Pages,
          high-authority backlinks, and technical SEO compound over time.
        </p>

        <section
          aria-label="Filter posts"
          className="mt-10 flex flex-col gap-3 rounded-lg border border-border bg-card p-4 md:flex-row md:items-center"
        >
          <label htmlFor="seo-search" className="sr-only">
            Search IAM Weddings SEO posts
          </label>
          <input
            id="seo-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts…"
            className="w-full flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          />
          <label htmlFor="seo-category" className="sr-only">
            Filter by category
          </label>
          <select
            id="seo-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
          >
            <option value="all">All categories ({seoPosts.length})</option>
            {seoCategories.map((c) => (
              <option key={c} value={c}>
                {c} ({seoPosts.filter((p) => p.category === c).length})
              </option>
            ))}
          </select>
        </section>

        <p className="mt-4 text-sm text-muted-foreground" role="status" aria-live="polite">
          Showing {filtered.length} of {seoPosts.length} posts
        </p>

        {filtered.length === 0 ? (
          <p className="mt-12 rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            No posts match your filters. Try clearing the search or picking a different category.
          </p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <BlogCard key={`${post.slug}-${slugifyTopic(post.category)}`} post={post} />
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
