import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sortedBlogPosts, getBlogPost } from "@/lib/blogPosts";

const rss = readFileSync(resolve(process.cwd(), "public/rss.xml"), "utf8");
const sitemap = readFileSync(resolve(process.cwd(), "public/sitemap.xml"), "utf8");

const PPP_SLUG = "ppp-pricing-wedding-platform-industry-first";
const PPP_URL = `https://weddings.io/blog/${PPP_SLUG}/`;

function extractItems(xml: string) {
  const items: { link: string; pubDate: string }[] = [];
  const re = /<item>[\s\S]*?<link>([^<]+)<\/link>[\s\S]*?<pubDate>([^<]+)<\/pubDate>[\s\S]*?<\/item>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) items.push({ link: m[1], pubDate: m[2] });
  return items;
}

describe("RSS feed snapshot & ordering", () => {
  it("PPP item is present with a 2026-07-14 pubDate", () => {
    const items = extractItems(rss);
    const ppp = items.find((i) => i.link === PPP_URL);
    expect(ppp, "PPP <item> missing from RSS").toBeDefined();
    // Snapshot the pubDate string so any drift is caught explicitly.
    expect(ppp!.pubDate).toMatchInlineSnapshot(`"Tue, 14 Jul 2026 13:00:00 GMT"`);
  });

  it("RSS items are ordered newest → oldest by pubDate", () => {
    const items = extractItems(rss);
    for (let i = 1; i < items.length; i++) {
      const prev = Date.parse(items[i - 1].pubDate);
      const cur = Date.parse(items[i].pubDate);
      expect(prev >= cur, `RSS out of order: ${items[i - 1].link} → ${items[i].link}`).toBe(true);
    }
  });

  it("PPP appears before every strictly-older post in the RSS feed", () => {
    const items = extractItems(rss);
    const pppIdx = items.findIndex((i) => i.link === PPP_URL);
    const pppAt = Date.parse(items[pppIdx].pubDate);
    for (let i = pppIdx + 1; i < items.length; i++) {
      expect(Date.parse(items[i].pubDate) <= pppAt).toBe(true);
    }
  });
});

describe("sitemap snapshot", () => {
  it("PPP <url> is present with a 2026-07-14 lastmod", () => {
    const block = new RegExp(
      `<url>\\s*<loc>${PPP_URL.replace(/[/]/g, "\\/")}<\\/loc>\\s*<lastmod>([^<]+)<\\/lastmod>`,
    ).exec(sitemap);
    expect(block, "PPP <url> missing from sitemap").not.toBeNull();
    expect(block![1]).toMatchInlineSnapshot(`"2026-07-14"`);
  });

  it("sitemap contains a <url> block for every blog post slug", () => {
    for (const post of sortedBlogPosts) {
      const url = `https://weddings.io/blog/${post.slug}/`;
      expect(sitemap.includes(`<loc>${url}</loc>`), `sitemap missing ${url}`).toBe(true);
    }
  });

  it("source-of-truth PPP date in blogPosts.ts is 2026-07-14", () => {
    const ppp = getBlogPost(PPP_SLUG);
    expect(ppp?.date).toMatchInlineSnapshot(`"2026-07-14"`);
    expect(ppp?.dateLabel).toMatchInlineSnapshot(`"July 14, 2026"`);
  });
});
