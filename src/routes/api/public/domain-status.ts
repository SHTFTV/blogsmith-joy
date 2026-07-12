import { createFileRoute } from "@tanstack/react-router";
import {
  BUILD_COMMIT_FULL,
  BUILD_COMMIT_SHORT,
  BUILD_TIME_ISO,
  BUILD_TIME_LABEL,
} from "@/lib/buildInfo";

// Domains to probe. Extend here when new custom domains are added.
const DOMAINS: Array<{ url: string; label: string }> = [
  { url: "https://weddings.io", label: "weddings.io (apex)" },
  { url: "https://www.weddings.io", label: "www.weddings.io" },
  { url: "https://blogsmith-joy.lovable.app", label: "blogsmith-joy.lovable.app" },
  {
    url: "https://project--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app",
    label: "project stable URL",
  },
];

type DomainStatus = {
  url: string;
  label: string;
  status: "match" | "stale" | "error";
  detected: {
    commit: string | null;
    commitShort: string | null;
    buildTimeIso: string | null;
    buildTimeLabel: string | null;
    servedAtIso: string | null;
  };
  edge: { colo: string | null; country: string | null; cfRay: string | null };
  latencyMs: number;
  httpStatus: number | null;
  error?: string;
};

async function probe(o: { url: string; label: string }, expectedCommit: string): Promise<DomainStatus> {
  const started = Date.now();
  const bust = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const url = `${o.url.replace(/\/$/, "")}/api/public/build-info?_cb=${bust}`;
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { "cache-control": "no-cache", pragma: "no-cache" },
      cache: "no-store",
    });
    const latencyMs = Date.now() - started;
    if (!res.ok) {
      return {
        url: o.url, label: o.label, status: "error",
        detected: { commit: null, commitShort: null, buildTimeIso: null, buildTimeLabel: null, servedAtIso: null },
        edge: { colo: null, country: null, cfRay: null },
        latencyMs, httpStatus: res.status, error: `HTTP ${res.status}`,
      };
    }
    const body = (await res.json()) as {
      commit: string; commitShort: string;
      buildTimeIso: string; buildTimeLabel: string; servedAtIso: string;
      edge: { colo: string | null; country: string | null; cfRay: string | null };
    };
    return {
      url: o.url, label: o.label,
      status: body.commit === expectedCommit ? "match" : "stale",
      detected: {
        commit: body.commit,
        commitShort: body.commitShort,
        buildTimeIso: body.buildTimeIso,
        buildTimeLabel: body.buildTimeLabel,
        servedAtIso: body.servedAtIso,
      },
      edge: {
        colo: body.edge?.colo ?? null,
        country: body.edge?.country ?? null,
        cfRay: body.edge?.cfRay ?? null,
      },
      latencyMs, httpStatus: res.status,
    };
  } catch (e) {
    return {
      url: o.url, label: o.label, status: "error",
      detected: { commit: null, commitShort: null, buildTimeIso: null, buildTimeLabel: null, servedAtIso: null },
      edge: { colo: null, country: null, cfRay: null },
      latencyMs: Date.now() - started, httpStatus: null,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

// Public GET endpoint. Probes each custom domain's /api/public/build-info
// and reports whether it is serving the latest bundle, plus the detected
// commit and build timestamp. Read-only: no persistence, no alerts.
export const Route = createFileRoute("/api/public/domain-status")({
  server: {
    handlers: {
      GET: async () => {
        const expected = {
          commit: BUILD_COMMIT_FULL,
          commitShort: BUILD_COMMIT_SHORT,
          buildTimeIso: BUILD_TIME_ISO,
          buildTimeLabel: BUILD_TIME_LABEL,
        };
        const domains = await Promise.all(DOMAINS.map((d) => probe(d, expected.commit)));
        const summary = {
          total: domains.length,
          match: domains.filter((d) => d.status === "match").length,
          stale: domains.filter((d) => d.status === "stale").length,
          error: domains.filter((d) => d.status === "error").length,
        };
        const allMatch = summary.match === summary.total;

        return new Response(
          JSON.stringify({
            ok: true,
            allMatch,
            checkedAtIso: new Date().toISOString(),
            expected,
            summary,
            domains,
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
              "cdn-cache-control": "no-store",
              "surrogate-control": "no-store",
              "access-control-allow-origin": "*",
            },
          }
        );
      },
    },
  },
});
