import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAllDomains, checkAllDomainsWithWait } from "@/lib/domainStatus";

const CORS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
  "cdn-cache-control": "no-store",
  "surrogate-control": "no-store",
  "access-control-allow-origin": "*",
};

// Defaults + bounds for wait mode.
const DEFAULT_TIMEOUT_MS = 60_000;
const DEFAULT_INTERVAL_MS = 3_000;
const MIN_TIMEOUT_MS = 1_000;
const MAX_TIMEOUT_MS = 120_000;
const MIN_INTERVAL_MS = 500;
const MAX_INTERVAL_MS = 30_000;

// Coerce string→number, allow empty for defaults, then bound-check.
const numericBounded = (min: number, max: number, fallback: number) =>
  z
    .union([z.string().min(1), z.number()])
    .optional()
    .transform((v, ctx) => {
      if (v === undefined || v === "") return fallback;
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isFinite(n)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "must be a number" });
        return z.NEVER;
      }
      if (n < min || n > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `must be between ${min} and ${max}`,
        });
        return z.NEVER;
      }
      return Math.floor(n);
    });

const waitFlag = z
  .union([z.string(), z.undefined()])
  .transform((v) => v === "1" || v === "true");

const querySchema = z.object({
  wait: waitFlag,
  timeoutMs: numericBounded(MIN_TIMEOUT_MS, MAX_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  intervalMs: numericBounded(MIN_INTERVAL_MS, MAX_INTERVAL_MS, DEFAULT_INTERVAL_MS),
});

// Public GET endpoint. Probes each custom domain's /api/public/build-info
// and reports whether it is serving the latest bundle, plus the detected
// commit and build timestamp.
//
// Query params (all optional):
//   wait=1|true             → poll until allMatch or timeout
//   timeoutMs=<1000..120000>  default 60000
//   intervalMs=<500..30000>   default 3000
export const Route = createFileRoute("/api/public/domain-status")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = {
          wait: url.searchParams.get("wait") ?? undefined,
          timeoutMs: url.searchParams.get("timeoutMs") ?? undefined,
          intervalMs: url.searchParams.get("intervalMs") ?? undefined,
        };
        const parsed = querySchema.safeParse(raw);
        if (!parsed.success) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "invalid_query",
              details: parsed.error.issues.map((i) => ({
                param: i.path.join(".") || "(root)",
                message: i.message,
              })),
              defaults: {
                timeoutMs: DEFAULT_TIMEOUT_MS,
                intervalMs: DEFAULT_INTERVAL_MS,
              },
              bounds: {
                timeoutMs: { min: MIN_TIMEOUT_MS, max: MAX_TIMEOUT_MS },
                intervalMs: { min: MIN_INTERVAL_MS, max: MAX_INTERVAL_MS },
              },
            }),
            { status: 400, headers: CORS },
          );
        }

        const { wait, timeoutMs, intervalMs } = parsed.data;
        if (intervalMs > timeoutMs) {
          return new Response(
            JSON.stringify({
              ok: false,
              error: "invalid_query",
              details: [
                { param: "intervalMs", message: "must be <= timeoutMs" },
              ],
            }),
            { status: 400, headers: CORS },
          );
        }

        const report = wait
          ? await checkAllDomainsWithWait({ timeoutMs, intervalMs })
          : await checkAllDomains();

        return new Response(JSON.stringify(report), { status: 200, headers: CORS });
      },
    },
  },
});
