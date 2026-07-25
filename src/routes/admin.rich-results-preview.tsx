import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { blogPosts, type BlogPost } from "@/lib/blogPosts";

export const Route = createFileRoute("/admin/rich-results-preview")({
  head: () => ({
    meta: [
      { title: "Rich Results Preview | Weddings.io Admin" },
      { name: "description", content: "Preview the JSON-LD emitted for each blog post alongside the page sections it is derived from." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RichResultsPreviewPage,
});

const ORG_ID = "https://weddings.io/#organization";
const abs = (u: string) => (u?.startsWith("http") ? u : `https://weddings.io${u}`);

function buildGraph(post: BlogPost) {
  const url = `https://weddings.io/blog/${post.slug}/`;
  const blogPosting = {
    "@type": "BlogPosting",
    "@id": `${url}#blogposting`,
    headline: post.title,
    description: post.excerpt,
    image: { "@type": "ImageObject", url: abs(post.image), width: 1200, height: 630 },
    author: [
      { "@type": "Organization", name: "Weddings.io Editorial", url: "https://weddings.io/about/" },
      { "@type": "Person", name: "Weddings.io Editorial Team", worksFor: { "@id": ORG_ID } },
    ],
    publisher: { "@id": ORG_ID },
    datePublished: post.date,
    dateModified: post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: "en",
    articleSection: post.category,
    isAccessibleForFree: true,
  };
  const faqPage = post.faq?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }
    : null;
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://weddings.io/blog/" },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };
  return {
    article: {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", "@id": ORG_ID, name: "Weddings.io Technologies", url: "https://weddings.io" },
        blogPosting,
      ],
    },
    faqPage,
    breadcrumb,
  };
}

type FieldMap = { field: string; source: string; value: string | undefined };
function derivationMap(post: BlogPost): FieldMap[] {
  return [
    { field: "BlogPosting.headline", source: "post.title (H1)", value: post.title },
    { field: "BlogPosting.description", source: "post.excerpt (lede)", value: post.excerpt },
    { field: "BlogPosting.image.url", source: "post.image (featured image)", value: abs(post.image) },
    { field: "BlogPosting.datePublished", source: "post.date (byline)", value: post.date },
    { field: "BlogPosting.articleSection", source: "post.category (chip)", value: post.category },
    { field: "BlogPosting.url / mainEntityOfPage", source: "canonical route", value: `https://weddings.io/blog/${post.slug}/` },
    { field: "FAQPage.mainEntity", source: "post.faq[] (FAQ section)", value: post.faq ? `${post.faq.length} Q&A` : "— none —" },
    { field: "BreadcrumbList[3].name", source: "post.title", value: post.title },
  ];
}

function RichResultsPreviewPage() {
  const sorted = useMemo(
    () => [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1)),
    [],
  );
  const [slug, setSlug] = useState(sorted[0]?.slug ?? "");
  const post = sorted.find((p) => p.slug === slug) ?? sorted[0];
  const graphs = useMemo(() => (post ? buildGraph(post) : null), [post]);
  const rows = useMemo(() => (post ? derivationMap(post) : []), [post]);

  if (!post || !graphs) return <div className="p-8">No posts.</div>;

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-serif">Rich Results Preview</h1>
          <p className="text-sm text-neutral-400">
            Final JSON-LD graph emitted for each blog post at build time, mapped back to the
            rendered page sections it is derived from. Read-only; use to spot-check schema
            eligibility without opening the Google Rich Results Test.
          </p>
          <label className="mt-2 text-xs uppercase tracking-wider text-neutral-500">Post</label>
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm max-w-2xl"
          >
            {sorted.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.date} — {p.title}
              </option>
            ))}
          </select>
        </header>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-300">
              Rendered page → JSON-LD field derivation
            </h2>
            <table className="w-full text-xs">
              <thead className="text-neutral-500">
                <tr>
                  <th className="text-left py-1 pr-3">JSON-LD field</th>
                  <th className="text-left py-1 pr-3">Source (page section)</th>
                  <th className="text-left py-1">Value</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.field} className="border-t border-neutral-800 align-top">
                    <td className="py-2 pr-3 font-mono text-amber-200">{r.field}</td>
                    <td className="py-2 pr-3 text-neutral-400">{r.source}</td>
                    <td className="py-2 text-neutral-200 break-all">
                      {r.value ? r.value.slice(0, 140) : <em className="text-red-400">missing</em>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-neutral-800 bg-neutral-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-300">
              Live preview (hero + title + excerpt)
            </h2>
            <div className="overflow-hidden rounded border border-neutral-800">
              <img src={post.image} alt={post.imageAlt ?? ""} className="w-full h-48 object-cover" />
              <div className="p-3">
                <div className="text-[10px] uppercase tracking-widest text-amber-300">{post.category}</div>
                <div className="font-serif text-lg mt-1">{post.title}</div>
                <p className="text-xs text-neutral-400 mt-1">{post.excerpt}</p>
                <div className="text-[10px] text-neutral-500 mt-2">
                  {post.dateLabel} · {post.readTime ?? "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <JsonBlock title="Article graph (Organization + BlogPosting)" data={graphs.article} />
          {graphs.faqPage ? (
            <JsonBlock title="FAQPage" data={graphs.faqPage} />
          ) : (
            <div className="rounded border border-dashed border-neutral-800 p-3 text-xs text-neutral-500">
              No FAQPage schema emitted — this post has no <code>faq</code> entries.
            </div>
          )}
          <JsonBlock title="BreadcrumbList" data={graphs.breadcrumb} />
        </section>
      </main>
    </div>
  );
}

function JsonBlock({ title, data }: { title: string; data: unknown }) {
  const json = JSON.stringify(data, null, 2);
  return (
    <div className="rounded-lg border border-neutral-800 bg-black/70">
      <div className="flex items-center justify-between border-b border-neutral-800 px-3 py-2">
        <div className="text-xs font-semibold uppercase tracking-wider text-amber-300">{title}</div>
        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(json)}
          className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-amber-300"
        >
          Copy
        </button>
      </div>
      <pre className="overflow-auto p-3 text-[11px] leading-snug text-neutral-200 max-h-[420px]">
        {json}
      </pre>
    </div>
  );
}
