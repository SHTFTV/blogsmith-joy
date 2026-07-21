#!/usr/bin/env node
/**
 * scheduled-seo-health.mjs
 *
 * Calls the production /seo/health/batch endpoint for every visible blog
 * slug (or SLUGS env), summarizes ok/failed with per-slug diffs, writes
 * tests/seo/health-report.json, and fires alerts if anything failed:
 *   - Always: prints a readable summary and exits non-zero on failure
 *     (so GitHub Actions marks the run failed).
 *   - GITHUB_STEP_SUMMARY: markdown summary appended to the job page.
 *   - SLACK_WEBHOOK_URL: posts an incident block on failure only.
 *
 * A failure is: any slug where og:image / twitter:image is missing,
 * returns non-2xx, or any Article JSON-LD field drifted from source.
 *
 * Env:
 *   PROD_BASE        default https://weddings.io
 *   BATCH_URL        override full URL to /seo/health/batch
 *   SLUGS            optional comma-separated slug list
 *   SLACK_WEBHOOK_URL  optional Slack Incoming Webhook
 */
import fs from "node:fs/promises";
import { mkdirSync, appendFileSync } from "node:fs";

const PROD = (process.env.PROD_BASE || "https://weddings.io").replace(/\/$/, "");
const BATCH = process.env.BATCH_URL || `${PROD}/seo/health/batch`;
const OUT = "tests/seo/health-report.json";
mkdirSync("tests/seo", { recursive: true });

async function loadSlugs() {
  if (process.env.SLUGS) return process.env.SLUGS.split(",").map((s) => s.trim()).filter(Boolean);
  const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  if (m) return [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
  return [...src.matchAll(/slug:\s*["'`]([^"'`]+)["'`]/g)].map((x) => x[1]);
}

const slugs = await loadSlugs();
if (!slugs.length) {
  console.error("No slugs discovered");
  process.exit(1);
}
console.log(`▶ Checking ${slugs.length} slugs against ${PROD} via ${BATCH}`);

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

await fs.writeFile(OUT, JSON.stringify(report, null, 2));

const failed = (report.results || []).filter((r) => !r.ok);
const imageIssues = failed.filter((r) =>
  (r.diffs || []).some((d) => /og:image|twitter:image|ld\.image/i.test(d.field))
);
const jsonldIssues = failed.filter((r) =>
  (r.diffs || []).some((d) => d.field?.startsWith("ld."))
);

const summary = [
  `# 🩺 SEO health · ${PROD}`,
  ``,
  `- Checked: **${report.total ?? slugs.length}** slugs`,
  `- Failed: **${failed.length}**`,
  `- OG/Twitter image issues: **${imageIssues.length}**`,
  `- Article JSON-LD drift: **${jsonldIssues.length}**`,
  `- Ran: ${new Date().toISOString()}`,
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

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, text + "\n");
}

if (failed.length && process.env.SLACK_WEBHOOK_URL) {
  const slackText = [
    `:rotating_light: *SEO health failure on ${PROD}*`,
    `${failed.length} of ${report.total ?? slugs.length} slugs failing.`,
    `Image issues: ${imageIssues.length} · JSON-LD drift: ${jsonldIssues.length}`,
    failed.slice(0, 10).map((r) => `• \`${r.slug}\` — ${(r.diffs || []).map((d) => d.field).join(", ") || "fetch error"}`).join("\n"),
  ].join("\n");
  try {
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: slackText }),
    });
    console.log("Posted Slack alert.");
  } catch (e) {
    console.error("Slack post failed:", e.message);
  }
}

process.exit(failed.length ? 1 : 0);
