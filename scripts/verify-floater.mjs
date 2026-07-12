#!/usr/bin/env node
// Verify the iam-floater embed on target sites via HTTP + DOM checks.
// Usage: node scripts/verify-floater.mjs [--sites=a,b,c] [--paths=/,/about]
import { chromium } from "playwright";

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

async function httpCheck(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const html = await res.text();
    return { status: res.status, hasScriptTag: SCRIPT_RE.test(html) };
  } catch (e) {
    return { status: 0, hasScriptTag: false, error: String(e) };
  }
}

async function domCheck(browser, url) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const requested = [];
  page.on("request", (r) => SCRIPT_RE.test(r.url) && requested.push(r.url));
  let navStatus = 0;
  try {
    const resp = await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
    navStatus = resp?.status() ?? 0;
  } catch (e) {
    await ctx.close();
    return { navStatus, hasRoot: false, floaterRequested: requested, error: String(e) };
  }
  const hasRoot = await page.evaluate((id) => !!document.getElementById(id), ROOT_ID);
  await ctx.close();
  return { navStatus, hasRoot, floaterRequested: requested };
}

const rows = [];
const browser = await chromium.launch({ headless: true, executablePath: "/bin/chromium" });
for (const site of sites) {
  for (const path of paths) {
    const url = site + path;
    const http = await httpCheck(url);
    const dom = await domCheck(browser, url);
    const embedded = http.hasScriptTag || dom.floaterRequested.length > 0 || dom.hasRoot;
    rows.push({ url, http, dom, embedded });
  }
}
await browser.close();

const missing = rows.filter((r) => !r.embedded);
console.log("\n=== iam-floater embed report ===");
for (const r of rows) {
  const mark = r.embedded ? "OK " : "MISS";
  console.log(
    `[${mark}] ${r.url}  http=${r.http.status} scriptTag=${r.http.hasScriptTag}  nav=${r.dom.navStatus} iamf-root=${r.dom.hasRoot} reqs=${r.dom.floaterRequested.length}`,
  );
}
console.log(`\n${rows.length - missing.length}/${rows.length} pages have the embed.`);
if (missing.length) {
  console.log("Missing embed on:");
  missing.forEach((r) => console.log("  - " + r.url));
  process.exit(1);
}
