import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, type ReactNode, Fragment } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { getBlogPost, type BlogPost } from "../lib/blogPosts";


/**
 * Minimal, safe inline markdown renderer for blog body paragraphs.
 * Supports: [text](https://url), **bold**, *italic*, `code`, and bare URLs.
 * Everything else renders as plain text — no raw HTML is ever injected.
 */
function renderInlineMarkdown(input: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(\*\*|__)(.+?)\3|(\*|_)(.+?)\5|`([^`]+)`|(https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const isExternal = (u: string) => !u.startsWith("https://weddings.io") && !u.startsWith("/");
  while ((m = pattern.exec(input)) !== null) {
    if (m.index > last) nodes.push(input.slice(last, m.index));
    if (m[1] && m[2]) {
      const ext = isExternal(m[2]);
      nodes.push(
        <a
          key={key++}
          href={m[2]}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] && m[4]) {
      nodes.push(<strong key={key++} className="text-foreground">{m[4]}</strong>);
    } else if (m[5] && m[6]) {
      nodes.push(<em key={key++}>{m[6]}</em>);
    } else if (m[7]) {
      nodes.push(
        <code key={key++} className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.9em]">
          {m[7]}
        </code>,
      );
    } else if (m[8]) {
      nodes.push(
        <a
          key={key++}
          href={m[8]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {m[8]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < input.length) nodes.push(input.slice(last));
  return nodes.length > 0 ? nodes : input;
}


function validateBlogSeo(post: BlogPost, slug: string) {
  const missing: string[] = [];
  if (!post.title) missing.push("title");
  if (!post.metaDescription && !post.excerpt) missing.push("description");
  if (!post.image) missing.push("og:image");
  if (!post.date) missing.push("article:published_time");
  if (!post.category) missing.push("article:section");
  if (missing.length) {
    console.warn(
      `[SEO] /blog/${slug}/ missing fields: ${missing.join(", ")} — edit src/lib/blogPosts.ts`,
    );
  }
}

// Slugs that are served as full static HTML in /public/blog/<slug>/index.html
// instead of being rendered by this React route. We hard-redirect to the file
// so crawlers and social previews see the full article body.
const STATIC_HTML_SLUGS = new Set<string>([
  "Who-Owns-Weddings.io",
  "weddings-io-disruptor-industry-army-marketing",
]);

const STATIC_HTML_REDIRECTS: Record<string, string> = {
  "Who-Owns-Weddings.io": "/Who-Owns-Weddings.io",
  "weddings-io-disruptor-industry-army-marketing": "/Who-Owns-Weddings.io",
};

// Slug aliases: lowercase / punctuation-normalized URL segment → real slug in blogPosts.ts.
// Keeps /blog/who-owns-weddings-io rendering the React route (with per-post head())
// instead of 3xx-redirecting to a different URL that would strip our meta tags.
const SLUG_ALIASES: Record<string, string> = {
  "who-owns-weddings-io": "Who-Owns-Weddings.io",
  "who-owns-weddings.io": "Who-Owns-Weddings.io",
};

function resolveSlug(slug: string): string {
  return SLUG_ALIASES[slug.toLowerCase()] ?? slug;
}

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    // Only redirect exact-case slugs that have a full static HTML article.
    // Lowercase aliases are resolved in-place so the URL keeps its per-post <head>.
    if (STATIC_HTML_SLUGS.has(params.slug)) {
      throw redirect({ href: STATIC_HTML_REDIRECTS[params.slug] });
    }
  },
  head: ({ params }) => {
    const canonicalSlug = resolveSlug(params.slug);
    const post = getBlogPost(canonicalSlug);
    const primaryKeyword = post?.focusKeywords?.[0];
    const rawTitle = post?.seoTitle ?? (post
      ? (primaryKeyword && !post.title.toLowerCase().includes(primaryKeyword.toLowerCase())
        ? `${post.title} — ${primaryKeyword} | Weddings.io`
        : `${post.title} | Weddings.io`)
      : "Weddings.io Blog");
    // Always cap at 70 chars — applies to explicit seoTitle too.
    const title = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
    const baseDesc = post?.metaDescription ?? post?.excerpt ?? "Weddings.io blog article.";
    const withKeyword = post?.metaDescription
      ? baseDesc
      : (primaryKeyword && !baseDesc.toLowerCase().includes(primaryKeyword.toLowerCase())
        ? `${primaryKeyword}: ${baseDesc}`
        : baseDesc);
    // Always cap description at 160 chars.
    const description = withKeyword.length > 160 ? `${withKeyword.slice(0, 159)}…` : withKeyword;
    const keywords = post?.focusKeywords?.join(", ");
    const url = `https://weddings.io/blog/${params.slug}/`;
    const image = post?.image ?? "/opengraph.jpg";
    const absoluteImage = image.startsWith("http") ? image : `https://weddings.io${image}`;



    return {
      meta: [
        { title },
        { name: "description", content: description },
        ...(keywords ? [{ name: "keywords", content: keywords }] : []),
        { property: "og:type", content: "article" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:image", content: absoluteImage },
        { property: "article:published_time", content: post?.date ?? "2026-04-28" },
        { property: "article:modified_time", content: post?.date ?? "2026-04-28" },
        { property: "article:section", content: post?.category ?? "Wedding Planning" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: absoluteImage },
        { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", type: "application/rss+xml", title: "Weddings.io Blog RSS", href: "https://weddings.io/rss.xml" },
      ],
      scripts: post
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: post.title,
                description: post.excerpt,
                image: {
                  "@type": "ImageObject",
                  url: absoluteImage,
                  width: 1200,
                  height: 630,
                },
                author: { "@type": "Organization", name: "Weddings.io Editorial", url: "https://weddings.io" },
                publisher: {
                  "@type": "Organization",
                  name: "Weddings.io",
                  url: "https://weddings.io",
                  logo: { "@type": "ImageObject", url: "https://weddings.io/android-chrome-512x512.png", width: 512, height: 512 },
                },
                datePublished: post.date,
                dateModified: post.date,
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                url,
                inLanguage: "en",
                articleSection: post.category,
                isAccessibleForFree: true,
              }),
            },
            ...(post.faq && post.faq.length > 0
              ? [
                  {
                    type: "application/ld+json",
                    children: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: post.faq.map((f) => ({
                        "@type": "Question",
                        name: f.question,
                        acceptedAnswer: { "@type": "Answer", text: f.answer },
                      })),
                    }),
                  },
                ]
              : []),
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
                  { "@type": "ListItem", position: 2, name: "Blog", item: "https://weddings.io/blog/" },
                  { "@type": "ListItem", position: 3, name: post.title, item: url },
                ],
              }),
            },
          ]
        : [],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug: rawSlug } = Route.useParams();
  const slug = resolveSlug(rawSlug);
  const post = getBlogPost(slug);

  useEffect(() => {
    if (post) validateBlogSeo(post, slug);
    else console.warn(`[SEO] /blog/${slug}/ — post not found in blogPosts`);
  }, [post, slug]);


  if (!post) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <section className="mx-auto max-w-3xl px-5 py-24 text-center md:px-8">
          <h1 className="font-serif text-5xl text-foreground">Article not found</h1>
          <p className="mt-4 text-muted-foreground">This Weddings.io article does not exist.</p>
          <a href="/blog/" className="mt-8 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Back to Blog
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="px-5 py-12 md:px-8 md:py-18">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <a href="/" className="hover:text-primary">Home</a> <span aria-hidden="true">›</span> <a href="/blog/" className="hover:text-primary">Blog</a>
          </nav>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-primary">{post.category}</p>
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">{renderInlineMarkdown(post.title)}</h1>
          <p className="mt-5 text-xl leading-8 text-muted-foreground">{renderInlineMarkdown(post.subtitle)}</p>
          <p className="mt-5 text-sm font-medium text-muted-foreground">{post.dateLabel} · {post.readTime} · Weddings.io Editorial</p>
          <img src={post.image} alt={post.imageAlt ?? post.title} className="mt-10 aspect-[16/9] w-full rounded-lg border border-border object-cover" width={1200} height={630} loading="eager" />
          <div className="mt-12 space-y-7 text-lg leading-9 text-muted-foreground">
            {(post.body ?? []).map((paragraph) => (
              <p key={paragraph}>{renderInlineMarkdown(paragraph)}</p>
            ))}
          </div>


          {post.faq && post.faq.length > 0 && (
            <section className="mt-16" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="font-serif text-3xl text-foreground md:text-4xl">Frequently asked questions</h2>
              <dl className="mt-8 space-y-8">
                {post.faq.map((f) => (
                  <Fragment key={f.question}>
                    <div className="border-t border-border pt-6">
                      <dt className="font-serif text-xl text-foreground">{renderInlineMarkdown(f.question)}</dt>
                      <dd className="mt-3 text-base leading-8 text-muted-foreground">{renderInlineMarkdown(f.answer)}</dd>
                    </div>
                  </Fragment>
                ))}
              </dl>
            </section>
          )}


          {post.sources && post.sources.length > 0 && (
            <aside className="mt-12 rounded-lg border border-border bg-secondary/40 p-6" aria-label="Sources">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                {post.sources.length === 1 ? "Source" : "Sources"}
              </h2>
              <ul className="mt-4 space-y-3 text-base leading-7 text-muted-foreground">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {s.label}
                    </a>
                    {(s.publisher || s.date) && (
                      <span className="block text-sm text-muted-foreground">
                        {s.publisher}
                        {s.publisher && s.date ? " · " : ""}
                        {s.date}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </aside>
          )}
          <nav className="mt-14 border-t border-border pt-8 text-sm text-muted-foreground" aria-label="More articles">
            <a href="/blog/" className="text-primary hover:underline">← All articles on Weddings.io</a>
          </nav>
        </div>
      </article>
    </main>
  );
}
