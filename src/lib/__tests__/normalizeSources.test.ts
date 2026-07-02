import { describe, it, expect } from "vitest";
import { normalizeSources, type BlogPost } from "../blogPosts";

const base: BlogPost = {
  slug: "t",
  title: "t",
  subtitle: "s",
  date: "2026-07-01",
  dateLabel: "Jul 1, 2026",
  category: "c",
  image: "/x.jpg",
  readTime: "1 min",
  excerpt: "e",
  body: [],
};

describe("normalizeSources", () => {
  it("returns post unchanged when no citation fields", () => {
    expect(normalizeSources(base).sources).toBeUndefined();
  });

  it("merges legacy `citation` string into sources", () => {
    const out = normalizeSources({ ...base, citation: "https://a.co" });
    expect(out.sources).toEqual([{ label: "https://a.co", url: "https://a.co" }]);
  });

  it("merges legacy citation object", () => {
    const out = normalizeSources({
      ...base,
      citation: { label: "A", url: "https://a.co", publisher: "P" },
    });
    expect(out.sources?.[0]).toMatchObject({ label: "A", url: "https://a.co", publisher: "P" });
  });

  it("merges sourceUrl + sourceLabel", () => {
    const out = normalizeSources({ ...base, sourceUrl: "https://b.co", sourceLabel: "B" });
    expect(out.sources).toEqual([{ label: "B", url: "https://b.co" }]);
  });

  it("merges citations[] and references[] mixed shapes", () => {
    const out = normalizeSources({
      ...base,
      citations: ["https://a.co", { label: "B", url: "https://b.co" }],
      references: [{ label: "C", url: "https://c.co" }],
    });
    expect(out.sources).toHaveLength(3);
    expect(out.sources?.map((s) => s.url)).toEqual([
      "https://a.co",
      "https://b.co",
      "https://c.co",
    ]);
  });

  it("preserves existing sources and de-dupes by URL", () => {
    const out = normalizeSources({
      ...base,
      sources: [{ label: "A", url: "https://a.co" }],
      citations: ["https://a.co", "https://z.co"],
    });
    expect(out.sources).toHaveLength(2);
    expect(out.sources?.map((s) => s.url)).toEqual(["https://a.co", "https://z.co"]);
  });

  it("ignores objects with no url", () => {
    const out = normalizeSources({
      ...base,
      // @ts-expect-error deliberate bad shape
      citations: [{ label: "bad" }],
    });
    expect(out.sources).toBeUndefined();
  });
});
