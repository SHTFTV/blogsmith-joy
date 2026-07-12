import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkAllDomains, checkAllDomainsWithWait } from "@/lib/domainStatus";
import { jsonResponse, preflightResponse } from "@/lib/cors";

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
  .transform((v, ctx) => {
    if (v === undefined || v === "") return false;
    const normalized = v.toLowerCase();
    if (["1", "true", "yes"].includes(normalized)) return true;
    if (["0", "false", "no"].includes(normalized)) return false;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "must be one of 1, true, yes, 0, false, no",
    });
    return z.NEVER;
  });

const expectedCommit = z
  .union([z.string(), z.undefined()])
  .transform((v) => (v?.trim() ? v.trim() : undefined))
  .refine((v) => v === undefined || /^(dev-local|[a-f0-9]{7,40})$/i.test(v), {
    message: "must be a 7-40 character git sha or dev-local",
  });

const querySchema = z.object({
  wait: waitFlag,
  timeoutMs: numericBounded(MIN_TIMEOUT_MS, MAX_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  intervalMs: numericBounded(MIN_INTERVAL_MS, MAX_INTERVAL_MS, DEFAULT_INTERVAL_MS),
  expectedCommit,
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
          expectedCommit: url.searchParams.get("expectedCommit") ?? undefined,
        };
        const parsed = querySchema.safeParse(raw);
        if (!parsed.success) {
          return jsonResponse(
            {
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
            },
            { status: 400 },
          );
        }

        const { wait, timeoutMs, intervalMs, expectedCommit } = parsed.data;
        if (intervalMs > timeoutMs) {
          return jsonResponse(
            {
              ok: false,
              error: "invalid_query",
              details: [
                { param: "intervalMs", message: "must be <= timeoutMs" },
              ],
            },
            { status: 400 },
          );
        }

        const report = wait
          ? await checkAllDomainsWithWait({ timeoutMs, intervalMs, expectedCommit })
          : await checkAllDomains({ expectedCommit });

        return jsonResponse(report, { status: 200 });
      },
      OPTIONS: async () => preflightResponse(),
    },
  },
});
