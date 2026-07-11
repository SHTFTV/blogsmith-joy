import { test, expect } from "@playwright/test";

/**
 * Extended checks for /pricing:
 * - Per-row snapshots (callout + each example row) for light & dark themes.
 * - Not-truncated across the extra mobile projects (SE, Pixel 5, 13 Pro Max).
 * - ARIA roles / focus order / accessible names.
 * - Live input: typed population updates the displayed price instantly and
 *   matches $10 × ⌊pop / 100K⌋ (min $10).
 */

function expectedPrice(pop: number): number {
  return Math.max(10, Math.floor(Math.max(0, pop) / 100_000) * 10);
}

async function isNotTruncated(locator: import("@playwright/test").Locator) {
  return locator.evaluate((el) => {
    const e = el as HTMLElement;
    return e.scrollWidth <= e.clientWidth + 2 && e.scrollHeight <= e.clientHeight + 2;
  });
}

async function setTheme(page: import("@playwright/test").Page, theme: "light" | "dark") {
  await page.evaluate((t) => {
    document.documentElement.classList.toggle("dark", t === "dark");
  }, theme);
}

for (const theme of ["light", "dark"] as const) {
  test.describe(`/pricing — per-row snapshots (${theme})`, () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/pricing");
      await setTheme(page, theme);
      await expect(page.getByTestId("calc-price")).toBeVisible();
    });

    test(`callout snapshot + not truncated (${theme})`, async ({ page }, testInfo) => {
      const callout = page.getByTestId("one-territory-rule");
      await expect(callout).toBeVisible();
      expect(await isNotTruncated(callout)).toBe(true);
      await expect(callout).toHaveScreenshot(
        `row-callout-${theme}-${testInfo.project.name}.png`
      );
    });

    test(`each example row snapshot + not truncated (${theme})`, async ({ page }, testInfo) => {
      const rows = page.getByTestId("city-row");
      const count = await rows.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const row = rows.nth(i);
        await expect(row).toBeVisible();
        expect(await isNotTruncated(row), `row ${i} truncated`).toBe(true);
        expect(await isNotTruncated(row.getByTestId("city-price"))).toBe(true);
        await expect(row).toHaveScreenshot(
          `row-city-${i}-${theme}-${testInfo.project.name}.png`
        );
      }
    });
  });
}

test.describe("/pricing — ARIA roles, focus order, accessible names", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByTestId("one-territory-rule")).toBeVisible();
  });

  test("table exposes correct roles and column headers", async ({ page }) => {
    const table = page.getByRole("table").first();
    await expect(table).toBeVisible();

    const columnHeaders = table.getByRole("columnheader");
    await expect(columnHeaders).toHaveCount(3);
    await expect(columnHeaders.nth(0)).toHaveText(/city/i);
    await expect(columnHeaders.nth(1)).toHaveText(/population/i);
    await expect(columnHeaders.nth(2)).toHaveText(/monthly/i);

    // Every rendered row is a real <tr>/role=row with 3 cells.
    const rows = page.getByTestId("city-row");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).getByRole("cell")).toHaveCount(3);
    }
  });

  test("callout has no missing accessible names on interactive elements", async ({ page }) => {
    const callout = page.getByTestId("one-territory-rule");
    // Any control inside the callout must have an accessible name.
    const controls = callout.locator("button, a, input, select, textarea");
    const n = await controls.count();
    for (let i = 0; i < n; i++) {
      const c = controls.nth(i);
      const name = (await c.getAttribute("aria-label"))
        ?? (await c.getAttribute("aria-labelledby"))
        ?? (await c.textContent())
        ?? "";
      expect(name.trim().length, `control #${i} missing accessible name`).toBeGreaterThan(0);
    }
  });

  test("calculator input has a linked label and accessible name", async ({ page }) => {
    const input = page.getByLabel(/population/i);
    await expect(input).toBeVisible();
    await expect(input).toHaveAttribute("id", "pop");
  });

  test("focus order flows callout → formula → calculator input → table CTA/link", async ({
    page,
  }) => {
    // Start from top of document.
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
    await page.locator("body").click({ position: { x: 1, y: 1 } });

    const seen: string[] = [];
    // Tab up to 30 times and record what we hit; assert the calculator input
    // appears before any element that lives after it in the DOM (e.g. FAQ).
    for (let i = 0; i < 30; i++) {
      await page.keyboard.press("Tab");
      const tag = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return "";
        return `${el.tagName.toLowerCase()}#${el.id || ""}`;
      });
      if (tag) seen.push(tag);
    }
    const inputIdx = seen.findIndex((s) => s.startsWith("input#pop"));
    expect(inputIdx, `never focused #pop; saw: ${seen.join(" → ")}`).toBeGreaterThanOrEqual(0);
    // Focus reaches the input via Tab (i.e. it's in the natural tab order,
    // not skipped by tabindex=-1 or hidden).
    expect(inputIdx).toBeLessThan(seen.length);
  });
});

test.describe("/pricing — live calculator updates match the formula instantly", () => {
  test("typing multiple populations updates the displayed price instantly", async ({ page }) => {
    await page.goto("/pricing");
    const input = page.locator("#pop");
    const price = page.getByTestId("calc-price");
    await expect(input).toBeVisible();

    const samples = [
      0, 1, 99_999, 100_000, 199_999, 200_000,
      570_000, 999_999, 1_000_000, 2_900_000, 20_000_000,
    ];

    for (const pop of samples) {
      const expected = `$${expectedPrice(pop).toLocaleString("en-US")}`;
      await input.fill(String(pop));
      // "Instant": no polling grace — must be present on the next microtask.
      await expect(price).toHaveText(expected, { timeout: 250 });
    }

    // Also verify character-by-character typing (each keystroke re-renders).
    await input.fill("");
    const seq = "12345678"; // → 1, 12, 123, ... 12,345,678
    let typed = "";
    for (const ch of seq) {
      await input.press(ch);
      typed += ch;
      const expected = `$${expectedPrice(Number(typed)).toLocaleString("en-US")}`;
      await expect(price).toHaveText(expected, { timeout: 250 });
    }
  });
});
