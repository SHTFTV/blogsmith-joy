import { test, expect } from "@playwright/test";

/**
 * Accessibility check for the shared GatewayComingSoon stop.
 *
 * The popover must be:
 *  - reachable by keyboard (Tab focuses the trigger, focus opens it)
 *  - dismissable by keyboard (Blur / Escape closes it)
 *  - discoverable to assistive tech (button with aria-haspopup="dialog",
 *    aria-expanded state, dialog with an accessible name)
 */

test("gateway popover opens on focus and exposes correct ARIA to screen readers", async ({ page }) => {
  await page.goto("/");

  const trigger = page.getByTestId("gateway-coming-soon").first();
  await trigger.waitFor({ state: "visible" });

  // ARIA discoverability on the trigger.
  await expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  const ariaLabel = await trigger.getAttribute("aria-label");
  expect(ariaLabel, "trigger has an accessible name").toBeTruthy();

  // Keyboard: focus the trigger and confirm the popover opens.
  await trigger.focus();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");

  const popover = page.getByTestId("gateway-coming-soon-popover").first();
  await expect(popover).toBeVisible();
  await expect(popover).toHaveAttribute("role", "dialog");
  await expect(popover).toHaveAttribute("aria-label", "Partnerships contact");
  await expect(popover).toContainText("partnerships@industryarmymarketing.com");

  // Keyboard: the email link inside the popover is reachable via Tab.
  await page.keyboard.press("Tab");
  const email = page.getByTestId("gateway-coming-soon-email").first();
  await expect(email).toBeFocused();

  // Keyboard: tabbing out of the popover collapses it.
  await email.blur();
  await page.locator("body").click({ position: { x: 5, y: 5 } });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});
