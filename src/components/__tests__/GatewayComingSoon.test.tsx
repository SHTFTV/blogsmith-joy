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
});
