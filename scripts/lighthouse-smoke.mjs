#!/usr/bin/env node
/**
 * Lighthouse-based performance + SEO smoke test for the homepage and
 * CultureFeatures pages. Runs Lighthouse programmatically when the
 * `lighthouse` + `chrome-launcher` packages are present; always performs
 * lightweight HTTP presence checks for <title> and <meta description>.
 *
 * Usage:
 *   BASE_URL=http://localhost:8080 node scripts/lighthouse-smoke.mjs
 *   MIN_PERF=0.7 MIN_SEO=0.9 node scripts/lighthouse-smoke.mjs
 */
const BASE_URL = (process.env.BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const MIN_PERF = Number(process.env.MIN_PERF || 0.6);
const MIN_SEO = Number(process.env.MIN_SEO || 0.9);

const PAGES = ["/", "/cultures/", "/tools/"];

const errors = [];
const notes = [];

// --- Presence checks (always run) -----------------------------------------
for (const path of PAGES) {
  const url = `${BASE_URL}${path}`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      errors.push(`${url} — HTTP ${res.status}`);
      continue;
    }
    const html = await res.text();
    const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
    const desc = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim();
    if (!title || title.length < 10) errors.push(`${url} — missing/short <title>`);
    if (title && /^lovable (app|generated project)$/i.test(title)) errors.push(`${url} — placeholder title "${title}"`);
    if (!desc || desc.length < 40) errors.push(`${url} — missing/short meta description`);
    if (!/<h1[\s>]/i.test(html)) errors.push(`${url} — no <h1> in initial HTML`);
    notes.push(`  ✓ ${url} — title=${JSON.stringify(title?.slice(0, 60))} desc=${desc?.length}ch`);
  } catch (err) {
    errors.push(`${url} — ${err.message}`);
  }
}

// --- Lighthouse (optional) ------------------------------------------------
let lighthouse, launch;
try {
  ({ default: lighthouse } = await import("lighthouse"));
  ({ launch } = await import("chrome-launcher"));
} catch {
  console.log(notes.join("\n"));
  console.log("\nℹ Lighthouse not installed — presence-only mode. `bun add -D lighthouse chrome-launcher` to enable full audit.");
  if (errors.length) {
    console.error(`\n✗ Smoke test failed (${errors.length}):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  process.exit(0);
}

const chrome = await launch({ chromeFlags: ["--headless=new", "--no-sandbox"] });
try {
  for (const path of PAGES) {
    const url = `${BASE_URL}${path}`;
    const runnerResult = await lighthouse(url, {
      port: chrome.port,
      output: "json",
      logLevel: "error",
      onlyCategories: ["performance", "seo"],
    });
    const { performance, seo } = runnerResult.lhr.categories;
    notes.push(`  ${url} — perf=${performance.score.toFixed(2)} seo=${seo.score.toFixed(2)}`);
    if (performance.score < MIN_PERF) errors.push(`${url} — performance ${performance.score} < ${MIN_PERF}`);
    if (seo.score < MIN_SEO) errors.push(`${url} — SEO ${seo.score} < ${MIN_SEO}`);
  }
} finally {
  await chrome.kill();
}

console.log(notes.join("\n"));
if (errors.length) {
  console.error(`\n✗ Lighthouse smoke failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ Lighthouse + presence smoke passed for ${PAGES.length} pages`);
