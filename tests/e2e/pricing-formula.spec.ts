import { test, expect } from "@playwright/test";

/**
 * Verifies the /pricing page renders territory pricing that exactly matches
 * the formula: max(10, floor(pop / 100_000) * 10), with 1 territory per city
 * for all vendor types. Currency is whole-dollar USD (no decimals).
 */

function expectedPrice(pop: number): number {
  return Math.max(10, Math.floor(Math.max(0, pop) / 100_000) * 10);
}

function formatUsd(n: number): string {
  return `$${n.toLocaleString("en-US")}`;
}

// Small values, boundaries, large steps — floor must never drop below $10.
const SAMPLES: number[] = [
  0, 1, 100, 999, 1_000, 9_999, 50_000, 99_999,
  100_000, 100_001, 149_999, 199_999,
  200_000, 299_999, 300_000,
  570_000, 675_000, 999_999,
  1_000_000, 1_099_999, 1_100_000,
  2_900_000, 8_300_000, 9_000_000,
  20_000_000, 100_000_000,
];

test.describe("/pricing — territory formula & rules", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
  });

  test("shows the 1-territory-per-city callout", async ({ page }) => {
    const rule = page.getByTestId("one-territory-rule");
    await expect(rule).toBeVisible();
    await expect(rule).toContainText(/1 territory per city/i);
    await expect(rule).toContainText(/one exclusive slot per city/i);
  });

  test("shows the $10 × floor(pop / 100K) formula and boundary examples", async ({ page }) => {
    await expect(page.getByText(/\$10 USD × ⌊ ?population ÷ 100,000 ?⌋/i)).toBeVisible();
    // Boundary examples that ship in the page copy.
    for (const line of [
      /Pop 99,999.*\$10\/mo/i,
      /Pop 100,000.*\$10\/mo/i,
      /Pop 199,999.*\$10\/mo/i,
      /Pop 200,000.*\$20\/mo/i,
    ]) {
      await expect(page.getByText(line)).toBeVisible();
    }
  });

  test("calculator matches the formula and uses whole-dollar formatting for every sample", async ({
    page,
  }) => {
    const input = page.locator("#pop");
    const price = page.getByTestId("calc-price");

    for (const pop of SAMPLES) {
      const expectedNum = expectedPrice(pop);
      // Floor invariant.
      expect(expectedNum).toBeGreaterThanOrEqual(10);
      expect(expectedNum % 10).toBe(0);

      await input.fill(String(pop));
      await expect(price).toHaveText(formatUsd(expectedNum), { timeout: 2_000 });

      // Currency formatting: whole-dollar, comma-grouped, no decimals.
      const rendered = (await price.textContent())?.trim() ?? "";
      expect(rendered).toMatch(/^\$[\d,]+$/);
      expect(rendered).not.toMatch(/\./);
    }
  });

  test("every rendered city example matches the formula and formatting", async ({ page }) => {
    const rows = page.getByTestId("city-row");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const pop = Number(await row.getAttribute("data-population"));
      const expectedNum = expectedPrice(pop);
      expect(expectedNum).toBeGreaterThanOrEqual(10);

      const cell = row.getByTestId("city-price");
      await expect(cell).toHaveText(`${formatUsd(expectedNum)}/mo`);
      const txt = (await cell.textContent())?.trim() ?? "";
      expect(txt).toMatch(/^\$[\d,]+\/mo$/);
    }
  });

  test("vendor ecosystem fee is a single flat $10/year statement", async ({ page }) => {
    await expect(page.getByText(/\$10\/year to join the ecosystem/i)).toBeVisible();
  });
});
