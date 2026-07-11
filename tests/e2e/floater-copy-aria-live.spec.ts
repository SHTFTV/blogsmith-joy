import { test, expect } from "@playwright/test";

/**
 * Confirms the IAM floater's aria-live region announces "Copied" for BOTH
 * the tooltip copy-address button and the modal copy-address button.
 * The single #iamf-live region is polite + role=status, so it is what
 * screen readers pick up.
 *
 * These tests fire clicks via page.evaluate() rather than Playwright's
 * .click() because the floater's absolutely-positioned tooltips and
 * modal overlays can move under Playwright's actionability checks and
 * cause flaky retries. We're verifying the JS behaviour, not the
 * pointer-event pipeline, so direct DOM click() is appropriate.
 */

test.describe("IAM floater copy → aria-live announcement", () => {
  test.beforeEach(async ({ page }) => {
    // Force the execCommand fallback path so the aria-live assertion is
    // never blocked by async clipboard permission gates in headless.
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "clipboard", { value: undefined, configurable: true });
    });
    await page.goto("/");
    await page.waitForSelector("#iamf-tab");
    // Open the floater panel and wait for it to be actually visible.
    await page.evaluate(() => (document.getElementById("iamf-tab") as HTMLButtonElement)?.click());
    await page.waitForSelector("#iamf-panel:not([hidden])");
    await page.waitForSelector('button.iamf-logo[data-iamf-brand="eyespyr"]', { state: "visible" });
  });

  test("aria-live region has the correct SR attributes", async ({ page }) => {
    const live = page.locator("#iamf-live");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveAttribute("role", "status");
    await expect(live).toHaveAttribute("aria-atomic", "true");
  });

  test("tooltip Copy address triggers polite announcement", async ({ page }) => {
    // Open tooltip
    await page.evaluate(() =>
      (document.querySelector('button.iamf-logo[data-iamf-brand="eyespyr"]') as HTMLButtonElement)?.click(),
    );
    await expect(
      page.locator('button.iamf-logo[data-iamf-brand="eyespyr"]'),
    ).toHaveClass(/iamf-tip-open/);

    // Fire copy
    await page.evaluate(() =>
      (document.querySelector('button.iamf-logo[data-iamf-brand="eyespyr"] .iamf-tip-copy') as HTMLButtonElement)?.click(),
    );

    const live = page.locator("#iamf-live");
    await expect(live).toContainText("Address copied to clipboard");
    await expect(live).toContainText("eyespyr.com");
  });

  test("modal Copy address triggers polite announcement + locks scroll", async ({ page }) => {
    // Open tooltip → open modal via the View details button
    await page.evaluate(() =>
      (document.querySelector('button.iamf-logo[data-iamf-brand="talctv"]') as HTMLButtonElement)?.click(),
    );
    await expect(
      page.locator('button.iamf-logo[data-iamf-brand="talctv"]'),
    ).toHaveClass(/iamf-tip-open/);

    await page.evaluate(() =>
      (document.querySelector('button.iamf-logo[data-iamf-brand="talctv"] .iamf-tip-details') as HTMLButtonElement)?.click(),
    );
    await expect(page.locator("#iamf-modal")).toBeVisible();

    // Body scroll should be locked while the modal is open
    await expect(page.locator("body")).toHaveCSS("position", "fixed");

    // Fire the modal's copy button
    await page.evaluate(() =>
      (document.getElementById("iamf-modal-copy") as HTMLButtonElement)?.click(),
    );

    const live = page.locator("#iamf-live");
    await expect(live).toContainText("Address copied to clipboard");
    await expect(live).toContainText("talc.tv");
  });
});
