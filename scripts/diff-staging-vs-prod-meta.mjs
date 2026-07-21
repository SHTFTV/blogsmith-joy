#!/usr/bin/env node
/**
 * diff-staging-vs-prod-meta.mjs
 *
 * For every visible blog post (or explicit slugs on argv), fetches the
 * live HTML from staging AND production and diffs:
 *   - <title>
 *   - <meta name="description">
 *   - <link rel="canonical">
 *   - og:{title,description,image,url,type}
 *   - twitter:{card,title,description,image}
 *   - Article/BlogPosting JSON-LD fields: headline, image, datePublished,
 *     dateModified, author.name, publisher.name, mainEntityOfPage
 *
 * Writes tests/seo/staging-vs-prod-diff.json and exits non-zero if any
 * post has meaningful mismatches. Some drift is expected right after a
 * publish; TOLERATE_STALE=1 downgrades diffs to warnings.
 *
 * Env:
 *   STAGING_BASE  default https://blogsmith-joy.lovable.app
 *   PROD_BASE     default https://weddings.io
 *   SLUGS         optional comma-separated slug list
 *   TOLERATE_STALE  "1" to only warn on mismatches
 */
import fs from "node:fs/promises";
import { mkdirSync } from "node:fs";

const STAGING = (process.env.STAGING_BASE || "https://blogsmith-joy.lovable.app").replace(/\/$/, "");
const PROD = (process.env.PROD_BASE || "https://weddings.io").replace(/\/$/, "");
const OUT = "tests/seo/staging-vs-prod-diff.json";
mkdirSync("tests/seo", { recursive: true });

const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
const visible = (() => {
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(x => x[1]) : [];
})();
const slugs = (process.env.SLUGS?.split(",").map(s => s.trim()).filter(Boolean))
  || (process.argv.slice(2).length ? process.argv.slice(2) : visible);

const stripQuery = (s) => (s || "").split("?")[0];
const norm = (s) => (s == null ? "" : String(s).trim().replace(/\s+/g, " "));

function parseMeta(html) {
  const pick = (re) => norm(html.match(re)?.[1] || "");
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const nodes = jsonLd.flatMap(b => Array.isArray(b) ? b : (b["@graph"] || [b]));
  const article = nodes.find(n => {
    const t = n && n["@type"];
    return t === "Article" || t === "BlogPosting"
      || (Array.isArray(t) && (t.includes("Article") || t.includes("BlogPosting")));
  }) || null;
  const imgOf = (v) => Array.isArray(v) ? (v[0]?.url || v[0]) : (v?.url || v);
  return {
    title: pick(/<title[^>]*>([^<]+)<\/title>/i),
    description: pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
    canonical: pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i),
    "og:title": pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
    "og:description": pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
    "og:image": pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
    "og:url": pick(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i),
    "og:type": pick(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i),
    "twitter:card": pick(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i),
    "twitter:title": pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i),
    "twitter:description": pick(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i),
    "twitter:image": pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i),
    "ld.headline": norm(article?.headline),
    "ld.image": norm(imgOf(article?.image)),
    "ld.datePublished": norm(article?.datePublished),
    "ld.dateModified": norm(article?.dateModified),
    "ld.author": norm(article?.author?.name || (Array.isArray(article?.author) ? article.author[0]?.name : "")),
    "ld.publisher": norm(article?.publisher?.name),
    "ld.mainEntityOfPage": norm(article?.mainEntityOfPage?.["@id"] || article?.mainEntityOfPage),
  };
}

async function fetchMeta(base, slug) {
  const url = `${base}/blog/${slug}/`;
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return { url, status: res.status, error: `HTTP ${res.status}` };
    return { url, status: res.status, meta: parseMeta(await res.text()) };
  } catch (e) {
    return { url, status: 0, error: e.message };
  }
}

// Fields where cache-busting query strings are cosmetic; compare stripped.
const URL_FIELDS = new Set(["og:image", "twitter:image", "ld.image"]);

const report = { generatedAt: new Date().toISOString(), staging: STAGING, prod: PROD, results: [] };
let hardFails = 0;
for (const slug of slugs) {
  const [s, p] = await Promise.all([fetchMeta(STAGING, slug), fetchMeta(PROD, slug)]);
  const diffs = [];
  if (s.error) diffs.push({ field: "_staging_fetch", staging: s.error, prod: null });
  if (p.error) diffs.push({ field: "_prod_fetch", staging: null, prod: p.error });
  if (s.meta && p.meta) {
    for (const k of Object.keys(s.meta)) {
      const a = URL_FIELDS.has(k) ? stripQuery(s.meta[k]) : s.meta[k];
      const b = URL_FIELDS.has(k) ? stripQuery(p.meta[k]) : p.meta[k];
      if (a !== b) diffs.push({ field: k, staging: s.meta[k], prod: p.meta[k] });
    }
  }
  const entry = { slug, staging: s, prod: p, diffs, mismatched: diffs.length };
  report.results.push(entry);
  if (diffs.length) hardFails++;
  const mark = diffs.length ? "⚠" : "✓";
  console.log(`${mark} ${slug}  (${diffs.length} diff${diffs.length === 1 ? "" : "s"})`);
  for (const d of diffs.slice(0, 4)) {
    console.log(`    · ${d.field}\n        staging: ${JSON.stringify(d.staging)}\n        prod:    ${JSON.stringify(d.prod)}`);
  }
  if (diffs.length > 4) console.log(`    · … +${diffs.length - 4} more`);
}
await fs.writeFile(OUT, JSON.stringify(report, null, 2) + "\n");
console.log(`\nReport: ${OUT}`);
console.log(`Posts with mismatches: ${hardFails} / ${slugs.length}`);
if (hardFails && process.env.TOLERATE_STALE !== "1") process.exit(1);
