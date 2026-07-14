// Lightweight analytics helper. Pushes to window.dataLayer (GA4/GTM standard)
// and no-ops safely during SSR or when no tag manager is present.

export type AnalyticsEvent =
  | { event: "pricing_calculator_used"; population: number; monthly_usd: number }
  | {
      event: "pricing_calculator_city_selected";
      city: string;
      country: string;
      ppp: number;
      monthly_usd: number;
    }
  | { event: "pricing_calculator_impression"; location: string }
  | {
      event: "pricing_calculator_form_change";
      city: string;
      country: string;
      ppp: number;
      monthly_usd: number;
      change_count: number;
    }
  | {
      event: "pricing_calculator_submit";
      city: string;
      country: string;
      ppp: number;
      monthly_usd: number;
      destination: string;
    }
  | { event: "pricing_tooltip_viewed"; location: string }
  | { event: "track_selector_view"; track: string }
  | { event: "track_selector_click"; track: string; href: string; element: "card" | "cta" | "faq" };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(payload: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ...payload, ts: Date.now() });
  } catch {
    // never let analytics break the UI
  }
}
