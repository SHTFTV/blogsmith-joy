#!/usr/bin/env node
/**
 * Generalized per-slug blog SEO validator.
 *
 * Extracted from scripts/validate-meragi-post.mjs so any post can be
 * gated against the same drift/schema/image/feed rules without copy-paste.
 *
 * Usage:
 *   node scripts/validate-post-seo.mjs <slug> [<slug> ...]
 *
 * Enforces (per slug):
 *   1. Image alt text present. All *declared* AVIF/WebP/JPG variants exist
 *      on disk within size budgets and map to correct Content-Types.
 *      Missing responsive variants are warnings, not errors, so posts that
 *      ship JPG-only don't break the gate — but the primary og:image MUST
 *      be JPG.
 *   2. Article JSON-LD schema required fields wired in blog.$slug.tsx.
 *   3. Drift guard — title, meta description, canonical, and OG/Twitter
 *      head tags never diverge from the post source.
 *   4. Pre-publish smoke — slug canonical present in sitemap.xml + rss.xml.
 *
 * Exits non-zero with a readable list of failures across all slugs.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const slugs = process.argv.slice(2);
if (slugs.length === 0) {
  console.error("usage: validate-post-seo.mjs <slug> [<slug> ...]");
  process.exit(2);
}

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const rss = readFileSync(join(ROOT, "public/rss.xml"), "utf8");

// Route-level tag/JSON-LD checks — computed once, reused per slug.
const requiredJsonLd = [
  { field: "headline", re: /headline:\s*post\.title/ },
  { field: "author", re: /author:\s*[\[{][^]*?"@type":\s*"(Person|Organization)"/ },
  { field: "datePublished", re: /datePublished:\s*post\.date/ },
  { field: "dateModified", re: /dateModified:\s*(?:post\.dateModified|post\.date)/ },
  { field: "image", re: /image:\s*(?:\{[^]*?"@type":\s*"ImageObject"|`?\$\{origin\}\$\{post\.image\}`?|post\.image|absolute)/ },
  { field: "mainEntityOfPage / @id", re: /(mainEntityOfPage|"@id"):\s*(url|canonical|`?\$\{origin\})/ },
  { field: "publisher", re: /publisher:\s*\{[^}]*"@type":\s*"Organization"/ },
  { field: "@type Article/BlogPosting", re: /"@type":\s*"(Article|BlogPosting)"/ },
];
const requiredHeadTags = [
  { name: "canonical link", re: /rel:\s*"canonical",\s*href:\s*url/ },
  { name: "og:title", re: /property:\s*"og:title"/ },
  { name: "og:description", re: /property:\s*"og:description"/ },
  { name: "og:url", re: /property:\s*"og:url"/ },
  { name: "og:image", re: /property:\s*"og:image"/ },
  { name: "og:type article", re: /property:\s*"og:type",\s*content:\s*"article"/ },
  { name: "twitter:card summary_large_image", re: /name:\s*"twitter:card",\s*content:\s*"summary_large_image"/ },
  { name: "twitter:title", re: /name:\s*"twitter:title"/ },
  { name: "twitter:description", re: /name:\s*"twitter:description"/ },
  { name: "twitter:image", re: /name:\s*"twitter:image"/ },
];

const routeErrors = [];
for (const { field, re } of requiredJsonLd)
  if (!re.test(route)) routeErrors.push(`JSON-LD Article missing/malformed field: ${field}`);
for (const { name, re } of requiredHeadTags)
  if (!re.test(route)) routeErrors.push(`route head missing ${name}`);

const CT = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };
const BUDGET_KB = { ".avif": 60, ".webp": 80, ".jpg": 140, ".jpeg": 140 };

function extractBlock(slug) {
  const start = posts.indexOf(`slug: "${slug}"`);
  if (start === -1) return null;
  const nextSlug = posts.indexOf(`slug: "`, start + 10);
  return posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);
}

function pick(block, key) {
  const re = new RegExp(`\\b${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const m = block.match(re);
  return m ? m[1].replace(/\\"/g, '"') : undefined;
}
function pickArrayFirst(block, key) {
  const re = new RegExp(`${key}:\\s*\\[\\s*"([^"]+)"`);
  const m = block.match(re);
  return m ? m[1] : undefined;
}

let totalErrors = 0;
let totalWarns = 0;

for (const slug of slugs) {
  const canonical = `https://weddings.io/blog/${slug}/`;
  const errors = [...routeErrors];
  const warns = [];

  console.log(`\n── ${slug} ──────────────────────────────────────────`);
  const block = extractBlock(slug);
  if (!block) {
    console.error(`  ✗ blogPosts.ts missing slug ${slug}`);
    totalErrors++;
    continue;
  }

  const title = pick(block, "title");
  const seoTitle = pick(block, "seoTitle");
  const excerpt = pick(block, "excerpt");
  const metaDescription = pick(block, "metaDescription");
  const image = pick(block, "image");
  const imageWebp = pick(block, "imageWebp");
  const imageWebpSmall = pick(block, "imageWebpSmall");
  const imageAvif = pick(block, "imageAvif");
  const imageAvifSmall = pick(block, "imageAvifSmall");
  const imageAlt = pick(block, "imageAlt");
  const date = pick(block, "date");
  const primaryKw = pickArrayFirst(block, "focusKeywords");

  // 1. Image alt + variants
  if (!imageAlt || imageAlt.length < 30)
    errors.push(`imageAlt missing or too short (${imageAlt?.length ?? 0} chars, need ≥30)`);

  const variants = [
    { path: image, kind: "og-fallback", required: true },
    { path: imageWebp, kind: "webp-large", required: false },
    { path: imageWebpSmall, kind: "webp-small", required: false },
    { path: imageAvif, kind: "avif-large", required: false },
    { path: imageAvifSmall, kind: "avif-small", required: false },
  ];
  for (const v of variants) {
    if (!v.path) {
      if (v.required) errors.push(`image variant missing: ${v.kind}`);
      else warns.push(`no ${v.kind} variant declared (responsive images optional but recommended)`);
      continue;
    }
    const disk = join(ROOT, "public", v.path.replace(/^\//, ""));
    if (!existsSync(disk)) { errors.push(`${v.kind} not on disk: public${v.path}`); continue; }
    const ext = v.path.slice(v.path.lastIndexOf(".")).toLowerCase();
    const expectedCT = CT[ext];
    if (!expectedCT) { errors.push(`${v.kind} unknown extension ${ext}`); continue; }
    const kb = Math.round(statSync(disk).size / 1024);
    const budget = BUDGET_KB[ext];
    if (kb > budget) errors.push(`${v.kind} over budget: ${kb}KB > ${budget}KB (${v.path})`);
    console.log(`  ✓ ${v.kind} ${kb}KB → ${expectedCT} (${v.path})`);
  }
  if (image && !/\.jpe?g$/i.test(image))
    errors.push(`primary image must be JPG for crawler-safe OG/Twitter previews (got ${image})`);

  // 2. Drift guard
  const rawTitle = seoTitle ?? `${title} | Weddings.io`;
  const effectiveTitle = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
  const rawDesc = metaDescription ?? excerpt ?? "";
  const effectiveDesc = rawDesc.length > 160 ? `${rawDesc.slice(0, 159)}…` : rawDesc;

  if (!title) errors.push("post.title missing");
  if (!metaDescription) warns.push("metaDescription missing (falls back to excerpt — drift risk)");
  if (rawTitle.length > 70) warns.push(`title raw ${rawTitle.length}>70 will truncate`);
  if (rawDesc.length > 160) warns.push(`description raw ${rawDesc.length}>160 will truncate`);
  if (primaryKw && !effectiveTitle.toLowerCase().includes(primaryKw.toLowerCase()))
    warns.push(`title missing primary keyword "${primaryKw}"`);

  // 3. Feeds/sitemap
  if (!sitemap.includes(`<loc>${canonical}</loc>`))
    errors.push(`sitemap.xml missing <loc>${canonical}</loc>`);
  if (!rss.includes(`<link>${canonical}</link>`))
    errors.push(`rss.xml missing <link>${canonical}</link>`);
  if (!rss.includes(`<guid isPermaLink="true">${canonical}</guid>`))
    errors.push(`rss.xml missing matching <guid> for ${canonical}`);

  if (date && Date.parse(date) > Date.now() + 86_400_000)
    errors.push(`post.date ${date} is in the future`);

  console.log(`  canonical:  ${canonical}`);
  console.log(`  title  [${effectiveTitle.length}/70]: ${effectiveTitle}`);
  console.log(`  desc   [${effectiveDesc.length}/160]: ${effectiveDesc}`);
  console.log(`  alt:        ${imageAlt?.length ?? 0} chars`);

  if (warns.length) {
    console.warn(`  ⚠ warnings (${warns.length}):`);
    for (const w of warns) console.warn(`    - ${w}`);
    totalWarns += warns.length;
  }
  if (errors.length) {
    console.error(`  ✗ ${slug} failed (${errors.length}):`);
    for (const e of errors) console.error(`    - ${e}`);
    totalErrors += errors.length;
  } else {
    console.log(`  ✓ ${slug} passed`);
  }
}

console.log(
  `\n────\nSummary: ${slugs.length} slug(s) · ${totalErrors} error(s) · ${totalWarns} warning(s)`,
);
process.exit(totalErrors > 0 ? 1 : 0);
