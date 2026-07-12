/**
 * Snapshot the exact meta tags that /blog/who-owns-weddings-io must emit.
 * Runs the same head() logic the route uses (mirrored inline to avoid
 * importing the full route module and its TanStack Router side-effects).
 */
import { describe, it, expect } from "vitest";
import { getBlogPost } from "../blogPosts";

const SLUG_URL = "who-owns-weddings-io";
const SLUG_ALIASES: Record<string, string> = {
  "who-owns-weddings-io": "Who-Owns-Weddings.io",
  "who-owns-weddings.io": "Who-Owns-Weddings.io",
};
const resolveSlug = (s: string) => SLUG_ALIASES[s.toLowerCase()] ?? s;

function buildHead(slugParam: string) {
  const post = getBlogPost(resolveSlug(slugParam))!;
  const primary = post.focusKeywords?.[0];
  const rawTitle =
    post.seoTitle ??
    (primary && !post.title.toLowerCase().includes(primary.toLowerCase())
      ? `${post.title} — ${primary} | Weddings.io`
      : `${post.title} | Weddings.io`);
  const title = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
  const baseDesc = post.metaDescription ?? post.excerpt ?? "";
  const description = baseDesc.length > 160 ? `${baseDesc.slice(0, 159)}…` : baseDesc;
  const keywords = post.focusKeywords!.join(", ");
  const url = `https://weddings.io/blog/${slugParam}/`;
  const image = post.image.startsWith("http") ? post.image : `https://weddings.io${post.image}`;
  return { title, description, keywords, url, image, category: post.category };
}

describe("/blog/who-owns-weddings-io head tags", () => {
  const h = buildHead(SLUG_URL);

  it("resolves the aliased slug to the real post", () => {
    expect(getBlogPost(resolveSlug(SLUG_URL))?.slug).toBe("Who-Owns-Weddings.io");
  });

  it("emits the exact per-post title", () => {
    expect(h.title).toBe(
      "Who Owns Weddings.io? Why This Specific Domain Battle Matters",
    );
  });

  it("emits the exact per-post meta description", () => {
    expect(h.description.startsWith(
      "Industry Army Marketing has owned Weddings.io since 2015.",
    )).toBe(true);
    expect(h.description.length).toBeLessThanOrEqual(160);
  });

  it("emits the exact focused keywords", () => {
    expect(h.keywords).toBe(
      "Industry Analysis, Industry Army Marketing, Army Marketing Has, Army Marketing, Industry Army, Marketing Has",
    );
  });

  it("emits the exact og:image (absolute, per-post hero)", () => {
    expect(h.image).toBe("https://weddings.io/Who-Owns-Weddings.io/hero.jpg");
  });

  it("emits a self-referencing canonical / og:url", () => {
    expect(h.url).toBe("https://weddings.io/blog/who-owns-weddings-io/");
  });

  it("full head snapshot matches", () => {
    expect(h).toMatchInlineSnapshot(`
      {
        "category": "Industry Analysis",
        "description": "Industry Army Marketing has owned Weddings.io since 2015. Discover how IAM's 150+ domain ecosystem — Videographers.io, Caterers.tv, InsuranceBrokers.io and mor…",
        "image": "https://weddings.io/Who-Owns-Weddings.io/hero.jpg",
        "keywords": "Industry Analysis, Industry Army Marketing, Army Marketing Has, Army Marketing, Industry Army, Marketing Has",
        "title": "Who Owns Weddings.io? Why This Specific Domain Battle Matters",
        "url": "https://weddings.io/blog/who-owns-weddings-io/",
      }
    `);
  });
});
