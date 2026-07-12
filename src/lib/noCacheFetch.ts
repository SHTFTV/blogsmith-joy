// Fetch wrapper that guarantees a fresh response for verification endpoints.
// - forces `cache: 'no-store'`
// - appends a per-request cache-busting query string (`_cb`)
// - sets no-cache request headers so intermediary CDNs must revalidate
// Use for /admin/verify, /api/public/build-info, and any other endpoint
// whose freshness is a correctness requirement.

export type NoCacheFetchInit = Omit<RequestInit, "cache"> & {
  cacheBusterParam?: string;
};

let counter = 0;

function freshBuster() {
  counter = (counter + 1) % 1_000_000;
  // millisecond time + monotonically-increasing counter + random suffix
  return `${Date.now().toString(36)}${counter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

export function withCacheBuster(input: string, param = "_cb"): string {
  const bust = freshBuster();
  // Preserve relative URLs (which URL() cannot parse without a base).
  const isAbsolute = /^https?:\/\//i.test(input);
  const base =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const u = new URL(input, isAbsolute ? undefined : base);
  u.searchParams.set(param, bust);
  return isAbsolute ? u.toString() : `${u.pathname}${u.search}${u.hash}`;
}

export async function noCacheFetch(
  input: string,
  init: NoCacheFetchInit = {},
): Promise<Response> {
  const { cacheBusterParam, headers, ...rest } = init;
  const url = withCacheBuster(input, cacheBusterParam);

  const merged = new Headers(headers);
  if (!merged.has("cache-control")) merged.set("cache-control", "no-cache");
  if (!merged.has("pragma")) merged.set("pragma", "no-cache");

  return fetch(url, {
    ...rest,
    cache: "no-store",
    credentials: rest.credentials ?? "same-origin",
    headers: merged,
  });
}

export type BuildInfoResponse = {
  commit: string;
  commitShort: string;
  buildTimeIso: string;
  buildTimeLabel: string;
  cacheBuster: string;
  servedAtIso: string;
  host: string;
  edge: { colo: string | null; country: string | null; cfRay: string | null };
};

export async function fetchBuildInfo(origin?: string): Promise<BuildInfoResponse> {
  const base = origin ? origin.replace(/\/$/, "") : "";
  const res = await noCacheFetch(`${base}/api/public/build-info`);
  if (!res.ok) throw new Error(`build-info ${res.status} @ ${base || "same-origin"}`);
  return (await res.json()) as BuildInfoResponse;
}
