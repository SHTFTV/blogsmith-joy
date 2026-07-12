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
  source: "api" | "static" | "html" | null;
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

type ProbeSignal = {
  source: "api" | "static" | "html";
  commit: string | null;
  commitShort: string | null;
  buildTimeIso: string | null;
  buildTimeLabel: string | null;
  servedAtIso: string | null;
  edge: { colo: string | null; country: string | null; cfRay: string | null };
  httpStatus: number;
};

type ProbeAttempt = { source: string; httpStatus: number | null; error: string };

function freshBuster() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function baseHeaders() {
  return { "cache-control": "no-cache, no-store, must-revalidate", pragma: "no-cache" };
}

function edgeFromHeaders(headers: Headers) {
  const cfRay = headers.get("cf-ray");
  return {
    colo: cfRay?.includes("-") ? cfRay.split("-").pop() ?? null : null,
    country: headers.get("cf-ipcountry"),
    cfRay,
  };
}

async function probeApi(base: string): Promise<ProbeSignal> {
  const res = await fetch(`${base}/api/public/build-info?_cb=${freshBuster()}`, {
    method: "GET",
    headers: baseHeaders(),
    cache: "no-store",
    redirect: "follow",
  });
  const edge = edgeFromHeaders(res.headers);
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { httpStatus: res.status });
  const body = (await res.json()) as {
    commit?: string;
    commitFull?: string;
    commitShort?: string;
    buildTimeIso?: string;
    buildTimeLabel?: string;
    servedAtIso?: string;
    edge?: { colo: string | null; country: string | null; cfRay?: string | null };
  };
  const commit = body.commit ?? body.commitFull ?? null;
  return {
    source: "api",
    commit,
    commitShort: body.commitShort ?? commit?.slice(0, 7) ?? null,
    buildTimeIso: body.buildTimeIso ?? null,
    buildTimeLabel: body.buildTimeLabel ?? null,
    servedAtIso: body.servedAtIso ?? new Date().toISOString(),
    edge: {
      colo: body.edge?.colo ?? edge.colo,
      country: body.edge?.country ?? edge.country,
      cfRay: body.edge?.cfRay ?? edge.cfRay,
    },
    httpStatus: res.status,
  };
}

async function probeStatic(base: string): Promise<ProbeSignal> {
  const res = await fetch(`${base}/build-info.json?_cb=${freshBuster()}`, {
    method: "GET",
    headers: baseHeaders(),
    cache: "no-store",
    redirect: "follow",
  });
  const edge = edgeFromHeaders(res.headers);
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { httpStatus: res.status });
  const body = (await res.json()) as {
    commit?: string;
    commitFull?: string;
    commitShort?: string;
    buildTimeIso?: string;
    buildTimeLabel?: string;
  };
  const commit = body.commit ?? body.commitFull ?? null;
  return {
    source: "static",
    commit,
    commitShort: body.commitShort ?? commit?.slice(0, 7) ?? null,
    buildTimeIso: body.buildTimeIso ?? null,
    buildTimeLabel: body.buildTimeLabel ?? null,
    servedAtIso: new Date().toISOString(),
    edge,
    httpStatus: res.status,
  };
}

function extractMeta(html: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<meta\\s+[^>]*name=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  return html.match(re)?.[1] ?? null;
}

async function probeHtml(base: string): Promise<ProbeSignal> {
  const res = await fetch(`${base}/?_cb=${freshBuster()}`, {
    method: "GET",
    headers: baseHeaders(),
    cache: "no-store",
    redirect: "follow",
  });
  const edge = edgeFromHeaders(res.headers);
  if (!res.ok) throw Object.assign(new Error(`HTTP ${res.status}`), { httpStatus: res.status });
  const html = await res.text();
  const commit = extractMeta(html, "wio-build-commit");
  if (!commit) throw Object.assign(new Error("missing wio-build-commit meta"), { httpStatus: res.status });
  return {
    source: "html",
    commit,
    commitShort: extractMeta(html, "wio-build-short") ?? commit.slice(0, 7),
    buildTimeIso: extractMeta(html, "wio-build-time"),
    buildTimeLabel: null,
    servedAtIso: new Date().toISOString(),
    edge,
    httpStatus: res.status,
  };
}

function statusFromSignal(signal: ProbeSignal, expectedCommit: string): "match" | "stale" | "error" {
  if (!signal.commit) return "error";
  return signal.commit === expectedCommit ? "match" : "stale";
}

export async function probeDomain(o: DomainEntry, expectedCommit: string): Promise<DomainStatus> {
  const started = Date.now();
  const base = o.url.replace(/\/$/, "");
  const attempts: ProbeAttempt[] = [];

  for (const [source, probe] of [
    ["api", probeApi],
    ["static", probeStatic],
    ["html", probeHtml],
  ] as const) {
    try {
      const signal = await probe(base);
      const latencyMs = Date.now() - started;
      const status = statusFromSignal(signal, expectedCommit);
      if (status === "error") throw Object.assign(new Error("missing commit marker"), { httpStatus: signal.httpStatus });

      return {
        url: o.url,
        label: o.label,
        source: signal.source,
        status,
        detected: {
          commit: signal.commit,
          commitShort: signal.commitShort,
          buildTimeIso: signal.buildTimeIso,
          buildTimeLabel: signal.buildTimeLabel,
          servedAtIso: signal.servedAtIso,
        },
        edge: signal.edge,
        latencyMs,
        httpStatus: signal.httpStatus,
      };
    } catch (e) {
      attempts.push({
        source,
        httpStatus:
          typeof e === "object" && e !== null && "httpStatus" in e
            ? Number((e as { httpStatus: unknown }).httpStatus)
            : null,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const firstStatus = attempts.find((a) => a.httpStatus)?.httpStatus ?? null;
  return {
    url: o.url,
    label: o.label,
    source: null,
    status: "error",
    detected: { commit: null, commitShort: null, buildTimeIso: null, buildTimeLabel: null, servedAtIso: null },
    edge: { colo: null, country: null, cfRay: null },
    latencyMs: Date.now() - started,
    httpStatus: firstStatus,
    error: attempts.map((a) => `${a.source}: ${a.error}`).join("; "),
  };
}

export function expectedBuild(expectedCommit?: string) {
  if (expectedCommit && expectedCommit !== BUILD_COMMIT_FULL) {
    return {
      commit: expectedCommit,
      commitShort: expectedCommit === "dev-local" ? "dev-local" : expectedCommit.slice(0, 7),
      buildTimeIso: BUILD_TIME_ISO,
      buildTimeLabel: BUILD_TIME_LABEL,
    };
  }
  return {
    commit: BUILD_COMMIT_FULL,
    commitShort: BUILD_COMMIT_SHORT,
    buildTimeIso: BUILD_TIME_ISO,
    buildTimeLabel: BUILD_TIME_LABEL,
  };
}

export async function checkAllDomains(opts: { expectedCommit?: string } = {}): Promise<DomainStatusReport> {
  const expected = expectedBuild(opts.expectedCommit);
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
  expectedCommit?: string;
}): Promise<DomainStatusReport> {
  const started = Date.now();
  const deadline = started + Math.max(0, opts.timeoutMs);
  const interval = Math.max(500, opts.intervalMs);
  let attempts = 0;
  let report = await checkAllDomains({ expectedCommit: opts.expectedCommit });
  attempts++;
  while (!report.allMatch && Date.now() < deadline) {
    const remaining = deadline - Date.now();
    await new Promise((r) => setTimeout(r, Math.min(interval, remaining)));
    report = await checkAllDomains({ expectedCommit: opts.expectedCommit });
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
