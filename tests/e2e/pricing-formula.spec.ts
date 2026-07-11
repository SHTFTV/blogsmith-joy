import { test, expect } from "@playwright/test";

/**
 * Verifies the /pricing page renders territory pricing that exactly matches
 * the formula: max(10, floor(pop / 100_000) * 10), with 1 territory per city
 * for all vendor types.
 */

function expectedPrice(pop: number): number {
  return Math.max(10, Math.floor(Math.max(0, pop) / 100_000) * 10);
}

const SAMPLES: Array<[number, string]> = [
  [0, "$10"],
  [1, "$10"],
  [99_999, "$10"],
  [100_000, "$10"],
  [199_999, "$10"],
  [200_000, "$20"],
  [570_000, "$50"],
  [675_000, "$60"],
  [1_000_000, "$100"],
  [2_900_000, "$290"],
  [9_000_000, "$900"],
];

test.describe("/pricing — territory formula & rules", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("shows the 1-territory-per-city rule", async ({ page }) => {
    const rule = page.getByTestId("one-territory-rule");
    await expect(rule).toBeVisible();
    await expect(rule).toContainText(/1 territory per city/i);
  });

  test("shows the $10 × floor(pop / 100K) formula", async ({ page }) => {
    await expect(page.getByText(/\$10 USD × ⌊ ?population ÷ 100,000 ?⌋/i)).toBeVisible();
  });

  test("calculator matches the formula for sample populations (incl. boundaries)", async ({
    page,
  }) => {
    const input = page.locator("#pop");
    const price = page.getByTestId("calc-price");

    for (const [pop, expected] of SAMPLES) {
      await input.fill(String(pop));
      await expect(price).toHaveText(expected, { timeout: 2_000 });
      // formula sanity
      expect(expected).toBe(`$${expectedPrice(pop)}`);
    }
  });

  test("every rendered city example matches the formula", async ({ page }) => {
    const rows = page.getByTestId("city-row");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const pop = Number(await row.getAttribute("data-population"));
      const expected = `$${expectedPrice(pop)}/mo`;
      await expect(row.getByTestId("city-price")).toHaveText(expected);
    }
  });

  test("vendor ecosystem fee is a single flat $10/year statement", async ({ page }) => {
    await expect(page.getByText(/\$10\/year to join the ecosystem/i)).toBeVisible();
  });
});
