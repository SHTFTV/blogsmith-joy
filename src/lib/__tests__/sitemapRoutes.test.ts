import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const robots = readFileSync(join(ROOT, "public/robots.txt"), "utf8");
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const blogPosts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");

const SITE = "https://weddings.io";

function locs(xml: string): string[] {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

describe("robots.txt ↔ sitemap.xml wiring", () => {
  it("robots.txt references the canonical sitemap URL", () => {
    expect(robots).toMatch(new RegExp(`^Sitemap:\\s*${SITE}/sitemap\\.xml\\s*$`, "m"));
  });

  it("sitemap.xml is well-formed XML with at least one <loc>", () => {
    expect(sitemap).toMatch(/<\?xml/);
    expect(locs(sitemap).length).toBeGreaterThan(0);
  });
});

describe("sitemap.xml route coverage", () => {
  const urls = new Set(locs(sitemap));

  it("includes core public routes", () => {
    for (const path of ["/", "/about", "/blog/", "/vendors", "/eyespyr", "/ecosystem/"]) {
      expect(urls.has(`${SITE}${path}`)).toBe(true);
    }
  });

  it("has no duplicate <loc> entries", () => {
    const all = locs(sitemap);
    const dupes = all.filter((u, i) => all.indexOf(u) !== i);
    expect(dupes).toEqual([]);
  });

  it("every URL uses the canonical https://weddings.io origin", () => {
    for (const u of urls) {
      expect(u.startsWith(`${SITE}/`)).toBe(true);
    }
  });

  it("every visible blog post appears in the sitemap", () => {
    const visibleBlock = blogPosts.match(/visibleBlogSlugs[\s\S]*?\[([\s\S]*?)\]/)?.[1] ?? "";
    const slugs = [...visibleBlock.matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    expect(slugs.length).toBeGreaterThan(0);
    const missing = slugs.filter((s) => !urls.has(`${SITE}/blog/${s}/`));
    expect(missing).toEqual([]);
  });
});
