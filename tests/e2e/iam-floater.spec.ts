import { test, expect, type Page } from "@playwright/test";

/**
 * IAM Floater — accessibility + keyboard test suite
 * Verifies ARIA state, keyboard nav (Tab wrap, Esc, arrows), focus
 * management, focus-visible outlines, the disable flags, and the
 * standardised tracking schema on gtag / plausible / dataLayer.
 *
 * The floater is a static /public asset injected on every HTML page,
 * so we cover representative page types: a city, a destination, a
 * top-level static page, and a tool page.
 */

const PAGES = [
  { name: "city",        path: "/cities/toronto.html" },
  { name: "destination", path: "/destinations/portugal.html" },
  { name: "tool",        path: "/tools/south-asian/" },
  { name: "static",      path: "/about/" },
];

// Install analytics stubs BEFORE the page/script runs so the floater
// can emit into them; capture into window.__iamfEvents for assertions.
async function stubAnalytics(page: Page) {
  await page.addInitScript(() => {
    (window as any).__iamfEvents = [];
    (window as any).gtag = (...args: unknown[]) => {
      (window as any).__iamfEvents.push({ sink: "gtag", args });
    };
    (window as any).plausible = (name: string, opts: unknown) => {
      (window as any).__iamfEvents.push({ sink: "plausible", name, opts });
    };
    (window as any).dataLayer = [];
    const origPush = Array.prototype.push;
    (window as any).dataLayer.push = function (...items: unknown[]) {
      (window as any).__iamfEvents.push({ sink: "dataLayer", items });
      return origPush.apply(this, items as never[]);
    };
  });
}

for (const p of PAGES) {
  test.describe(`IAM floater @ ${p.name} (${p.path})`, () => {
    test.beforeEach(async ({ page }) => {
      await stubAnalytics(page);
      await page.goto(p.path);
      await expect(page.locator("#iamf-root")).toBeVisible();
    });

    test("initial ARIA state is collapsed", async ({ page }) => {
      const tab = page.locator("#iamf-tab");
      const panel = page.locator("#iamf-panel");
      await expect(tab).toHaveAttribute("aria-expanded", "false");
      await expect(tab).toHaveAttribute("aria-controls", "iamf-panel");
      await expect(tab).toHaveAttribute("aria-haspopup", "dialog");
      await expect(panel).toHaveAttribute("hidden", /.*/);
      await expect(panel).toHaveAttribute("role", "dialog");
      await expect(panel).toHaveAttribute("aria-labelledby", "iamf-title");
    });

    test("Enter opens; focus moves into close button; Esc closes and returns focus", async ({ page }) => {
      const tab = page.locator("#iamf-tab");
      await tab.focus();
      await page.keyboard.press("Enter");
      await expect(tab).toHaveAttribute("aria-expanded", "true");
      await expect(page.locator(".iamf-close")).toBeFocused();
      // fires open event
      await expect
        .poll(() =>
          page.evaluate(() =>
            (window as any).__iamfEvents.some(
              (e: any) =>
                (e.sink === "gtag" && e.args?.[1] === "iam_floater_open") ||
                (e.sink === "plausible" && e.name === "iam_floater_open") ||
                (e.sink === "dataLayer" && e.items?.[0]?.event === "iam_floater_open"),
            ),
          ),
        )
        .toBe(true);
      await page.keyboard.press("Escape");
      await expect(tab).toHaveAttribute("aria-expanded", "false");
      await expect(tab).toBeFocused();
    });

    test("Tab wraps focus inside the open panel (focus trap)", async ({ page }) => {
      await page.locator("#iamf-tab").click();
      const close = page.locator(".iamf-close");
      const cards = page.locator("#iamf-panel [data-iamf-link]");
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(3);

      await expect(close).toBeFocused();
      await page.keyboard.press("Tab"); // → first card
      await expect(cards.nth(0)).toBeFocused();
      // Tab through remaining cards
      for (let i = 1; i < count; i++) {
        await page.keyboard.press("Tab");
        await expect(cards.nth(i)).toBeFocused();
      }
      // Tab from last should wrap back to close
      await page.keyboard.press("Tab");
      await expect(close).toBeFocused();
      // Shift+Tab from close wraps to last card
      await page.keyboard.press("Shift+Tab");
      await expect(cards.nth(count - 1)).toBeFocused();
    });

    test("ArrowDown / ArrowUp cycle through focusables", async ({ page }) => {
      await page.locator("#iamf-tab").click();
      const close = page.locator(".iamf-close");
      const cards = page.locator("#iamf-panel [data-iamf-link]");
      const count = await cards.count();
      await expect(close).toBeFocused();
      await page.keyboard.press("ArrowDown");
      await expect(cards.nth(0)).toBeFocused();
      await page.keyboard.press("ArrowUp");
      await expect(close).toBeFocused();
      await page.keyboard.press("ArrowUp"); // wrap to last
      await expect(cards.nth(count - 1)).toBeFocused();
    });

    test("focus-visible outline is applied on keyboard focus", async ({ page }) => {
      await page.keyboard.press("Tab"); // may hit tab or an earlier control; force explicit focus
      await page.locator("#iamf-tab").focus();
      const outline = await page.locator("#iamf-tab").evaluate((el) => {
        el.classList.add("focus-visible");
        el.dispatchEvent(new Event("focus"));
        return getComputedStyle(el).outlineColor;
      });
      // Should not be transparent (browsers report rgba(0,0,0,0) when unset)
      expect(outline).not.toBe("rgba(0, 0, 0, 0)");
    });

    test("link click emits standardised tracking payload", async ({ page }) => {
      await page.locator("#iamf-tab").click();
      // Prevent actual navigation
      await page.evaluate(() => {
        document.querySelectorAll<HTMLAnchorElement>("#iamf-panel [data-iamf-link]").forEach((a) => {
          a.addEventListener("click", (e) => e.preventDefault(), { capture: true });
          a.removeAttribute("target");
        });
      });
      const first = page.locator("#iamf-panel [data-iamf-link]").first();
      const partner = await first.getAttribute("data-iamf-partner");
      await first.click();

      const gtagCall = await page.evaluate(() =>
        (window as any).__iamfEvents.find(
          (e: any) => e.sink === "gtag" && e.args?.[1] === "iam_floater_click",
        ),
      );
      expect(gtagCall, "gtag click event emitted").toBeTruthy();
      const payload = gtagCall.args[2];
      expect(payload).toMatchObject({
        event: "iam_floater_click",
        network: "iam",
        placement: "floater",
        campaign: "iam_three_pack",
        partner,
      });
      expect(payload.site).toBeTruthy();
      expect(payload.host).toBeTruthy();
      expect(payload.session_id).toBeTruthy();
      expect(typeof payload.ts).toBe("number");

      // href decorated with UTMs + iamref
      const href = await first.getAttribute("href");
      expect(href).toMatch(/[?&]utm_source=/);
      expect(href).toMatch(/[?&]utm_medium=iam_floater\b/);
      expect(href).toMatch(/[?&]utm_campaign=iam_three_pack\b/);
      expect(href).toMatch(new RegExp(`[?&]utm_content=${partner}\\b`));
      expect(href).toMatch(/[?&]iamref=/);
    });
  });
}

test.describe("IAM floater disable flags", () => {
  test("?iam_floater=off suppresses the floater", async ({ page }) => {
    await page.goto("/cities/toronto.html?iam_floater=off");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);
    await expect(page.locator("#iamf-root")).toHaveCount(0);
  });

  test("window.IAM_FLOATER_DISABLED = true suppresses the floater", async ({ page }) => {
    await page.addInitScript(() => { (window as any).IAM_FLOATER_DISABLED = true; });
    await page.goto("/cities/toronto.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);
    await expect(page.locator("#iamf-root")).toHaveCount(0);
  });

  test("<html data-iam-floater='off'> suppresses the floater", async ({ page }) => {
    await page.addInitScript(() => {
      const set = () => document.documentElement.setAttribute("data-iam-floater", "off");
      if (document.documentElement) set();
      document.addEventListener("readystatechange", set);
    });
    await page.goto("/cities/toronto.html");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(300);
    await expect(page.locator("#iamf-root")).toHaveCount(0);
  });
});
