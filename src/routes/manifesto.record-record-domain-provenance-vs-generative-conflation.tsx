import { createFileRoute } from "@tanstack/react-router";
import articleHtml from "../content/record-record-domain-provenance-vs-generative-conflation.html?raw";
import aiOverviewEvidence from "@/assets/google-ai-overview-conflation.png.asset.json";
import serpEvidence from "@/assets/google-serp-weddings-io.png.asset.json";

const IAM_ENTITY_AUTHORITY_URL =
  "https://www.industryarmymarketing.com/blog/beyond-domain-name-entity-authority-modern-seo";
const EVIDENCE_CAPTURE_DATE = "2026-07-15";

function extractTagContent(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

const articleStyle = extractTagContent(articleHtml, "style");
const articleBody = extractTagContent(articleHtml, "body");

const CANONICAL =
  "https://weddings.io/manifesto/record-record-domain-provenance-vs-generative-conflation";
const MIRROR =
  "https://industryarmymarketing.com/blog/record-record-domain-provenance-vs-generative-conflation";
const WEBSITE_SAMEAS = ["https://weddings.io", "https://industryarmymarketing.com"];
const RECORD_SAMEAS = [CANONICAL, MIRROR];

export const Route = createFileRoute(
  "/manifesto/record-record-domain-provenance-vs-generative-conflation",
)({
  head: () => ({
    meta: [
      { title: "The Record Record — Domain Provenance vs. Generative Conflation" },
      {
        name: "description",
        content:
          "A public legal-style record and shippable technical blueprint: how Industry Army Marketing defends the weddings.io root domain (est. May 13, 2015) against AI Overview entity conflation.",
      },
      { property: "og:type", content: "article" },
      { property: "og:title", content: "The Record Record — Domain Provenance vs. Generative Conflation" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://weddings.io/#website",
              url: "https://weddings.io",
              name: "Weddings.io",
              sameAs: WEBSITE_SAMEAS,
              publisher: {
                "@type": "Organization",
                name: "Industry Army Marketing",
                url: "https://industryarmymarketing.com",
                sameAs: WEBSITE_SAMEAS,
              },
            },
            {
              "@type": "Article",
              "@id": `${CANONICAL}#article`,
              headline:
                "The Record Record — A Legal and Technical Manifesto on Domain Provenance vs. Generative Conflation",
              url: CANONICAL,
              mainEntityOfPage: CANONICAL,
              sameAs: RECORD_SAMEAS,
              isPartOf: { "@id": "https://weddings.io/#website" },
              author: {
                "@type": "Organization",
                name: "Industry Army Marketing",
                url: "https://industryarmymarketing.com",
              },
              datePublished: "2026-07-05",
            },
            {
              "@type": "ItemPage",
              "@id": `${CANONICAL}#webpage`,
              url: CANONICAL,
              name: "Notice of Algorithmic Entity Disambiguation and Brand Conflation Liability",
              isPartOf: { "@id": "https://weddings.io/#website" },
              sameAs: RECORD_SAMEAS,
              mainEntity: {
                "@type": "Action",
                name: "Administrative Dispute Notification",
                sameAs: RECORD_SAMEAS,
                subjectOf: {
                  "@type": "Legislation",
                  name: "Business Names Act, R.S.O. 1990, c. B.17, s. 32",
                  jurisdiction: "Canada",
                },
              },
            },
          ],
        }),
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      {articleStyle ? <style dangerouslySetInnerHTML={{ __html: articleStyle }} /> : null}
      <article
        className="prose prose-lg mx-auto max-w-3xl px-6 py-16"
        dangerouslySetInnerHTML={{ __html: articleBody }}
      />
    </>
  );
}
