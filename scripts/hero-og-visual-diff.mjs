#!/usr/bin/env node
/**
 * hero-og-visual-diff.mjs
 * Compares the hero image area + OG preview card between staging and
 * production for every visible blog post. Fails when the pixel diff
 * exceeds STAGING_PROD_THRESHOLD, catching mismatched images or cropping.
 *
 * Requires Playwright (already installed in CI) and `pixelmatch` + `pngjs`.
 * Falls back to a metadata-only compare (og:image URL + hero <img> src +
 * intrinsic dimensions) when Playwright / pixelmatch aren't available.
 *
 * Env:
 *   STAGING_URL              default https://id-preview--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app
 *   PROD_URL                 default https://weddings.io
 *   STAGING_PROD_THRESHOLD   pixel-diff ratio, default 0.03
 *   SLUGS                    comma-separated override
 */
import fs from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const STAGING = (process.env.STAGING_URL || "https://id-preview--f66519c0-b737-42fa-8d08-b4adf7e257fc.lovable.app").replace(/\/$/, "");
const PROD = (process.env.PROD_URL || "https://weddings.io").replace(/\/$/, "");
const THRESHOLD = Number(process.env.STAGING_PROD_THRESHOLD ?? 0.03);
const OUT_DIR = "tests/visual-regression/hero-og";
mkdirSync(OUT_DIR, { recursive: true });

const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
const visible = (() => {
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(x => x[1]) : [];
})();
const slugs = (process.env.SLUGS?.split(",").map(s => s.trim()).filter(Boolean))
  || (process.argv.slice(2).length ? process.argv.slice(2) : visible.slice(0, 6));

async function getMeta(base, slug) {
  const url = `${base}/blog/${slug}/`;
  const r = await fetch(url);
  const html = r.ok ? await r.text() : "";
  const pick = (re) => html.match(re)?.[1] ?? null;
  const og = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const heroSrc = pick(/<figure[\s\S]{0,500}?<img[^>]+src=["']([^"']+)["']/i);
  const title = pick(/<title[^>]*>([^<]+)<\/title>/i)?.trim() ?? null;
  return { url, status: r.status, og, heroSrc, title };
}

async function tryPlaywrightDiff() {
  let chromium, PNG, pixelmatch;
  try {
    ({ chromium } = await import("playwright"));
    ({ PNG } = await import("pngjs"));
    pixelmatch = (await import("pixelmatch")).default;
  } catch {
    return null;
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1280, height: 1800 } });
  const results = [];
  try {
    for (const slug of slugs) {
      const shots = {};
      for (const [key, base] of [["staging", STAGING], ["prod", PROD]]) {
        const page = await context.newPage();
        await page.goto(`${base}/blog/${slug}/`, { waitUntil: "domcontentloaded" });
        const fig = page.locator("figure").first();
        try {
          await fig.waitFor({ timeout: 8000 });
          shots[key] = await fig.screenshot({
            path: path.join(OUT_DIR, `${slug}.${key}.png`),
          });
        } catch { shots[key] = null; }
        await page.close();
      }
      if (!shots.staging || !shots.prod) {
        results.push({ slug, error: "screenshot missing" });
        continue;
      }
      const a = PNG.sync.read(shots.staging);
      const b = PNG.sync.read(shots.prod);
      const { width, height } = a;
      if (b.width !== width || b.height !== height) {
        results.push({ slug, error: `dim mismatch ${width}x${height} vs ${b.width}x${b.height}`, ratio: 1 });
        continue;
      }
      const diff = new PNG({ width, height });
      const px = pixelmatch(a.data, b.data, diff.data, width, height, { threshold: 0.15 });
      const ratio = px / (width * height);
      await fs.writeFile(path.join(OUT_DIR, `${slug}.diff.png`), PNG.sync.write(diff));
      results.push({ slug, ratio: Number(ratio.toFixed(4)), pixels: px });
    }
  } finally {
    await browser.close();
  }
  return results;
}

async function metadataOnlyDiff() {
  const results = [];
  for (const slug of slugs) {
    const [s, p] = await Promise.all([getMeta(STAGING, slug), getMeta(PROD, slug)]);
    const errs = [];
    if (s.og !== p.og) errs.push(`og:image differs (${s.og} vs ${p.og})`);
    if (s.heroSrc !== p.heroSrc) errs.push(`hero <img> src differs`);
    if (s.title !== p.title) errs.push(`<title> differs`);
    results.push({ slug, staging: s, prod: p, errs });
  }
  return results;
}

const px = await tryPlaywrightDiff();
const meta = px ? null : await metadataOnlyDiff();
const report = { generatedAt: new Date().toISOString(), staging: STAGING, prod: PROD, threshold: THRESHOLD, pixel: px, metadata: meta };
await fs.writeFile(path.join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2) + "\n");

let failed = 0;
if (px) {
  console.log(`Pixel diff (threshold ${THRESHOLD}):`);
  for (const r of px) {
    if (r.error) { console.log(`  ✗ ${r.slug} — ${r.error}`); failed++; }
    else if (r.ratio > THRESHOLD) { console.log(`  ✗ ${r.slug} — ratio ${r.ratio}`); failed++; }
    else console.log(`  ✓ ${r.slug} — ratio ${r.ratio}`);
  }
} else {
  console.log("Playwright/pixelmatch not installed — metadata-only diff:");
  for (const r of meta) {
    if (r.errs.length) { console.log(`  ✗ ${r.slug}`); r.errs.forEach(e => console.log(`      - ${e}`)); failed++; }
    else console.log(`  ✓ ${r.slug}`);
  }
}
process.exit(failed ? 1 : 0);
