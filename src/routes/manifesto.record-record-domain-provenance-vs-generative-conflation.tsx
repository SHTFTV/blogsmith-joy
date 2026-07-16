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
      <section
        aria-labelledby="evidence-heading"
        className="mx-auto max-w-3xl px-6 pb-20"
      >
        <h2 id="evidence-heading" className="text-2xl font-semibold mb-3">
          Exhibit A — Evidence of Algorithmic Conflation
        </h2>
        <p className="mb-2">
          The following screenshots were captured from Google Search
          (incognito, en-CA) on <time dateTime={EVIDENCE_CAPTURE_DATE}>July 15, 2026</time>{" "}
          for the query <code>weddings.io</code>. Google's AI Overview
          synthesizes a single "Weddings.io (aiWeddings.io)" entity,
          fusing the continuously-operated weddings.io root domain
          (est. May 13, 2015, Langley BC) with the unrelated Ontario
          entity aiweddings.io. These captures are preserved here as a
          contemporaneous public record.
        </p>
        <p className="mb-6">
          Framework and legal rationale:{" "}
          <a href={IAM_ENTITY_AUTHORITY_URL} rel="noopener">
            Beyond the Domain Name — Entity Authority in Modern SEO
          </a>{" "}
          (Industry Army Marketing).
        </p>
        <figure className="mb-8">
          <img
            src={serpEvidence.url}
            alt="Google SERP for the query weddings.io on July 15, 2026, showing aiweddings.io ranked first above the official weddings.io result."
            loading="lazy"
            className="w-full h-auto border border-neutral-200 rounded"
          />
          <figcaption className="text-sm text-neutral-600 mt-2">
            Fig. 1 — Google organic results for <code>weddings.io</code>,
            captured 2026-07-15. The unrelated aiweddings.io listing
            appears above the official weddings.io result.
          </figcaption>
        </figure>
        <figure className="mb-4">
          <img
            src={aiOverviewEvidence.url}
            alt="Google AI Overview stating 'Weddings.io (aiWeddings.io) is an AI-powered wedding planning platform,' conflating two separate entities."
            loading="lazy"
            className="w-full h-auto border border-neutral-200 rounded"
          />
          <figcaption className="text-sm text-neutral-600 mt-2">
            Fig. 2 — Google AI Overview for the same query, captured
            2026-07-15, explicitly conflating weddings.io with
            aiweddings.io in the lead sentence and citing AIWeddings
            as the primary source.
          </figcaption>
        </figure>
      </section>
    </>
  );
}
