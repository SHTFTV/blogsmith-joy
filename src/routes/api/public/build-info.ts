import { createFileRoute } from "@tanstack/react-router";
import {
  BUILD_COMMIT_FULL,
  BUILD_COMMIT_SHORT,
  BUILD_TIME_ISO,
  BUILD_TIME_LABEL,
  BUILD_CACHE_BUSTER,
} from "@/lib/buildInfo";
import { JSON_NO_STORE_HEADERS, preflightResponse } from "@/lib/cors";

// Public no-cache build-info endpoint. Used by the /admin/verify live
// widget and by the /admin/propagation watchdog to detect stale edges.
export const Route = createFileRoute("/api/public/build-info")({
  server: {
    handlers: {
      OPTIONS: async () => preflightResponse(),
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
            ...JSON_NO_STORE_HEADERS,
            "x-build-commit": BUILD_COMMIT_FULL,
            "x-build-time": BUILD_TIME_ISO,
          },
        });
      },
    },
  },
});
