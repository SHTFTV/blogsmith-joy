import { describe, it, expect } from "vitest";
import { blogCardHref } from "../../components/BlogCard";
import { sortedBlogPosts, getBlogPost } from "../blogPosts";

describe("BlogCard href routing", () => {
  it("routes standard slugs to /blog/<slug>/", () => {
    expect(blogCardHref({ slug: "any-post" })).toBe("/blog/any-post/");
  });

  it("routes the Who-Owns exception to /Who-Owns-Weddings.io", () => {
    expect(blogCardHref({ slug: "Who-Owns-Weddings.io" })).toBe("/Who-Owns-Weddings.io");
  });

  it("routes the manifesto to its /blog/ URL and the post is retrievable", () => {
    const slug = "record-record-domain-provenance-vs-generative-conflation";
    expect(blogCardHref({ slug })).toBe(`/blog/${slug}/`);
    expect(getBlogPost(slug)).toBeDefined();
  });

  it("has no duplicate slugs across all blog posts", () => {
    const slugs = sortedBlogPosts.map((p) => p.slug);
    const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i);
    expect(dupes).toEqual([]);
  });

  it("every visible post resolves via getBlogPost() and every card href is a valid route shape", () => {
    for (const post of sortedBlogPosts) {
      expect(getBlogPost(post.slug), `missing post for slug ${post.slug}`).toBeDefined();
      const href = blogCardHref(post);
      expect(href.startsWith("/"), `bad href ${href}`).toBe(true);
    }
  });
});
