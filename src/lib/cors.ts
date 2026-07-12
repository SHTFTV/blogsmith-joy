export const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers":
    "Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma",
  "access-control-max-age": "86400",
} as const;

export const JSON_NO_STORE_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
  "cdn-cache-control": "no-store",
  "surrogate-control": "no-store",
  pragma: "no-cache",
  expires: "0",
  ...CORS_HEADERS,
} as const;

export function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      ...JSON_NO_STORE_HEADERS,
      ...(init.headers ?? {}),
    },
  });
}

export function preflightResponse() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}