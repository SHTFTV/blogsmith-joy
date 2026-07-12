import { createFileRoute } from "@tanstack/react-router";
import {
  BUILD_COMMIT_FULL,
  BUILD_COMMIT_SHORT,
  BUILD_TIME_ISO,
  BUILD_TIME_LABEL,
  BUILD_CACHE_BUSTER,
} from "@/lib/buildInfo";

// Public no-cache build-info endpoint. Used by the /admin/verify live
// widget and by the /admin/propagation watchdog to detect stale edges.
export const Route = createFileRoute("/api/public/build-info")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const h = request.headers;

        // Cloudflare-style edge hints (present when served through CF/workerd
        // fronted by CF). Absent locally — we return null then.
        const cfRay = h.get("cf-ray"); // e.g. "8abc123def-IAD"
        const colo = cfRay?.includes("-") ? cfRay.split("-").pop() ?? null : null;
        const country = h.get("cf-ipcountry");

        const body = {
          commit: BUILD_COMMIT_FULL,
          commitShort: BUILD_COMMIT_SHORT,
          buildTimeIso: BUILD_TIME_ISO,
          buildTimeLabel: BUILD_TIME_LABEL,
          cacheBuster: BUILD_CACHE_BUSTER,
          servedAtIso: new Date().toISOString(),
          host: url.host,
          edge: { colo, country, cfRay },
        };

        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
            "cdn-cache-control": "no-store",
            "surrogate-control": "no-store",
            pragma: "no-cache",
            expires: "0",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
