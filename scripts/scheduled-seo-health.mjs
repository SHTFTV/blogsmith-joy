#!/usr/bin/env node
/**
 * scheduled-seo-health.mjs
 *
 * Calls the production /seo/health/batch endpoint for the slug set
 * (allowlist minus denylist minus SLUGS override), writes reports, and
 * fires alerts on failure:
 *   - GitHub Checks annotations via workflow commands (::error / ::notice)
 *     so failures show up inline in the PR/commit UI.
 *   - GITHUB_STEP_SUMMARY: markdown summary appended to the job page.
 *   - SLACK_WEBHOOK_URL: incident block on failure only.
 *
 * Slug selection:
 *   1. Start from visibleBlogSlugs in src/lib/blogPosts.ts (or all slugs).
 *   2. Intersect with tests/seo/health-allowlist.json ("slugs": [...])
 *      if it exists and is non-empty (empty/missing = allow all).
 *   3. Remove tests/seo/health-denylist.json ("slugs": [...]).
 *   4. Env SLUGS override wins over all of the above.
 *
 * Writes:
 *   - tests/seo/health-report.json  (latest run)
 *   - public/seo-health/history.json (rolling last 50; consumed by the
 *     /admin/seo-health dashboard)
 *
 * Exits non-zero if any slug fails.
 */
import fs from "node:fs/promises";
import { mkdirSync, appendFileSync, existsSync } from "node:fs";

const PROD = (process.env.PROD_BASE || "https://weddings.io").replace(/\/$/, "");
const BATCH = process.env.BATCH_URL || `${PROD}/seo/health/batch`;
const OUT = "tests/seo/health-report.json";
const HISTORY = "public/seo-health/history.json";
const ALLOWLIST = "tests/seo/health-allowlist.json";
const DENYLIST = "tests/seo/health-denylist.json";
const HISTORY_MAX = 50;
mkdirSync("tests/seo", { recursive: true });
mkdirSync("public/seo-health", { recursive: true });

async function readJson(p, fallback) {
  try { return JSON.parse(await fs.readFile(p, "utf8")); } catch { return fallback; }
}

async function loadSlugs() {
  if (process.env.SLUGS) return process.env.SLUGS.split(",").map((s) => s.trim()).filter(Boolean);
  const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
  const vm = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  const base = vm
    ? [...vm[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1])
    : [...src.matchAll(/slug:\s*["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);

  const allow = await readJson(ALLOWLIST, {});
  const deny = await readJson(DENYLIST, {});
  const allowSet = Array.isArray(allow.slugs) && allow.slugs.length ? new Set(allow.slugs) : null;
  const denySet = new Set(Array.isArray(deny.slugs) ? deny.slugs : []);
  return base.filter((s) => (!allowSet || allowSet.has(s)) && !denySet.has(s));
}

const slugs = await loadSlugs();
if (!slugs.length) {
  console.error("No slugs after allow/deny filtering");
  process.exit(1);
}
console.log(`▶ Checking ${slugs.length} slugs against ${PROD} via ${BATCH}`);
if (existsSync(ALLOWLIST)) console.log(`  · allowlist: ${ALLOWLIST}`);
if (existsSync(DENYLIST)) console.log(`  · denylist: ${DENYLIST}`);

let report;
try {
  const res = await fetch(BATCH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slugs, origin: PROD }),
  });
  report = await res.json();
  if (!res.ok) throw new Error(`batch endpoint HTTP ${res.status}`);
} catch (e) {
  console.error("Batch call failed:", e.message);
  report = { ok: false, error: e.message, results: [], failed: slugs.length, total: slugs.length };
}
report.checkedAt = report.checkedAt || new Date().toISOString();
report.origin = report.origin || PROD;

await fs.writeFile(OUT, JSON.stringify(report, null, 2));

// Rolling history for the /admin/seo-health dashboard
const history = await readJson(HISTORY, { runs: [] });
history.runs = [
  {
    checkedAt: report.checkedAt,
    origin: report.origin,
    ok: report.ok,
    total: report.total,
    failed: report.failed,
    runUrl:
      process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : null,
    results: (report.results || []).map((r) => ({
      slug: r.slug,
      ok: r.ok,
      liveStatus: r.liveStatus ?? r.status ?? null,
      diffs: (r.diffs || []).map((d) => ({ field: d.field, expected: d.expected, actual: d.actual })),
      error: r.error ?? null,
    })),
  },
  ...(Array.isArray(history.runs) ? history.runs : []),
].slice(0, HISTORY_MAX);
await fs.writeFile(HISTORY, JSON.stringify(history, null, 2));

const failed = (report.results || []).filter((r) => !r.ok);
const imageIssues = failed.filter((r) =>
  (r.diffs || []).some((d) => /og:image|twitter:image|ld\.image/i.test(d.field))
);
const jsonldIssues = failed.filter((r) =>
  (r.diffs || []).some((d) => d.field?.startsWith("ld."))
);

// ---- GitHub Checks annotations (::error / ::notice) ----------------------
const wc = (s) => String(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A").replace(/:/g, "%3A").replace(/,/g, "%2C");
if (process.env.GITHUB_ACTIONS) {
  for (const r of failed) {
    const title = `SEO health failure: ${r.slug}`;
    const fields = (r.diffs || []).map((d) => `${d.field}: expected="${d.expected}" actual="${d.actual}"`).join(" | ");
    const body = r.error
      ? `HTTP ${r.liveStatus ?? "?"} · ${r.error}`
      : `HTTP ${r.liveStatus ?? "?"} · ${(r.diffs || []).length} drifted field(s): ${fields || "(none)"}`;
    console.log(`::error file=src/lib/blogPosts.ts,title=${wc(title)}::${wc(body)}`);
  }
  if (!failed.length) {
    console.log(`::notice title=SEO health::All ${report.total ?? slugs.length} slugs healthy on ${PROD}`);
  }
}

// ---- Job summary ---------------------------------------------------------
const summary = [
  `# 🩺 SEO health · ${PROD}`,
  ``,
  `- Checked: **${report.total ?? slugs.length}** slugs`,
  `- Failed: **${failed.length}**`,
  `- OG/Twitter image issues: **${imageIssues.length}**`,
  `- Article JSON-LD drift: **${jsonldIssues.length}**`,
  `- Ran: ${report.checkedAt}`,
  ``,
];
if (failed.length) {
  summary.push(`## Failing slugs`, ``, `| Slug | HTTP | Drifted fields |`, `|---|---|---|`);
  for (const r of failed) {
    const fields = (r.diffs || []).map((d) => `\`${d.field}\``).join(", ") || "_(fetch error)_";
    summary.push(`| \`${r.slug}\` | ${r.liveStatus ?? r.status ?? "?"} | ${fields} |`);
  }
} else {
  summary.push(`✅ All slugs healthy — no image or JSON-LD drift.`);
}
const text = summary.join("\n");
console.log("\n" + text + "\n");
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + "\n");

// ---- Slack alert ---------------------------------------------------------
if (failed.length && process.env.SLACK_WEBHOOK_URL) {
  const slackText = [
    `:rotating_light: *SEO health failure on ${PROD}*`,
    `${failed.length} of ${report.total ?? slugs.length} slugs failing.`,
    `Image issues: ${imageIssues.length} · JSON-LD drift: ${jsonldIssues.length}`,
    failed.slice(0, 10).map((r) => `• \`${r.slug}\` — ${(r.diffs || []).map((d) => d.field).join(", ") || "fetch error"}`).join("\n"),
  ].join("\n");
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: slackText }),
    });
    console.log("Posted Slack alert.");
  } catch (e) {
    console.error("Slack post failed:", e.message);
  }
}

process.exit(failed.length ? 1 : 0);
