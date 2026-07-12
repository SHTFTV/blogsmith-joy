import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  GatewayComingSoon,
  GATEWAY_BUTTON_LABEL,
  GATEWAY_POPOVER_BODY,
  GATEWAY_POPOVER_EYEBROW,
  PARTNERSHIPS_EMAIL,
} from "../GatewayComingSoon";

describe("GatewayComingSoon", () => {
  it("renders the shared, unified button label", () => {
    render(<GatewayComingSoon />);
    expect(screen.getByTestId("gateway-coming-soon-label").textContent).toBe(
      GATEWAY_BUTTON_LABEL,
    );
    expect(GATEWAY_BUTTON_LABEL).toBe("Coming Soon");
  });

  it("popover reveals the exact partnerships mailto link and copy on click", () => {
    render(<GatewayComingSoon context="Vendors Directory" subject="Vendors Directory — early access" />);

    fireEvent.click(screen.getByTestId("gateway-coming-soon"));

    const popover = screen.getByTestId("gateway-coming-soon-popover");
    expect(popover).toBeTruthy();
    expect(popover.textContent).toContain(GATEWAY_POPOVER_EYEBROW);
    expect(popover.textContent).toContain(GATEWAY_POPOVER_BODY);

    const email = screen.getByTestId("gateway-coming-soon-email") as HTMLAnchorElement;
    expect(email.textContent).toBe(PARTNERSHIPS_EMAIL);
    expect(email.getAttribute("href")).toBe(
      `mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent("Vendors Directory — early access")}`,
    );
    expect(PARTNERSHIPS_EMAIL).toBe("partnerships@industryarmymarketing.com");
  });

  it("popover is hidden by default and marked as a dialog for screen readers", () => {
    render(<GatewayComingSoon />);
    const popover = screen.getByTestId("gateway-coming-soon-popover");
    expect(popover.getAttribute("role")).toBe("dialog");
    expect(popover.getAttribute("aria-labelledby")).toBeTruthy();
    expect(popover.hasAttribute("hidden")).toBe(true);

    const button = screen.getByTestId("gateway-coming-soon");
    expect(button.getAttribute("aria-haspopup")).toBe("dialog");
    expect(button.getAttribute("aria-expanded")).toBe("false");
  });

  it("outside click closes the popover and restores focus to the trigger", async () => {
    vi.useFakeTimers();
    try {
      render(
        <div>
          <button data-testid="outside">outside</button>
          <GatewayComingSoon />
        </div>,
      );

      const trigger = screen.getByTestId("gateway-coming-soon") as HTMLButtonElement;
      // Open via keyboard focus so the widget marks itself for focus restore.
      trigger.focus();
      expect(document.activeElement).toBe(trigger);
      expect(trigger.getAttribute("aria-expanded")).toBe("true");

      const popover = screen.getByTestId("gateway-coming-soon-popover");
      expect(popover.hasAttribute("hidden")).toBe(false);

      // Click somewhere outside the widget.
      fireEvent.mouseDown(screen.getByTestId("outside"));

      // Popover collapses immediately.
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(popover.hasAttribute("hidden")).toBe(true);

      // Focus restore is deferred by one tick — flush timers to run it.
      vi.runAllTimers();
      expect(document.activeElement).toBe(trigger);
    } finally {
      vi.useRealTimers();
    }
  });
});
