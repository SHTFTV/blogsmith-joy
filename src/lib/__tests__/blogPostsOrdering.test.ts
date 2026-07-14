import { describe, it, expect } from "vitest";
import {
  blogPosts,
  sortedBlogPosts,
  homepageCarouselPosts,
  getBlogPost,
} from "@/lib/blogPosts";

describe("blogPosts date ordering", () => {
  it("sortedBlogPosts is strictly newest → oldest by ISO date", () => {
    for (let i = 1; i < sortedBlogPosts.length; i++) {
      expect(
        sortedBlogPosts[i - 1].date >= sortedBlogPosts[i].date,
      ).toBe(true);
    }
  });

  it("homepageCarouselPosts matches sortedBlogPosts (no pinned/featured slot)", () => {
    expect(homepageCarouselPosts.map((p) => p.slug)).toEqual(
      sortedBlogPosts.map((p) => p.slug),
    );
  });

  it("every post has an ISO-8601 (YYYY-MM-DD) date", () => {
    const iso = /^\d{4}-\d{2}-\d{2}$/;
    for (const p of blogPosts) {
      expect(iso.test(p.date), `bad date on ${p.slug}: ${p.date}`).toBe(true);
    }
  });

  it("dateLabel year/month/day matches the ISO date field", () => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];
    for (const p of blogPosts) {
      if (!p.dateLabel) continue;
      const [y, m, d] = p.date.split("-").map(Number);
      const monthName = monthNames[m - 1];
      // Accept "July 14, 2026" or "Jul 14, 2026"
      const okLong = p.dateLabel.includes(monthName)
        && p.dateLabel.includes(String(d))
        && p.dateLabel.includes(String(y));
      expect(okLong, `dateLabel "${p.dateLabel}" does not match ISO "${p.date}" for ${p.slug}`).toBe(true);
    }
  });

  it("PPP post is dated 2026-07-14 and dateLabel matches", () => {
    const ppp = getBlogPost("ppp-pricing-wedding-platform-industry-first");
    expect(ppp).toBeDefined();
    expect(ppp!.date).toBe("2026-07-14");
    expect(ppp!.dateLabel).toMatch(/July\s+14,\s+2026/);
  });

  it("PPP post appears at or before every older-dated post in the carousel", () => {
    const pppIdx = homepageCarouselPosts.findIndex(
      (p) => p.slug === "ppp-pricing-wedding-platform-industry-first",
    );
    expect(pppIdx).toBeGreaterThanOrEqual(0);
    const pppDate = homepageCarouselPosts[pppIdx].date;
    for (let i = pppIdx + 1; i < homepageCarouselPosts.length; i++) {
      expect(homepageCarouselPosts[i].date <= pppDate).toBe(true);
    }
  });
});
