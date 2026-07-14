import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import {
  allCategories,
  getCategoryBySlug,
  getPostsByCategorySlug,
  type BlogPost,
} from "../lib/blogPosts";

const PAGE_SIZE = 9;
const searchSchema = z.object({
  page: fallback(z.number().int(), 1).default(1),
});

export const Route = createFileRoute("/blog/category/$category")({
  validateSearch: zodValidator(searchSchema),
  loader: ({ params }) => {
    const category = getCategoryBySlug(params.category);
    if (!category) throw notFound();
    return { category, posts: getPostsByCategorySlug(params.category) };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.category.label ?? "Category";
    const posts = loaderData?.posts ?? [];
    const count = posts.length;
    const canonical = `https://weddings.io/blog/category/${params.category}/`;
    const title =
      `${label} Wedding Articles (${count}) — Weddings World | Weddings.io`
        .slice(0, 70);
    const description =
      `Browse ${count} ${label.toLowerCase()} ${count === 1 ? "article" : "articles"} on Weddings.io — global wedding stories, planning intelligence, and industry analysis.`
        .slice(0, 160);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: "index, follow, max-image-preview:large" },
        { property: "og:type", content: "website" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: loaderData
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "CollectionPage",
                name: `${label} — Weddings World`,
                description,
                url: canonical,
                isPartOf: { "@type": "Blog", name: "Weddings World", url: "https://weddings.io/blog/" },
                mainEntity: {
                  "@type": "ItemList",
                  numberOfItems: count,
                  itemListElement: posts.slice(0, 20).map((p, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    url: `https://weddings.io/blog/${p.slug}/`,
                    name: p.title,
                  })),
                },
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
                  { "@type": "ListItem", position: 2, name: "Blog", item: "https://weddings.io/blog/" },
                  { "@type": "ListItem", position: 3, name: label, item: canonical },
                ],
              }),
            },
          ]
        : [],
    };
  },
  notFoundComponent: CategoryNotFound,
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <p>{error.message}</p>
    </main>
  ),
  component: CategoryPage,
});

function CategoryPage() {
  const { category, posts } = Route.useLoaderData();
  const { page } = Route.useSearch();
  const pageCount = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(pageCount, page));
  const start = (safePage - 1) * PAGE_SIZE;
  const pagePosts = posts.slice(start, start + PAGE_SIZE);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40 px-5 py-16 text-center md:px-8 md:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Category</p>
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">{category.label}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          {posts.length} {posts.length === 1 ? "story" : "stories"} · page {safePage} of {pageCount}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/blog/"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            ← All posts
          </Link>
          <Link
            to="/blog/topics"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            Browse topics
          </Link>
        </div>
      </section>
      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pagePosts.map((post: BlogPost) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          {pageCount > 1 && (
            <nav
              className="mt-14 flex items-center justify-between gap-4 border-t border-border pt-8"
              aria-label="Category pagination"
            >
              {safePage > 1 ? (
                <Link
                  to="/blog/category/$category"
                  params={{ category: category.slug }}
                  search={{ page: safePage - 1 }}
                  rel="prev"
                  className="rounded-md border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider hover:border-primary hover:text-primary"
                >
                  ← Newer
                </Link>
              ) : (
                <span />
              )}
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    to="/blog/category/$category"
                    params={{ category: category.slug }}
                    search={{ page: p }}
                    aria-current={p === safePage ? "page" : undefined}
                    className={`rounded-md border px-3 py-2 text-sm font-bold ${
                      p === safePage
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {p}
                  </Link>
                ))}
              </div>
              {safePage < pageCount ? (
                <Link
                  to="/blog/category/$category"
                  params={{ category: category.slug }}
                  search={{ page: safePage + 1 }}
                  rel="next"
                  className="rounded-md border border-border px-4 py-2 text-sm font-bold uppercase tracking-wider hover:border-primary hover:text-primary"
                >
                  Older →
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

function CategoryNotFound() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-center text-foreground">
      <h1 className="font-serif text-4xl">Category not found</h1>
      <p className="mt-4 text-muted-foreground">Try a different topic from the list below.</p>
      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
        {allCategories.map((c) => (
          <Link
            key={c.slug}
            to="/blog/category/$category"
            params={{ category: c.slug }}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            {c.label} · {c.count}
          </Link>
        ))}
      </div>
    </main>
  );
}
