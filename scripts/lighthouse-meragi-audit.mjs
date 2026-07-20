#!/usr/bin/env node
/**
 * Lighthouse SEO + performance audit for the Meragi staging page with
 * regression tracking against the last successful run.
 *
 * Strategy:
 *   1. Run Lighthouse (perf + seo + best-practices + accessibility)
 *      programmatically when `lighthouse` + `chrome-launcher` are installed.
 *   2. Fall back to a signal-rich HTTP audit (title/description/JSON-LD/
 *      hero size/response time) if Lighthouse isn't present — so the CI
 *      step still produces a diffable JSON report on every build.
 *   3. Compare against tests/lighthouse/baseline.meragi.json and print a
 *      human-readable regression report. Fail the step only if a scored
 *      category drops more than 0.05 vs baseline.
 *
 * Usage:
 *   BASE_URL=https://id-preview--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app \
 *     node scripts/lighthouse-meragi-audit.mjs
 *   UPDATE_BASELINE=1 node scripts/lighthouse-meragi-audit.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "meragi-vs-wedding-company-india-2026";
const BASE_URL = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const PAGE_URL = `${BASE_URL}/blog/${SLUG}/`;
const OUT_DIR = join(ROOT, "tests/lighthouse");
mkdirSync(OUT_DIR, { recursive: true });
const REPORT_PATH = join(OUT_DIR, "meragi.latest.json");
const BASELINE_PATH = join(OUT_DIR, "baseline.meragi.json");

const REGRESSION_THRESHOLD = 0.05; // 5-point drop trips a failure

async function fallbackAudit() {
  const started = Date.now();
  const res = await fetch(PAGE_URL, { redirect: "follow" });
  const ttfb = Date.now() - started;
  const html = await res.text();
  const bytes = Buffer.byteLength(html);
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ?? "";
  const desc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ?? "";
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ?? "";
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ?? "";
  const jsonLdCount = (html.match(/application\/ld\+json/g) ?? []).length;
  const h1 = /<h1[\s>]/i.test(html);
  // Signal-based pseudo-scores. Not Lighthouse; still comparable turn-to-turn.
  const perf =
    (ttfb < 500 ? 0.35 : ttfb < 1500 ? 0.25 : 0.1) +
    (bytes < 250_000 ? 0.35 : bytes < 500_000 ? 0.25 : 0.1) +
    (res.ok ? 0.3 : 0);
  const seo =
    (title.length >= 30 && title.length <= 70 ? 0.25 : 0.1) +
    (desc.length >= 50 && desc.length <= 160 ? 0.25 : 0.1) +
    (canonical ? 0.2 : 0) + (og ? 0.15 : 0) + (h1 ? 0.15 : 0);
  return {
    engine: "fallback-http",
    url: PAGE_URL,
    fetchedAt: new Date().toISOString(),
    ttfbMs: ttfb,
    htmlBytes: bytes,
    status: res.status,
    scores: { performance: Number(perf.toFixed(2)), seo: Number(seo.toFixed(2)) },
    signals: { title, desc, canonical, ogImage: og, jsonLdBlocks: jsonLdCount, hasH1: h1 },
  };
}

async function lighthouseAudit() {
  const { default: lighthouse } = await import("lighthouse");
  const { launch } = await import("chrome-launcher");
  const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
  try {
    const result = await lighthouse(PAGE_URL, {
      port: chrome.port,
      output: "json",
      onlyCategories: ["performance", "seo", "best-practices", "accessibility"],
      logLevel: "error",
    });
    const cats = result.lhr.categories;
    return {
      engine: "lighthouse",
      url: PAGE_URL,
      fetchedAt: new Date().toISOString(),
      scores: {
        performance: cats.performance?.score ?? null,
        seo: cats.seo?.score ?? null,
        bestPractices: cats["best-practices"]?.score ?? null,
        accessibility: cats.accessibility?.score ?? null,
      },
      lcpMs: result.lhr.audits["largest-contentful-paint"]?.numericValue ?? null,
      clsScore: result.lhr.audits["cumulative-layout-shift"]?.numericValue ?? null,
      tbtMs: result.lhr.audits["total-blocking-time"]?.numericValue ?? null,
    };
  } finally { chrome.kill(); }
}

let report;
try { report = await lighthouseAudit(); }
catch {
  console.log("ℹ Lighthouse packages unavailable — running fallback HTTP audit.");
  report = await fallbackAudit();
}

writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
console.log(`\nLighthouse audit · ${PAGE_URL}  (${report.engine})`);
for (const [k, v] of Object.entries(report.scores))
  console.log(`  ${k.padEnd(14)} ${v == null ? "n/a" : (v * 100).toFixed(0) + "/100"}`);

let baseline;
if (existsSync(BASELINE_PATH) && process.env.UPDATE_BASELINE !== "1") {
  baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
} else {
  writeFileSync(BASELINE_PATH, JSON.stringify(report, null, 2));
  console.log(`\nℹ Baseline ${existsSync(BASELINE_PATH) ? "updated" : "created"} at tests/lighthouse/baseline.meragi.json`);
  process.exit(0);
}

console.log(`\nRegression vs baseline (${baseline.fetchedAt}):`);
const regressions = [];
for (const [k, v] of Object.entries(report.scores)) {
  const b = baseline.scores?.[k];
  if (b == null || v == null) { console.log(`  ${k.padEnd(14)} —`); continue; }
  const delta = v - b;
  const sign = delta >= 0 ? "+" : "";
  console.log(`  ${k.padEnd(14)} ${(b*100).toFixed(0)} → ${(v*100).toFixed(0)}  (${sign}${(delta*100).toFixed(1)})`);
  if (delta < -REGRESSION_THRESHOLD) regressions.push(`${k} dropped ${(delta*100).toFixed(1)} pts`);
}
writeFileSync(join(OUT_DIR, "meragi.diff.json"), JSON.stringify({ baseline, current: report, regressions }, null, 2));

if (regressions.length) {
  console.error(`\n✗ Lighthouse regressions vs baseline:`);
  for (const r of regressions) console.error(`  - ${r}`);
  process.exit(1);
}
console.log(`\n✓ No Lighthouse regressions (threshold ${REGRESSION_THRESHOLD*100} pts).`);
