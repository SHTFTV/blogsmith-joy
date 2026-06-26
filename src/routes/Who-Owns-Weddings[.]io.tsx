import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/Who-Owns-Weddings.io")({
  server: {
    handlers: {
      GET: async () => {
        const { readFile } = await import("node:fs/promises");
        const { join } = await import("node:path");
        const html = await readFile(
          join(process.cwd(), "public", "Who-Owns-Weddings.io", "index.html"),
          "utf8",
        );

        return new Response(html, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        });
      },
      HEAD: async () =>
        new Response(null, {
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=300",
          },
        }),
    },
  },
  head: () => ({
    meta: [
      { title: "Who Owns Weddings.io? Why This Specific Domain Battle Matters" },
      {
        name: "description",
        content:
          "Industry Army Marketing has owned weddings.io since 2015. The full weddings.io ecosystem, pricing model, proof links, and disruption case.",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "Who Owns Weddings.io? Why This Specific Domain Battle Matters" },
      {
        property: "og:description",
        content:
          "Industry Army Marketing has owned weddings.io since 2015. See the proof, ecosystem, and pricing model behind the wedding industry disruption.",
      },
      { property: "og:url", content: "https://weddings.io/Who-Owns-Weddings.io" },
      { property: "og:image", content: "https://weddings.io/Who-Owns-Weddings.io/hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Who Owns Weddings.io? Why This Specific Domain Battle Matters" },
      {
        name: "twitter:description",
        content:
          "Industry Army Marketing has owned weddings.io since 2015. See the proof, ecosystem, and pricing model behind the wedding industry disruption.",
      },
      { name: "twitter:image", content: "https://weddings.io/Who-Owns-Weddings.io/hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/Who-Owns-Weddings.io" }],
  }),
  component: WhoOwnsFallback,
});

function WhoOwnsFallback() {
  return (
    <main className="min-h-screen bg-background px-5 py-24 text-foreground">
      <article className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Industry Analysis</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
          Who Owns Weddings.io? Why This Specific Domain Battle Matters
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">
          Industry Army Marketing has owned weddings.io since 2015. The full article, proof record,
          ecosystem links, and pricing model are published at this URL.
        </p>
        <a className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground" href="/pricing/">
          View Weddings.io Pricing
        </a>
      </article>
    </main>
  );
}