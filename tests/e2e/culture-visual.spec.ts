import { test, expect } from "@playwright/test";

/**
 * Visual regression for the Hispanic Heritage label surface.
 * Baselines are per-project (desktop / tablet / mobile) — Playwright writes them
 * on first run into __screenshots__. Later runs diff against those baselines.
 *
 * Update baselines intentionally with:  bunx playwright test --update-snapshots
 */

test.describe("Culture surface — visual regression", () => {
  test("CultureFeatures grid — Hispanic Heritage card region", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    // Anchor on the card's heading, then screenshot its section container.
    const heading = page.getByRole("heading", { name: /Hispanic Heritage/i }).first();
    await heading.scrollIntoViewIfNeeded();
    // Freeze the rotating headline animation before taking the shot.
    await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
    const card = heading.locator("xpath=ancestor::article[1] | ancestor::section[1] | ancestor::div[contains(@class,'rounded')][1]").first();
    await expect(card).toHaveScreenshot(`culture-card-hispanic-${testInfo.project.name}.png`);
  });

  test("Rotating headline — first frame with animations disabled", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }" });
    // The rotating word lives inside the hero heading — grab the h1.
    const h1 = page.getByRole("heading", { level: 1 }).first();
    await h1.scrollIntoViewIfNeeded();
    await expect(h1).toHaveScreenshot(`rotating-headline-${testInfo.project.name}.png`);
  });

  test("Footer — Cultures Served column includes Hispanic Heritage", async ({ page }, testInfo) => {
    await page.goto("/", { waitUntil: "networkidle" });
    await page.addStyleTag({ content: "*, *::before, *::after { animation: none !important; transition: none !important; }" });
    const footer = page.locator("footer").first();
    await footer.scrollIntoViewIfNeeded();
    await expect(footer).toHaveScreenshot(`footer-${testInfo.project.name}.png`);
  });
});
