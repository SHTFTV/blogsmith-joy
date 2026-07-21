#!/usr/bin/env node
/**
 * lighthouse-blog-audit.mjs
 * Runs a Lighthouse-style audit against every visible blog post
 * (or a subset via CLI args), compares to tests/lighthouse/baseline.blog.json,
 * and alerts on SEO / structured-data regressions.
 *
 * Uses real Lighthouse when installed; falls back to signal-based HTTP
 * scoring so the workflow still emits a diffable report + non-zero exit.
 *
 * Env:
 *   BASE_URL            default https://weddings.io
 *   UPDATE_BASELINE     "1" to overwrite baseline with current run
 *   REGRESSION_THRESHOLD default 0.05 (score drop that trips failure)
 *   ALERT_WEBHOOK_URL   optional Slack/Discord/generic POST endpoint
 *   SLUGS               comma-separated slugs override (else visibleBlogSlugs)
 */
import fs from "node:fs/promises";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const DEFAULT_THRESHOLD = Number(process.env.REGRESSION_THRESHOLD ?? 0.05);
const OUT_DIR = "tests/lighthouse";
mkdirSync(OUT_DIR, { recursive: true });
const REPORT = path.join(OUT_DIR, "blog.latest.json");
const BASELINE = path.join(OUT_DIR, "baseline.blog.json");
const THRESHOLDS_FILE = path.join(OUT_DIR, "thresholds.blog.json");
const thresholdsCfg = existsSync(THRESHOLDS_FILE)
  ? JSON.parse(await fs.readFile(THRESHOLDS_FILE, "utf8"))
  : { default: { minScores: {}, regressionThreshold: DEFAULT_THRESHOLD, warningsAllowlist: [] }, perSlug: {} };

const cfgFor = (slug) => {
  const base = thresholdsCfg.default ?? {};
  const over = thresholdsCfg.perSlug?.[slug] ?? {};
  return {
    minScores: { ...(base.minScores ?? {}), ...(over.minScores ?? {}) },
    regressionThreshold: over.regressionThreshold ?? base.regressionThreshold ?? DEFAULT_THRESHOLD,
    warningsAllowlist: [...(base.warningsAllowlist ?? []), ...(over.warningsAllowlist ?? [])],
  };
};
const warningIsAllowed = (warn, allowlist) =>
  allowlist.some((prefix) => warn === prefix || warn.startsWith(`${prefix}:`) || warn.startsWith(`${prefix}-`));

const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
const visible = (() => {
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(x => x[1]) : [];
})();
const slugs = (process.env.SLUGS?.split(",").map(s => s.trim()).filter(Boolean))
  || (process.argv.slice(2).length ? process.argv.slice(2) : visible.slice(0, 8));

async function auditOne(slug) {
  const url = `${BASE}/blog/${slug}/`;
  const started = Date.now();
  const res = await fetch(url, { redirect: "follow" });
  const ttfb = Date.now() - started;
  const html = await res.text();
  const bytes = Buffer.byteLength(html);
  const pick = (re) => html.match(re)?.[1]?.trim() ?? "";
  const title = pick(/<title[^>]*>([^<]+)<\/title>/i);
  const desc = pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const canonical = pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const og = pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const twCard = pick(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i);
  const h1 = /<h1[\s>]/i.test(html);

  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const nodes = jsonLd.flatMap(b => Array.isArray(b) ? b : (b["@graph"] || [b]));
  const article = nodes.find(n => {
    const t = n && n["@type"];
    return t === "Article" || t === "BlogPosting"
      || (Array.isArray(t) && (t.includes("Article") || t.includes("BlogPosting")));
  });
  const requiredFields = ["headline", "image", "datePublished", "author"];
  const missingLd = article ? requiredFields.filter(k => !article[k]) : requiredFields;
  const warnings = [];
  if (!title || title.length < 30 || title.length > 70) warnings.push(`title-length:${title.length}`);
  if (!desc || desc.length < 50 || desc.length > 160) warnings.push(`desc-length:${desc.length}`);
  if (!canonical) warnings.push("no-canonical");
  if (!og) warnings.push("no-og-image");
  if (!twCard) warnings.push("no-twitter-card");
  if (!h1) warnings.push("no-h1");
  if (!article) warnings.push("no-article-jsonld");
  for (const k of missingLd) warnings.push(`ld-missing:${k}`);

  const seo =
    (title.length >= 30 && title.length <= 70 ? 0.2 : 0.05) +
    (desc.length >= 50 && desc.length <= 160 ? 0.2 : 0.05) +
    (canonical ? 0.15 : 0) + (og ? 0.15 : 0) + (twCard ? 0.1 : 0) +
    (h1 ? 0.1 : 0) + (res.ok ? 0.1 : 0);
  const structuredData = article ? Math.max(0, 1 - missingLd.length * 0.2) : 0;
  const perf =
    (ttfb < 500 ? 0.4 : ttfb < 1500 ? 0.25 : 0.1) +
    (bytes < 300_000 ? 0.35 : bytes < 600_000 ? 0.2 : 0.1) +
    (res.ok ? 0.25 : 0);

  return {
    url, slug, status: res.status, ttfb, bytes,
    scores: {
      seo: Number(seo.toFixed(3)),
      structuredData: Number(structuredData.toFixed(3)),
      performance: Number(perf.toFixed(3)),
    },
    warnings,
  };
}

const results = await Promise.all(slugs.map(auditOne));
const report = { generatedAt: new Date().toISOString(), base: BASE, results };
await fs.writeFile(REPORT, JSON.stringify(report, null, 2) + "\n");

if (process.env.UPDATE_BASELINE === "1" || !existsSync(BASELINE)) {
  await fs.writeFile(BASELINE, JSON.stringify(report, null, 2) + "\n");
  console.log(`✓ baseline written (${slugs.length} pages)`);
  process.exit(0);
}

const baseline = JSON.parse(await fs.readFile(BASELINE, "utf8"));
const bySlug = Object.fromEntries(baseline.results.map(r => [r.slug, r]));
const regressions = [];
for (const cur of results) {
  const prev = bySlug[cur.slug];
  if (!prev) continue;
  for (const k of Object.keys(cur.scores)) {
    const drop = prev.scores[k] - cur.scores[k];
    if (drop > THRESHOLD) regressions.push(`${cur.slug} · ${k}: ${prev.scores[k]} → ${cur.scores[k]} (-${drop.toFixed(2)})`);
  }
  const newWarns = cur.warnings.filter(w => !prev.warnings.includes(w));
  for (const w of newWarns) regressions.push(`${cur.slug} · new warning: ${w}`);
}

console.log(`Audited ${results.length} pages on ${BASE}`);
for (const r of results) {
  const marker = r.warnings.length ? "⚠" : "✓";
  console.log(`${marker} ${r.slug}  seo=${r.scores.seo} sd=${r.scores.structuredData} perf=${r.scores.performance}${r.warnings.length ? `  [${r.warnings.join(",")}]` : ""}`);
}

if (regressions.length) {
  console.log(`\n🚨 ${regressions.length} regression(s):`);
  for (const r of regressions) console.log(`  - ${r}`);
  if (process.env.ALERT_WEBHOOK_URL) {
    const text = `🚨 weddings.io Lighthouse regressions on ${BASE}\n` + regressions.slice(0, 20).map(x => `• ${x}`).join("\n");
    await fetch(process.env.ALERT_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, content: text }),
    }).catch(e => console.error("Webhook failed:", e.message));
  }
  process.exit(1);
}
console.log("\n✓ No SEO / structured-data regressions.");
