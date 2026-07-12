// Shared domain-status probing used by /api/public/domain-status
// and by admin server functions. Client-safe imports only.
import {
  BUILD_COMMIT_FULL,
  BUILD_COMMIT_SHORT,
  BUILD_TIME_ISO,
  BUILD_TIME_LABEL,
} from "@/lib/buildInfo";

export type DomainEntry = { url: string; label: string };

export const DOMAINS: DomainEntry[] = [
  { url: "https://weddings.io", label: "weddings.io (apex)" },
  { url: "https://www.weddings.io", label: "www.weddings.io" },
  { url: "https://blogsmith-joy.lovable.app", label: "blogsmith-joy.lovable.app" },
  {
    url: "https://project--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app",
    label: "project stable URL",
  },
];

export type DomainStatus = {
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

export type DomainStatusReport = {
  ok: true;
  allMatch: boolean;
  checkedAtIso: string;
  expected: {
    commit: string;
    commitShort: string;
    buildTimeIso: string;
    buildTimeLabel: string;
  };
  summary: { total: number; match: number; stale: number; error: number };
  domains: DomainStatus[];
  waited?: { attempts: number; elapsedMs: number; timedOut: boolean };
};

export async function probeDomain(o: DomainEntry, expectedCommit: string): Promise<DomainStatus> {
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

export function expectedBuild() {
  return {
    commit: BUILD_COMMIT_FULL,
    commitShort: BUILD_COMMIT_SHORT,
    buildTimeIso: BUILD_TIME_ISO,
    buildTimeLabel: BUILD_TIME_LABEL,
  };
}

export async function checkAllDomains(): Promise<DomainStatusReport> {
  const expected = expectedBuild();
  const domains = await Promise.all(DOMAINS.map((d) => probeDomain(d, expected.commit)));
  const summary = {
    total: domains.length,
    match: domains.filter((d) => d.status === "match").length,
    stale: domains.filter((d) => d.status === "stale").length,
    error: domains.filter((d) => d.status === "error").length,
  };
  return {
    ok: true,
    allMatch: summary.match === summary.total,
    checkedAtIso: new Date().toISOString(),
    expected,
    summary,
    domains,
  };
}

export async function checkAllDomainsWithWait(opts: {
  timeoutMs: number;
  intervalMs: number;
}): Promise<DomainStatusReport> {
  const started = Date.now();
  const deadline = started + Math.max(0, opts.timeoutMs);
  const interval = Math.max(500, opts.intervalMs);
  let attempts = 0;
  let report = await checkAllDomains();
  attempts++;
  while (!report.allMatch && Date.now() < deadline) {
    const remaining = deadline - Date.now();
    await new Promise((r) => setTimeout(r, Math.min(interval, remaining)));
    report = await checkAllDomains();
    attempts++;
  }
  return {
    ...report,
    waited: {
      attempts,
      elapsedMs: Date.now() - started,
      timedOut: !report.allMatch,
    },
  };
}
