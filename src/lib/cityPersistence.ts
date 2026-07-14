// City selection persistence: URL search param (?city=) and localStorage.
// Used by the pricing calculator so the user's PPP choice survives
// navigation between calculator, FAQ, PPP explainer, and signup flows.

import { SUPPORTED_CITIES, type SupportedCity } from "./territoryPricing";

const STORAGE_KEY = "wio_selected_city";
export const CITY_QUERY_PARAM = "city";

export function findCity(cityName: string | null | undefined): SupportedCity | undefined {
  if (!cityName) return undefined;
  const needle = cityName.trim().toLowerCase();
  return SUPPORTED_CITIES.find((c) => c.city.toLowerCase() === needle);
}

export function readCityFromUrl(): SupportedCity | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const params = new URLSearchParams(window.location.search);
    return findCity(params.get(CITY_QUERY_PARAM));
  } catch {
    return undefined;
  }
}

export function readCityFromStorage(): SupportedCity | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    return findCity(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return undefined;
  }
}

export function loadInitialCity(fallback: SupportedCity): SupportedCity {
  return readCityFromUrl() ?? readCityFromStorage() ?? fallback;
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
