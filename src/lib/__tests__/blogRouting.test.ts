import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { blogCardHref } from "../../components/BlogCard";
import { sortedBlogPosts, getBlogPost } from "../blogPosts";

const ROOT = join(__dirname, "..", "..", "..");
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const rss = readFileSync(join(ROOT, "public/rss.xml"), "utf8");

// Slugs served as full static HTML (redirected from the React route).
const STATIC_HTML_SLUGS = new Set<string>([
  "Who-Owns-Weddings.io",
  "weddings-io-disruptor-industry-army-marketing",
]);

describe("Blog index routing — no 404s for any card", () => {
  it("every BlogCard href resolves to either a known post or a static HTML file", () => {
    for (const post of sortedBlogPosts) {
      const href = blogCardHref(post);
      expect(href.startsWith("/"), `bad href ${href}`).toBe(true);

      if (STATIC_HTML_SLUGS.has(post.slug)) {
        const staticPath = join(ROOT, "public", `${post.slug}.html`);
        const staticDir = join(ROOT, "public", post.slug, "index.html");
        expect(
          existsSync(staticPath) || existsSync(staticDir) || getBlogPost(post.slug) !== undefined,
          `static slug ${post.slug} has no backing file or post`,
        ).toBe(true);
      } else {
        expect(getBlogPost(post.slug), `missing post for slug ${post.slug}`).toBeDefined();
        expect(href).toBe(`/blog/${post.slug}/`);
      }
    }
  });
});

describe("Sitemap / RSS parity for visible blog posts", () => {
  it("every visible blog post URL is present in sitemap.xml", () => {
    const missing = sortedBlogPosts
      .map((p) => `https://weddings.io/blog/${p.slug}/`)
      .filter((u) => !sitemap.includes(u));
    expect(missing).toEqual([]);
  });

  it("every visible blog post appears as an item in rss.xml", () => {
    const missing = sortedBlogPosts
      .map((p) => `https://weddings.io/blog/${p.slug}/`)
      .filter((u) => !rss.includes(u));
    expect(missing).toEqual([]);
  });

  it("newest post (rebrand announcement) is in both feeds", () => {
    const url = "https://weddings.io/blog/weddings-io-technologies-rebrand-ai-search-brand-identity/";
    expect(sitemap).toContain(url);
    expect(rss).toContain(url);
    expect(rss).toMatch(/<item>[\s\S]*weddings-io-technologies-rebrand-ai-search-brand-identity[\s\S]*<\/item>/);
  });
});
