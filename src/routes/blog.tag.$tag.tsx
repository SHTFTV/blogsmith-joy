import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { BlogCard } from "../components/BlogCard";
import { SiteHeader } from "../components/SiteHeader";
import {
  allTags,
  getPostsByTagSlug,
  getTagBySlug,
  type BlogPost,
} from "../lib/blogPosts";

export const Route = createFileRoute("/blog/tag/$tag")({
  loader: ({ params }) => {
    const tag = getTagBySlug(params.tag);
    if (!tag) throw notFound();
    return { tag, posts: getPostsByTagSlug(params.tag) };
  },
  head: ({ params, loaderData }) => {
    const label = loaderData?.tag.label ?? "Tag";
    const count = loaderData?.posts.length ?? 0;
    const url = `https://weddings.io/blog/tag/${params.tag}/`;
    const title = `${label} — Weddings World Tag | Weddings.io Blog`;
    const description = `${count} Weddings World ${count === 1 ? "article" : "articles"} tagged “${label}”. Explore related wedding stories, planning intelligence, and industry analysis from Weddings.io.`;
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
  notFoundComponent: TagNotFound,
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <p>{error.message}</p>
    </main>
  ),
  component: TagPage,
});

function TagPage() {
  const { tag, posts } = Route.useLoaderData();
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="border-b border-border bg-secondary/40 px-5 py-16 text-center md:px-8 md:py-20">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.32em] text-primary">Tag</p>
        <h1 className="font-serif text-4xl text-foreground md:text-5xl">#{tag.label}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground">
          {posts.length} {posts.length === 1 ? "article" : "articles"} tagged “{tag.label}” in Weddings World.
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
          {posts.map((post: BlogPost) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </main>
  );
}

function TagNotFound() {
  return (
    <main className="min-h-screen bg-background px-6 py-24 text-center text-foreground">
      <h1 className="font-serif text-4xl">Tag not found</h1>
      <p className="mt-4 text-muted-foreground">Explore all tags below.</p>
      <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-2">
        {allTags.slice(0, 40).map((t) => (
          <Link
            key={t.slug}
            to="/blog/tag/$tag"
            params={{ tag: t.slug }}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:border-primary hover:text-primary"
          >
            #{t.label}
          </Link>
        ))}
      </div>
    </main>
  );
}
