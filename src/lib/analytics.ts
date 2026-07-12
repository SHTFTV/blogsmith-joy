// Lightweight analytics helper. Pushes to window.dataLayer (GA4/GTM standard)
// and no-ops safely during SSR or when no tag manager is present.

export type AnalyticsEvent =
  | { event: "pricing_calculator_used"; population: number; monthly_usd: number }
  | { event: "pricing_tooltip_viewed"; location: string };

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
