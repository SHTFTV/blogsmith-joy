import { test, expect } from "@playwright/test";

/**
 * Home page blog section: exactly 4 posts in standard rotation.
 * No Featured badge, no featured layout variant, uniform card template.
 */
test.describe("Home page blog rotation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Scroll the "Latest from the Blog" section into view.
    await page.getByText("Latest from the Blog").scrollIntoViewIfNeeded();
  });

  test("renders exactly 4 blog cards", async ({ page }) => {
    const section = page.locator("section", {
      has: page.getByText("Latest from the Blog"),
    });
    const cards = section.locator('a[href^="/blog/"], a[href^="/journal/"], a[href^="/Who-Owns"]');
    await expect(cards).toHaveCount(4);
  });

  test("no featured badge appears in the blog section", async ({ page }) => {
    const section = page.locator("section", {
      has: page.getByText("Latest from the Blog"),
    });
    await expect(section.getByText(/^Featured$/i)).toHaveCount(0);
  });

  test("no author bylines appear in the blog section", async ({ page }) => {
    const section = page.locator("section", {
      has: page.getByText("Latest from the Blog"),
    });
    // No "By ..." or explicit author names on cards.
    await expect(section.getByText(/\bBy\s+[A-Z]/)).toHaveCount(0);
    await expect(section.getByText(/Anit Kumar/i)).toHaveCount(0);
  });

  test("all blog cards use the same aspect ratio / template", async ({ page }) => {
    const section = page.locator("section", {
      has: page.getByText("Latest from the Blog"),
    });
    const images = section.locator("img");
    const count = await images.count();
    expect(count).toBeGreaterThanOrEqual(4);
    // Every card image is lazy-loaded (no eager featured variant).
    for (let i = 0; i < count; i++) {
      await expect(images.nth(i)).toHaveAttribute("loading", "lazy");
    }
  });
});
