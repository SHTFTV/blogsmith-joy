import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import {
  allCategories,
  getCategoryBySlug,
  getPostsByCategorySlug,
  type BlogPost,
} from "../lib/blogPosts";

export const Route = createFileRoute("/blog/category/$category")({
  loader: ({ params }) => {
    const category = getCategoryBySlug(params.category);
    if (!category) throw notFound();
    return { category, posts: getPostsByCategorySlug(params.category) };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.category.label ?? "Category";
    const count = loaderData?.posts.length ?? 0;
    const url = `https://weddings.io/blog/category/${params.category}/`;
    const title = `${label} — Weddings World | Weddings.io Blog`;
    const description = `${count} Weddings World ${count === 1 ? "story" : "stories"} filed under ${label}. Global wedding coverage from Weddings.io — sister publication to WeddingSaaS.com.`;
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
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40 px-5 py-16 text-center md:px-8 md:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Category</p>
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">{category.label}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          {posts.length} {posts.length === 1 ? "story" : "stories"} in the Weddings World archive.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            to="/blog/"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            ← All posts
          </Link>
          <Link
            to="/blog/topics/"
            className="rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            Browse topics
          </Link>
        </div>
      </section>
      <section className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
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
