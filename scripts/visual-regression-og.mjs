#!/usr/bin/env node
/**
 * Visual regression for the Meragi post's social/OG preview card.
 *
 * Renders a self-contained OG card HTML (title/description/domain/image
 * from src/lib/blogPosts.ts) with Playwright at three breakpoints —
 * 1200×630 (canonical og:image), 600×315 (twitter fallback), 1080×1080
 * (square/IG share) — and hashes the PNG bytes against a stored baseline.
 *
 * First run creates the baseline and passes. Every subsequent run fails
 * fast if the rendered card layout drifts.
 *
 * Baselines: tests/visual-regression/og/baselines/<slug>-<w>x<h>.sha256
 * Current:   tests/visual-regression/og/current/<slug>-<w>x<h>.png
 *
 * Usage:
 *   node scripts/visual-regression-og.mjs
 *   UPDATE_BASELINE=1 node scripts/visual-regression-og.mjs   # rewrite baselines
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "meragi-vs-wedding-company-india-2026";
const BREAKPOINTS = [
  { name: "og-1200x630", width: 1200, height: 630 },
  { name: "twitter-600x315", width: 600, height: 315 },
  { name: "square-1080x1080", width: 1080, height: 1080 },
];
const BASELINE_DIR = join(ROOT, "tests/visual-regression/og/baselines");
const CURRENT_DIR = join(ROOT, "tests/visual-regression/og/current");
mkdirSync(BASELINE_DIR, { recursive: true });
mkdirSync(CURRENT_DIR, { recursive: true });

// Extract card fields from source-of-truth
const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const start = posts.indexOf(`slug: "${SLUG}"`);
if (start === -1) { console.error(`slug not found: ${SLUG}`); process.exit(2); }
const next = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, next > 0 ? next : start + 60000);
const pick = (k) => {
  const m = block.match(new RegExp(`\\b${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"') : "";
};
const title = pick("seoTitle") || pick("title");
const desc = pick("metaDescription") || pick("excerpt");
const imagePath = pick("image");
const imageFile = join(ROOT, "public", imagePath.replace(/^\//, ""));
if (!existsSync(imageFile)) { console.error(`hero image missing: ${imageFile}`); process.exit(2); }
const imageBuf = readFileSync(imageFile);
const imageDataUri = `data:image/jpeg;base64,${imageBuf.toString("base64")}`;

// Self-contained OG card. Fonts locked to system-serif to keep the render
// hermetic (no network font fetches → no cross-machine drift).
const cardHtml = (w, h) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;font-family:Georgia,'Times New Roman',serif;background:#0b0b0f;color:#f5efe6}
  .card{width:${w}px;height:${h}px;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end}
  .hero{position:absolute;inset:0;background:url('${imageDataUri}') center/cover no-repeat;filter:brightness(0.55)}
  .grad{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 0%,rgba(0,0,0,0.85) 85%)}
  .body{position:relative;padding:${Math.round(w*0.05)}px;z-index:2}
  .domain{font-size:${Math.round(w*0.018)}px;letter-spacing:.18em;text-transform:uppercase;color:#d4b26a;margin-bottom:${Math.round(h*0.03)}px}
  .title{font-size:${Math.round(w*0.048)}px;line-height:1.1;font-weight:700;margin:0 0 ${Math.round(h*0.03)}px 0;max-width:92%}
  .desc{font-size:${Math.round(w*0.022)}px;line-height:1.35;opacity:.9;max-width:88%;margin:0}
</style></head>
<body><div class="card"><div class="hero"></div><div class="grad"></div>
<div class="body">
  <div class="domain">weddings.io · Analysis</div>
  <h1 class="title">${title.replace(/</g,"&lt;")}</h1>
  <p class="desc">${desc.replace(/</g,"&lt;")}</p>
</div></div></body></html>`;

// Playwright — headless Chromium already installed in the sandbox
const { chromium } = await import("playwright");
const browser = await chromium.launch({ headless: true });
const errors = [];
const results = [];

for (const bp of BREAKPOINTS) {
  const context = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.setContent(cardHtml(bp.width, bp.height), { waitUntil: "load" });
  const buf = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: bp.width, height: bp.height } });
  await context.close();

  const currentPath = join(CURRENT_DIR, `${SLUG}-${bp.name}.png`);
  writeFileSync(currentPath, buf);
  const hash = createHash("sha256").update(buf).digest("hex");
  const baselinePath = join(BASELINE_DIR, `${SLUG}-${bp.name}.sha256`);

  if (!existsSync(baselinePath) || process.env.UPDATE_BASELINE === "1") {
    writeFileSync(baselinePath, hash);
    results.push(`  · ${bp.name} baseline ${process.env.UPDATE_BASELINE === "1" ? "updated" : "created"} (${hash.slice(0, 12)})`);
    continue;
  }
  const baseline = readFileSync(baselinePath, "utf8").trim();
  if (baseline !== hash) {
    errors.push(`${bp.name} DRIFT — baseline ${baseline.slice(0,12)} vs current ${hash.slice(0,12)} (see ${currentPath})`);
  } else {
    results.push(`  ✓ ${bp.name} matches baseline (${hash.slice(0,12)})`);
  }
}
await browser.close();

console.log(`Visual regression · ${SLUG}`);
for (const r of results) console.log(r);
if (errors.length) {
  console.error(`\n✗ Visual regression failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  console.error(`  Re-run with UPDATE_BASELINE=1 if the change is intentional.`);
  process.exit(1);
}
console.log(`\n✓ Visual regression passed at ${BREAKPOINTS.length} breakpoints.`);
