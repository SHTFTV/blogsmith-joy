// City selection persistence: URL search param (?city=) and localStorage.
// Used by the pricing calculator so the user's PPP choice survives
// navigation between calculator, FAQ, PPP explainer, and signup flows.

import { SUPPORTED_CITIES, type SupportedCity } from "./territoryPricing";
import { trackEvent, type CityFallbackReason } from "./analytics";

const STORAGE_KEY = "wio_selected_city";
export const CITY_QUERY_PARAM = "city";
const FALLBACK_FIRED_KEY = "wio_pcalc_fallback_fired";

export function findCity(cityName: string | null | undefined): SupportedCity | undefined {
  if (!cityName) return undefined;
  const needle = cityName.trim().toLowerCase();
  return SUPPORTED_CITIES.find((c) => c.city.toLowerCase() === needle);
}

function readRawCityParam(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(CITY_QUERY_PARAM);
  } catch {
    return null;
  }
}

export function readCityFromUrl(): SupportedCity | undefined {
  return findCity(readRawCityParam());
}

export function readCityFromStorage(): SupportedCity | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return findCity(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

function fireFallbackOnce(reason: CityFallbackReason, attempted: string | null, resolved: SupportedCity) {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(FALLBACK_FIRED_KEY)) return;
    window.sessionStorage.setItem(FALLBACK_FIRED_KEY, "1");
  } catch {
    // proceed even if sessionStorage is unavailable
  }
  trackEvent({
    event: "pricing_calculator_city_fallback",
    reason,
    attempted_city: attempted?.slice(0, 80) ?? undefined,
    city: resolved.city,
    country: resolved.country,
  });
}

export function loadInitialCity(fallback: SupportedCity): SupportedCity {
  const raw = readRawCityParam();
  const fromUrl = findCity(raw);
  if (fromUrl) return fromUrl;
  const fromStorage = readCityFromStorage();

  // Only diagnose broken links when the URL explicitly carried a ?city= value
  // that didn't match a supported city. A missing param on a plain landing is
  // normal navigation — don't spam the fallback event for that.
  if (raw && raw.trim().length > 0) {
    const resolved = fromStorage ?? fallback;
    fireFallbackOnce("invalid", raw, resolved);
    return resolved;
  }
  return fromStorage ?? fallback;
}

export function persistCity(city: SupportedCity): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, city.city);
  } catch {
    // storage may be disabled — that is fine
  }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(CITY_QUERY_PARAM, city.city);
    window.history.replaceState(window.history.state, "", url.toString());
  } catch {
    // ignore history failures
  }
}

/**
 * Append the current city (URL param or storage) to a same-origin href so the
 * user's PPP context flows into FAQ, signup, and explainer pages.
 * Absolute URLs, mailto:, tel:, and hash-only anchors are left untouched.
 */
export function withCityParam(href: string, city?: SupportedCity | null): string {
  if (!href) return href;
  if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) return href;
  if (/^https?:\/\//i.test(href)) return href;
  const selected = city ?? readCityFromUrl() ?? readCityFromStorage();
  if (!selected) return href;
  const [pathPart, hashPart = ""] = href.split("#");
  const [path, query = ""] = pathPart.split("?");
  const params = new URLSearchParams(query);
  if (!params.has(CITY_QUERY_PARAM)) {
    params.set(CITY_QUERY_PARAM, selected.city);
  }
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ""}${hashPart ? `#${hashPart}` : ""}`;
}
