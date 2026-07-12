#!/usr/bin/env node
// Verify the iam-floater embed on target sites via HTTP + DOM checks.
// Outputs a per-page report, screenshots of failures, and JSON+CSV artifacts.
//
// Usage:
//   node scripts/verify-floater.mjs [--sites=a,b,c] [--paths=/,/about] [--out=/mnt/documents/floater-report]
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SITES = ["https://iam.marketing", "https://eyespyr.com", "https://talc.tv"];
const DEFAULT_PATHS = ["/"];
const SCRIPT_RE = /iam-floater\.js/i;
const ROOT_ID = "iamf-root";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);
const sites = (args.sites?.split(",") ?? DEFAULT_SITES).map((s) => s.replace(/\/$/, ""));
const paths = args.paths?.split(",") ?? DEFAULT_PATHS;
const outDir = args.out ?? "/mnt/documents/floater-report";
const shotsDir = path.join(outDir, "screenshots");
await mkdir(shotsDir, { recursive: true });

function slug(url) {
  return url.replace(/^https?:\/\//, "").replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "");
}

async function httpCheck(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    return { status: res.status, hasScriptTag: SCRIPT_RE.test(html), htmlBytes: html.length };
  } catch (e) {
    return { status: 0, hasScriptTag: false, htmlBytes: 0, error: String(e) };
  }
}

async function domCheck(browser, url, shotPath) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const requested = [];
  page.on("request", (r) => SCRIPT_RE.test(r.url) && requested.push(r.url));
  let navStatus = 0;
  let error;
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
    navStatus = resp?.status() ?? 0;
  } catch (e) {
    error = String(e);
  }
  const hasRoot = await page
    .evaluate((id) => !!document.getElementById(id), ROOT_ID)
    .catch(() => false);
  if (shotPath) await page.screenshot({ path: shotPath }).catch(() => {});
  await ctx.close();
  return { navStatus, hasRoot, floaterRequested: requested, error };
}

function classify(http, dom) {
  const scriptEmbedded = http.hasScriptTag || dom.floaterRequested.length > 0;
  if (!scriptEmbedded && !dom.hasRoot) return "missing_embed";
  if (scriptEmbedded && !dom.hasRoot) return "script_loaded_no_root";
  if (!scriptEmbedded && dom.hasRoot) return "root_no_script"; // suspicious
  return "ok";
}

const rows = [];
const browser = await chromium.launch({ headless: true, executablePath: "/bin/chromium" });
for (const site of sites) {
  for (const p of paths) {
    const url = site + p;
    const shotPath = path.join(shotsDir, `${slug(url)}.png`);
    const http = await httpCheck(url);
    const dom = await domCheck(browser, url, shotPath);
    const status = classify(http, dom);
    rows.push({
      url,
      status,
      http_status: http.status,
      script_tag_in_html: http.hasScriptTag,
      nav_status: dom.navStatus,
      iamf_root_in_dom: dom.hasRoot,
      floater_requests: dom.floaterRequested.length,
      error: http.error || dom.error || "",
      screenshot: path.relative(outDir, shotPath),
    });
  }
}
await browser.close();

// Console report
console.log("\n=== iam-floater embed report ===");
for (const r of rows) {
  const mark = r.status === "ok" ? "OK  " : "FAIL";
  console.log(
    `[${mark}] ${r.url}  status=${r.status}  http=${r.http_status} scriptTag=${r.script_tag_in_html} iamf-root=${r.iamf_root_in_dom} reqs=${r.floater_requests}`,
  );
}
const failures = rows.filter((r) => r.status !== "ok");
console.log(`\n${rows.length - failures.length}/${rows.length} pages OK.`);

// JSON
const jsonPath = path.join(outDir, "report.json");
await writeFile(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2));

// CSV (failures only, plus a full CSV for context)
const headers = [
  "url", "status", "http_status", "script_tag_in_html",
  "nav_status", "iamf_root_in_dom", "floater_requests", "error", "screenshot",
];
function toCsv(list) {
  const esc = (v) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...list.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
}
await writeFile(path.join(outDir, "report.csv"), toCsv(rows));
await writeFile(path.join(outDir, "failures.csv"), toCsv(failures));

console.log(`\nArtifacts written to ${outDir}`);
console.log(`  - report.json`);
console.log(`  - report.csv`);
console.log(`  - failures.csv (${failures.length} rows)`);
console.log(`  - screenshots/ (${rows.length} images)`);

if (failures.length) process.exit(1);
