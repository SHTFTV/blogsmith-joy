import { createFileRoute, notFound } from "@tanstack/react-router";
import { BlogIndexView } from "./blog.index";
import { blogPageCount, sortedBlogPosts } from "../lib/blogPosts";

function parsePage(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1 || n > blogPageCount) throw notFound();
  return n;
}

export const Route = createFileRoute("/blog/page/$page")({
  loader: ({ params }) => ({ page: parsePage(params.page) }),
  head: ({ params }) => {
    const n = Number.parseInt(params.page, 10);
    const valid = Number.isFinite(n) && n >= 1 && n <= blogPageCount;
    const page = valid ? n : 1;
    const url = `https://weddings.io/blog/page/${page}/`;
    const title = `Weddings.io Blog — Page ${page} of ${blogPageCount}`;
    const description = `Page ${page} of the Weddings.io archive: ${sortedBlogPosts.length} South Asian wedding articles, newest first.`;
    const prev =
      page > 2
        ? `https://weddings.io/blog/page/${page - 1}/`
        : page === 2
          ? "https://weddings.io/blog/"
          : null;
    const next = page < blogPageCount ? `https://weddings.io/blog/page/${page + 1}/` : null;
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
      links: [
        { rel: "canonical", href: url },
        ...(prev ? [{ rel: "prev", href: prev }] : []),
        ...(next ? [{ rel: "next", href: next }] : []),
      ],
    };
  },
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <div className="text-center">
        <h1 className="font-serif text-4xl">Page not found</h1>
        <a href="/blog/" className="mt-6 inline-block text-primary underline">
          Back to blog →
        </a>
      </div>
    </main>
  ),
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <p>{error.message}</p>
    </main>
  ),
  component: BlogPagePage,
});

function BlogPagePage() {
  const { page } = Route.useLoaderData();
  return <BlogIndexView page={page} />;
}
