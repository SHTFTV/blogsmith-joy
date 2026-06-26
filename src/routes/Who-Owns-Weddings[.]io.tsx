import { createFileRoute } from "@tanstack/react-router";
import articleHtml from "../content/who-owns-weddings-io.html?raw";

const headers = {
  "content-type": "text/html; charset=utf-8",
  "cache-control": "public, max-age=300",
};

export const Route = createFileRoute("/Who-Owns-Weddings.io")({
  server: {
    handlers: {
      GET: async () => new Response(articleHtml, { headers }),
      HEAD: async () => new Response(null, { headers }),
    },
  },
  head: () => ({
    meta: [
      { title: "Who Owns Weddings.io? Why This Specific Domain Battle Matters" },
      {
        name: "description",
        content:
          "Industry Army Marketing has owned weddings.io since 2015. The full weddings.io ecosystem, proof links, pricing model, and disruption case.",
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
});