// Lightweight analytics helper. Pushes to window.dataLayer (GA4/GTM standard)
// and mirrors pricing-calculator funnel events to the Supabase table
// `pricing_calculator_events` so the admin dashboard can compute drop-off.

import { supabase } from "@/integrations/supabase/client";

export type PppExplainerSource =
  | "home_calculator_body"
  | "home_calculator_tooltip"
  | "home_calculator_cta"
  | "home_faq"
  | "pricing_page"
  | "pricing_page_faq";

export type CityFallbackReason = "missing" | "invalid";

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
  | {
      event: "ppp_explainer_click";
      source: PppExplainerSource;
      city?: string;
      country?: string;
      ppp?: number;
      monthly_usd?: number;
    }
  | {
      event: "pricing_calculator_city_fallback";
      reason: CityFallbackReason;
      attempted_city?: string;
      city: string;
      country: string;
    }
  | { event: "pricing_tooltip_viewed"; location: string }
  | { event: "track_selector_view"; track: string }
  | { event: "track_selector_click"; track: string; href: string; element: "card" | "cta" | "faq" };

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

const SESSION_KEY = "wio_pcalc_session";
const ENTRY_KEY = "wio_pcalc_entry_page";

function getSessionId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = window.sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        (typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Math.random().toString(36).slice(2)}_${Date.now()}`);
      window.sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "no_storage";
  }
}

function getEntryPage(): string {
  if (typeof window === "undefined") return "/";
  try {
    let ep = window.sessionStorage.getItem(ENTRY_KEY);
    if (!ep) {
      ep = window.location.pathname || "/";
      window.sessionStorage.setItem(ENTRY_KEY, ep);
    }
    return ep;
  } catch {
    return window.location.pathname || "/";
  }
}

function getDeviceType(): string {
  if (typeof window === "undefined") return "unknown";
  const ua = window.navigator?.userAgent ?? "";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Opera Mini|IEMobile/i.test(ua)) return "mobile";
  return "desktop";
}

const REFERRER_KEY = "wio_pcalc_referrer_source";

function classifyReferrer(): string {
  if (typeof window === "undefined") return "unknown";
  try {
    const cached = window.sessionStorage.getItem(REFERRER_KEY);
    if (cached) return cached;
  } catch {
    // fall through
  }
  let source = "direct";
  try {
    const ref = document.referrer;
    const currentHost = window.location.hostname;
    if (ref) {
      const url = new URL(ref);
      if (url.hostname === currentHost) {
        source = "internal";
      } else if (/google\.|bing\.|duckduckgo\.|yahoo\.|yandex\.|baidu\./i.test(url.hostname)) {
        source = "search";
      } else if (
        /facebook\.|instagram\.|twitter\.|x\.com|t\.co|linkedin\.|pinterest\.|tiktok\.|reddit\.|youtube\./i.test(
          url.hostname,
        )
      ) {
        source = "social";
      } else {
        source = "other";
      }
    }
    const params = new URLSearchParams(window.location.search);
    const utm = params.get("utm_source");
    if (utm) source = `utm:${utm.slice(0, 40).toLowerCase()}`;
  } catch {
    // keep default
  }
  try {
    window.sessionStorage.setItem(REFERRER_KEY, source);
  } catch {
    // ignore
  }
  return source;
}

const FUNNEL_EVENTS = new Set([
  "pricing_calculator_impression",
  "pricing_calculator_form_change",
  "pricing_calculator_city_selected",
  "pricing_calculator_submit",
  "ppp_explainer_click",
  "pricing_calculator_city_fallback",
]);

function persistToSupabase(payload: AnalyticsEvent): void {
  if (!FUNNEL_EVENTS.has(payload.event)) return;
  if (typeof window === "undefined") return;
  const row: Record<string, unknown> = {
    event_name: payload.event,
    session_id: getSessionId(),
    entry_page: getEntryPage(),
    device_type: getDeviceType(),
    referrer_source: classifyReferrer(),
    user_agent: window.navigator?.userAgent?.slice(0, 300) ?? null,
  };
  const p = payload as Record<string, unknown>;
  if ("location" in p) row.location = p.location;
  if ("source" in p) row.source = p.source;
  if ("destination" in p) row.destination = p.destination;
  if ("city" in p) row.city = p.city;
  if ("country" in p) row.country = p.country;
  if ("ppp" in p) row.ppp = p.ppp;
  if ("monthly_usd" in p) row.monthly_usd = p.monthly_usd;
  if ("change_count" in p) row.change_count = p.change_count;
  if ("attempted_city" in p) row.attempted_city = p.attempted_city;
  if ("reason" in p) row.source = p.reason; // reuse `source` column for fallback reason

  // Fire-and-forget. Never block UI, never surface errors.
  try {
    void supabase.from("pricing_calculator_events").insert(row as never).then(
      () => undefined,
      () => undefined,
    );
  } catch {
    // ignore
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
  try {
    persistToSupabase(payload);
  } catch {
    // never let analytics break the UI
  }
}
