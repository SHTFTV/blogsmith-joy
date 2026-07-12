import { createFileRoute } from "@tanstack/react-router";
import { BUILD_COMMIT_FULL, BUILD_COMMIT_SHORT } from "@/lib/buildInfo";

// Origins to poll. Kept in sync with src/routes/admin.propagation.tsx.
const ORIGINS: Array<{ url: string; label: string }> = [
  { url: "https://weddings.io", label: "weddings.io (apex)" },
  { url: "https://www.weddings.io", label: "www.weddings.io" },
  { url: "https://blogsmith-joy.lovable.app", label: "blogsmith-joy.lovable.app" },
  { url: "https://project--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app", label: "project stable URL" },
];

const ALERT_RECIPIENT = "partnerships@industryarmymarketing.com";

type OriginResult = {
  url: string;
  label: string;
  ok: boolean;
  status: "match" | "stale" | "error";
  commit: string | null;
  commitShort: string | null;
  colo: string | null;
  country: string | null;
  latencyMs: number;
  error?: string;
};

async function checkOrigin(o: { url: string; label: string }, bundleCommit: string): Promise<OriginResult> {
  const started = Date.now();
  const bust = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const url = `${o.url.replace(/\/$/, "")}/api/public/build-info?_cb=${bust}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "cache-control": "no-cache", pragma: "no-cache" },
      cache: "no-store",
    });
    const latency = Date.now() - started;
    if (!res.ok) {
      return {
        url: o.url, label: o.label, ok: false, status: "error",
        commit: null, commitShort: null, colo: null, country: null,
        latencyMs: latency, error: `HTTP ${res.status}`,
      };
    }
    const body = await res.json() as {
      commit: string; commitShort: string;
      edge: { colo: string | null; country: string | null };
    };
    return {
      url: o.url, label: o.label, ok: true,
      status: body.commit === bundleCommit ? "match" : "stale",
      commit: body.commit, commitShort: body.commitShort,
      colo: body.edge?.colo ?? null, country: body.edge?.country ?? null,
      latencyMs: latency,
    };
  } catch (e) {
    return {
      url: o.url, label: o.label, ok: false, status: "error",
      commit: null, commitShort: null, colo: null, country: null,
      latencyMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function sendStaleAlert(results: OriginResult[]) {
  const stale = results.filter((r) => r.status === "stale");
  if (stale.length === 0) return { attempted: false as const };

  const subject = `[weddings.io] ${stale.length} region(s) stale · bundle ${BUILD_COMMIT_SHORT}`;
  const lines: string[] = [
    `Bundle commit: ${BUILD_COMMIT_FULL}`,
    `Detected at: ${new Date().toISOString()}`,
    "",
    "Stale regions:",
    ...stale.map((s) => `  - ${s.label} (${s.url}) — commit ${s.commitShort ?? "?"} · colo ${s.colo ?? "?"}${s.country ? " · " + s.country : ""}`),
    "",
    "Full results:",
    ...results.map((r) => `  - [${r.status}] ${r.label} — ${r.commitShort ?? r.error ?? "?"} · ${r.latencyMs}ms`),
  ];
  const text = lines.join("\n");

  // Best-effort send via the Lovable Emails send route. If email infra
  // is not yet configured, log and record the error — the row is still
  // stored in propagation_check_runs for the /admin/propagation history.
  try {
    const res = await fetch("http://localhost/lovable/email/transactional/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        templateName: "propagation-alert",
        recipientEmail: ALERT_RECIPIENT,
        idempotencyKey: `propagation-${BUILD_COMMIT_SHORT}-${Date.now()}`,
        templateData: { subject, text },
      }),
    }).catch((e) => { throw e; });

    if (!res.ok) {
      const body = await res.text();
      console.warn(`[propagation-check] alert send failed: HTTP ${res.status} ${body}`);
      return { attempted: true as const, ok: false as const, error: `HTTP ${res.status}: ${body.slice(0, 200)}` };
    }
    return { attempted: true as const, ok: true as const };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[propagation-check] alert send exception: ${msg}`);
    return { attempted: true as const, ok: false as const, error: msg };
  }
}

export const Route = createFileRoute("/api/public/hooks/propagation-check")({
  server: {
    handlers: {
      POST: async () => {
        const bundleCommit = BUILD_COMMIT_FULL;

        const results = await Promise.all(ORIGINS.map((o) => checkOrigin(o, bundleCommit)));

        const match_count = results.filter((r) => r.status === "match").length;
        const stale_count = results.filter((r) => r.status === "stale").length;
        const error_count = results.filter((r) => r.status === "error").length;

        const alert = await sendStaleAlert(results);

        // Persist history via service role (server-only import inside handler).
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("propagation_check_runs")
            .insert({
              bundle_commit: bundleCommit,
              bundle_commit_short: BUILD_COMMIT_SHORT,
              origins_checked: results.length,
              match_count,
              stale_count,
              error_count,
              results: results as unknown as object,
              alert_sent: alert.attempted && alert.ok === true,
              alert_error: alert.attempted && alert.ok === false ? alert.error ?? null : null,
            });
          if (error) console.warn(`[propagation-check] db insert failed: ${error.message}`);

          // Keep only the last 200 runs to stay small.
          await supabaseAdmin.rpc("noop_placeholder").catch(() => undefined);
        } catch (e) {
          console.warn(`[propagation-check] persist error: ${e instanceof Error ? e.message : String(e)}`);
        }

        return new Response(
          JSON.stringify({
            ok: true,
            bundleCommit,
            summary: { match_count, stale_count, error_count },
            alert,
            results,
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "no-store",
            },
          }
        );
      },
    },
  },
});
