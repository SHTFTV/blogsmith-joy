import { createFileRoute } from "@tanstack/react-router";
import { checkAllDomains, checkAllDomainsWithWait } from "@/lib/domainStatus";

// Public GET endpoint. Probes each custom domain's /api/public/build-info
// and reports whether it is serving the latest bundle, plus the detected
// commit and build timestamp.
//
// Query params:
//   ?wait=1                 → poll until allMatch or timeout
//   ?timeoutMs=60000        → max wait (default 60s, hard cap 120s)
//   ?intervalMs=3000        → poll interval (default 3s, min 500ms)
export const Route = createFileRoute("/api/public/domain-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wait = url.searchParams.get("wait");
        const shouldWait = wait === "1" || wait === "true";

        const report = shouldWait
          ? await checkAllDomainsWithWait({
              timeoutMs: Math.min(
                120_000,
                Number(url.searchParams.get("timeoutMs") ?? 60_000) || 60_000,
              ),
              intervalMs: Number(url.searchParams.get("intervalMs") ?? 3_000) || 3_000,
            })
          : await checkAllDomains();

        return new Response(JSON.stringify(report), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
            "cdn-cache-control": "no-store",
            "surrogate-control": "no-store",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
