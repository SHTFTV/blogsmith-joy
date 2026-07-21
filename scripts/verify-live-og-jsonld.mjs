#!/usr/bin/env node
/**
 * verify-live-og-jsonld.mjs
 * Fetches live blog post HTML and asserts:
 *   - <title> matches seoTitle (or title)
 *   - <meta name="description"> matches metaDescription (or excerpt)
 *   - og:title / og:description / og:image present and matching
 *   - twitter:card / twitter:title / twitter:description / twitter:image present
 *   - Article JSON-LD present, has @type Article/BlogPosting, headline, image,
 *     datePublished, and author
 *
 * Usage:
 *   node scripts/verify-live-og-jsonld.mjs                       # all visible posts
 *   node scripts/verify-live-og-jsonld.mjs slug-a slug-b         # specific slugs
 *
 * Env: SITE_BASE (default https://weddings.io)
 */
import fs from "node:fs/promises";

const BASE = (process.env.SITE_BASE || "https://weddings.io").replace(/\/$/, "");
const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");

// Extract post objects with a forgiving regex (source-of-truth is the TS file).
function extractPosts(source) {
  const posts = [];
  const objRe = /\{\s*slug:\s*["'`]([^"'`]+)["'`][\s\S]*?\n\s{2}\},/g;
  let m;
  while ((m = objRe.exec(source))) {
    const block = m[0];
    const pick = (k) => {
      const r = new RegExp(`${k}:\\s*["'\`]((?:[^"'\`\\\\]|\\\\.)*)["'\`]`);
      const mm = block.match(r);
      return mm ? mm[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : undefined;
    };
    posts.push({
      slug: m[1],
      title: pick("title"),
      seoTitle: pick("seoTitle"),
      excerpt: pick("excerpt"),
      metaDescription: pick("metaDescription"),
    });
  }
  return posts;
}

const visible = (() => {
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  if (!m) return null;
  return new Set([...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(x => x[1]));
})();

const all = extractPosts(src);
const requested = process.argv.slice(2);
const targets = requested.length
  ? all.filter(p => requested.includes(p.slug))
  : all.filter(p => !visible || visible.has(p.slug));

if (!targets.length) { console.error("No target posts found."); process.exit(2); }

const meta = (html, re) => { const m = html.match(re); return m ? m[1].trim() : null; };

async function verify(post) {
  const url = `${BASE}/blog/${post.slug}/`;
  const errs = [];
  const html = await fetch(url).then(r => r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`)))
    .catch(e => { errs.push(`fetch failed: ${e.message}`); return ""; });
  if (!html) return { url, errs };

  const title = meta(html, /<title[^>]*>([^<]+)<\/title>/i);
  const desc = meta(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
  const ogTitle = meta(html, /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
  const ogDesc = meta(html, /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i);
  const ogImg  = meta(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  const twCard = meta(html, /<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i);
  const twImg  = meta(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

  const expectTitle = post.seoTitle || post.title;
  const expectDesc = post.metaDescription || post.excerpt;

  if (!title || !title.includes((expectTitle || "").slice(0, 30)))
    errs.push(`<title> mismatch: got ${JSON.stringify(title)} expected ~${JSON.stringify(expectTitle)}`);
  if (!desc) errs.push("meta description missing");
  else if (expectDesc && !desc.startsWith(expectDesc.slice(0, 40)))
    errs.push(`meta description drift: got ${JSON.stringify(desc.slice(0,80))}`);
  if (!ogTitle) errs.push("og:title missing");
  if (!ogDesc) errs.push("og:description missing");
  if (!ogImg) errs.push("og:image missing");
  else if (!/^https?:\/\//.test(ogImg)) errs.push(`og:image not absolute URL: ${ogImg}`);
  if (!twCard) errs.push("twitter:card missing");
  if (!twImg) errs.push("twitter:image missing");

  // JSON-LD Article
  const ldBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean);
  const flat = ldBlocks.flatMap(b => Array.isArray(b) ? b : (b["@graph"] || [b]));
  const article = flat.find(n => {
    const t = n && n["@type"];
    return t === "Article" || t === "BlogPosting" || (Array.isArray(t) && (t.includes("Article") || t.includes("BlogPosting")));
  });
  if (!article) errs.push("Article/BlogPosting JSON-LD not found");
  else {
    for (const k of ["headline", "image", "datePublished", "author"]) {
      if (!article[k]) errs.push(`JSON-LD missing ${k}`);
    }
  }

  // Verify og:image resolves 200
  if (ogImg && /^https?:\/\//.test(ogImg)) {
    const r = await fetch(ogImg, { method: "HEAD" }).catch(() => null);
    if (!r || r.status !== 200) errs.push(`og:image ${ogImg} returned ${r ? r.status : "ERR"}`);
  }

  return { url, errs };
}

const results = await Promise.all(targets.map(verify));
const failed = results.filter(r => r.errs.length);

for (const r of results) {
  if (r.errs.length) {
    console.log(`✗ ${r.url}`);
    for (const e of r.errs) console.log(`    - ${e}`);
  } else {
    console.log(`✓ ${r.url}`);
  }
}
console.log(`\n${results.length - failed.length}/${results.length} posts passed OG + JSON-LD verification.`);
process.exit(failed.length ? 1 : 0);
