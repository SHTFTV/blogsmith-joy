import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "../components/SiteHeader";
import { getBlogPost, type BlogPost } from "../lib/blogPosts";

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

export const Route = createFileRoute("/blog/$slug")({
  beforeLoad: ({ params }) => {
    if (STATIC_HTML_SLUGS.has(params.slug)) {
      throw redirect({ href: STATIC_HTML_REDIRECTS[params.slug] });
    }
  },
  head: ({ params }) => {
    const post = getBlogPost(params.slug);
    const title = post?.seoTitle ?? (post ? `${post.title} | Weddings.io` : "Weddings.io Blog");
    const description = post?.metaDescription ?? post?.excerpt ?? "Weddings.io blog article.";
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
          ]
        : [],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
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
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">{post.title}</h1>
          <p className="mt-5 text-xl leading-8 text-muted-foreground">{post.subtitle}</p>
          <p className="mt-5 text-sm font-medium text-muted-foreground">{post.dateLabel} · {post.readTime} · Weddings.io Editorial</p>
          <img src={post.image} alt={post.imageAlt ?? post.title} className="mt-10 aspect-[16/9] w-full rounded-lg border border-border object-cover" width={1200} height={630} loading="eager" />
          <div className="mt-12 space-y-7 text-lg leading-9 text-muted-foreground">
            {post.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
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
