import { test, expect } from "@playwright/test";

/**
 * Confirms the IAM floater's aria-live region announces "Copied" for BOTH
 * the tooltip copy-address button and the modal copy-address button.
 * The single #iamf-live region is polite + role=status, so it is what
 * screen readers pick up.
 */

test.describe("IAM floater copy → aria-live announcement", () => {
  test.beforeEach(async ({ page, context }) => {
    // Some browsers gate clipboard behind permission; grant when supported.
    try {
      await context.grantPermissions(["clipboard-read", "clipboard-write"], {
        origin: "http://localhost:8080",
      });
    } catch {
      /* not supported in all browsers — script has a document.execCommand fallback */
    }
    // Force the execCommand fallback path so we never depend on async clipboard
    // permission for the aria-live assertion.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    });
    await page.goto("/");
    await page.waitForSelector("#iamf-tab");
    await page.click("#iamf-tab");
    await page.waitForSelector("#iamf-panel:not([hidden])");
  });

  test("tooltip Copy address triggers polite announcement", async ({ page }) => {
    const live = page.locator("#iamf-live");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveAttribute("role", "status");

    const tile = page.locator('button.iamf-logo[data-iamf-brand="eyespyr"]');
    await tile.click();
    await expect(tile).toHaveClass(/iamf-tip-open/);

    // Fire the copy button via JS to avoid flakiness on nested absolutely-positioned tooltips.
    await page.evaluate(() =>
      (document.querySelector('button.iamf-logo[data-iamf-brand="eyespyr"] .iamf-tip-copy') as HTMLButtonElement)?.click(),
    );

    // aria-live region receives the address string (this is the SR-visible signal)
    await expect(live).toContainText("Address copied to clipboard");
    await expect(live).toContainText("eyespyr.com");
  });

  test("modal Copy address triggers polite announcement", async ({ page }) => {
    const live = page.locator("#iamf-live");

    const tile = page.locator('button.iamf-logo[data-iamf-brand="talctv"]');
    await tile.click();
    await expect(tile).toHaveClass(/iamf-tip-open/);

    // Force-click the details button — the tooltip button lives inside the tile
    // and can flicker under Playwright's actionability checks.
    await page.evaluate(() =>
      (document.querySelector('button.iamf-logo[data-iamf-brand="talctv"] .iamf-tip-details') as HTMLButtonElement)?.click(),
    );
    await expect(page.locator("#iamf-modal")).toBeVisible();

    // Body scroll should be locked while the modal is open
    await expect(page.locator("body")).toHaveCSS("position", "fixed");

    await page.evaluate(() => (document.getElementById("iamf-modal-copy") as HTMLButtonElement)?.click());

    await expect(live).toContainText("Address copied to clipboard");
    await expect(live).toContainText("talc.tv");
  });
});
