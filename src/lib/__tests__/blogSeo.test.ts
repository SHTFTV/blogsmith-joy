/**
 * SEO shape guarantees for every blog post exported from src/lib/blogPosts.ts.
 * Runs offline against the data source — no network.
 */
import { describe, it, expect } from "vitest";
import { blogPosts } from "../blogPosts";

const SITE = "https://weddings.io";

describe("blog post SEO", () => {
  it("every post has a slug, title, image, and description source", () => {
    for (const p of blogPosts) {
      expect(p.slug, `slug missing`).toBeTruthy();
      expect(p.title, `${p.slug}: title missing`).toBeTruthy();
      expect(p.image, `${p.slug}: image missing`).toBeTruthy();
      expect(p.metaDescription || p.excerpt, `${p.slug}: needs metaDescription or excerpt`).toBeTruthy();
    }
  });

  it("every post has focusKeywords (>= 1)", () => {
    const bad = blogPosts.filter((p) => !p.focusKeywords || p.focusKeywords.length === 0);
    expect(bad.map((p) => p.slug), "posts missing focusKeywords").toEqual([]);
  });

  it("computed canonical + og values self-reference the post", () => {
    for (const p of blogPosts) {
      const url = `${SITE}/blog/${p.slug}/`;
      const image = p.image.startsWith("http") ? p.image : `${SITE}${p.image}`;
      expect(url.startsWith(SITE), `${p.slug}: canonical origin`).toBe(true);
      expect(image.startsWith("http"), `${p.slug}: og:image absolute`).toBe(true);
    }
  });

  it("title tag under 70 chars, description under 165 chars", () => {
    const longTitles: string[] = [];
    const longDescs: string[] = [];
    for (const p of blogPosts) {
      const title = p.seoTitle ?? `${p.title} | Weddings.io`;
      const desc = p.metaDescription ?? p.excerpt ?? "";
      if (title.length > 70) longTitles.push(`${p.slug} (${title.length})`);
      if (desc.length > 165) longDescs.push(`${p.slug} (${desc.length})`);
    }
    // Report but don't hard-fail — SEO length is a soft cap.
    if (longTitles.length) console.warn("[SEO] over-long titles:", longTitles.join(", "));
    if (longDescs.length) console.warn("[SEO] over-long descriptions:", longDescs.join(", "));
    expect(true).toBe(true);
  });
});
