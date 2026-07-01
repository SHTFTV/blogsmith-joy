import { createFileRoute } from "@tanstack/react-router";
import articleHtml from "../content/who-owns-weddings-io.html?raw";

function extractTagContent(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

const articleStyle = extractTagContent(articleHtml, "style");
const articleBody = extractTagContent(articleHtml, "body");
const articleJsonLd =
  articleHtml
    .match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/i)?.[1]
    ?.trim() ?? "";

export const Route = createFileRoute("/Who-Owns-Weddings.io")({
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
    scripts: [
      ...(articleJsonLd ? [{ type: "application/ld+json", children: articleJsonLd }] : []),
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              "@id": "https://weddings.io/Who-Owns-Weddings.io#article",
              isPartOf: { "@type": "WebPage", "@id": "https://weddings.io/Who-Owns-Weddings.io" },
              headline: "Who Owns Weddings.io? Why This Specific Domain Battle Matters",
              description:
                "The complete history, WHOIS receipts, and Wayback records establishing Industry Army Marketing's continuous ownership of weddings.io since 2015.",
              url: "https://weddings.io/Who-Owns-Weddings.io",
              mainEntityOfPage: "https://weddings.io/Who-Owns-Weddings.io",

              image: {
                "@type": "ImageObject",
                url: "https://weddings.io/Who-Owns-Weddings.io/hero.jpg",
                width: 1200,
                height: 630,
              },
              datePublished: "2026-06-15",
              dateModified: "2026-07-01",
              author: {
                "@type": "Person",
                name: "Colin Hamilton",
                url: "https://www.linkedin.com/in/colin-hamilton-5a9299407/",
              },
              publisher: {
                "@type": "Organization",
                "@id": "https://industryarmymarketing.com/#organization",
                name: "Industry Army Marketing",
                url: "https://industryarmymarketing.com",
                logo: {
                  "@type": "ImageObject",
                  url: "https://weddings.io/android-chrome-512x512.png",
                  width: 512,
                  height: 512,
                },
              },
              sameAs: [
                "https://www.industryarmymarketing.com/case-studies/brand-defense-global-territory",
                "https://www.linkedin.com/in/colin-hamilton-5a9299407/",
              ],

            },
          ],
        }),
      },
    ],

  }),
  component: WhoOwnsWeddingsArticle,
});

function WhoOwnsWeddingsArticle() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: articleStyle }} />
      <div dangerouslySetInnerHTML={{ __html: articleBody }} />
    </>
  );
}