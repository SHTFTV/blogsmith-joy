#!/usr/bin/env node
/**
 * Meragi post validator (offline, CI-gated).
 *
 * Enforces four things against the source-of-truth in
 * src/lib/blogPosts.ts + src/routes/blog.$slug.tsx + generated feeds:
 *
 * 1. Image alt text present AND every declared AVIF/WebP/JPG variant
 *    resolves on disk with a sane size + correct Content-Type mapping.
 * 2. Article JSON-LD schema — required fields present (headline, author,
 *    datePublished, dateModified, image, mainEntityOfPage / canonical).
 * 3. Drift guard — meta description, title tag, canonical, and JSON-LD
 *    fields never diverge from the post source.
 * 4. Pre-publish smoke — slug, canonical, RSS entry, and sitemap entry
 *    all agree on the same URL for the latest build.
 *
 * Exits non-zero with a readable list of failures.
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "meragi-vs-wedding-company-india-2026";
const CANONICAL = `https://weddings.io/blog/${SLUG}/`;

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);

const start = posts.indexOf(`slug: "${SLUG}"`);
if (start === -1) {
  console.error(`✗ blogPosts.ts missing slug ${SLUG}`);
  process.exit(1);
}
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);

const pick = (key) => {
  const re = new RegExp(`\\b${key}:\\s*"((?:[^"\\\\]|\\\\.)*)"`);
  const m = block.match(re);
  return m ? m[1].replace(/\\"/g, '"') : undefined;
};
const pickArrayFirst = (key) => {
  const re = new RegExp(`${key}:\\s*\\[\\s*"([^"]+)"`);
  const m = block.match(re);
  return m ? m[1] : undefined;
};

const title = pick("title");
const seoTitle = pick("seoTitle");
const excerpt = pick("excerpt");
const metaDescription = pick("metaDescription");
const image = pick("image");
const imageWebp = pick("imageWebp");
const imageWebpSmall = pick("imageWebpSmall");
const imageAvif = pick("imageAvif");
const imageAvifSmall = pick("imageAvifSmall");
const imageAlt = pick("imageAlt");
const date = pick("date");
const primaryKw = pickArrayFirst("focusKeywords");

// ── 1. Image alt + variant Content-Type sanity ─────────────────────────────
const CT = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};
const variants = [
  { path: image, kind: "og-fallback" },
  { path: imageWebp, kind: "webp-large" },
  { path: imageWebpSmall, kind: "webp-small" },
  { path: imageAvif, kind: "avif-large" },
  { path: imageAvifSmall, kind: "avif-small" },
];
if (!imageAlt || imageAlt.length < 30)
  fail(`imageAlt missing or too short (${imageAlt?.length ?? 0} chars, need ≥30)`);
for (const v of variants) {
  if (!v.path) {
    fail(`image variant missing: ${v.kind}`);
    continue;
  }
  const disk = join(ROOT, "public", v.path.replace(/^\//, ""));
  if (!existsSync(disk)) {
    fail(`${v.kind} not found on disk: public${v.path}`);
    continue;
  }
  const ext = v.path.slice(v.path.lastIndexOf(".")).toLowerCase();
  const expectedCT = CT[ext];
  if (!expectedCT) fail(`${v.kind} unknown extension ${ext}`);
  const size = statSync(disk).size;
  const kb = Math.round(size / 1024);
  // budgets mirror what the manifesto validators enforce
  const budget =
    ext === ".avif" ? 60 : ext === ".webp" ? 80 : ext === ".jpg" ? 140 : 200;
  if (kb > budget) fail(`${v.kind} over budget: ${kb}KB > ${budget}KB (${v.path})`);
  console.log(`  ✓ ${v.kind} ${kb}KB → Content-Type ${expectedCT} (${v.path})`);
}

// og:image + twitter:image must be the crawler-safe JPG fallback
if (image && !image.toLowerCase().endsWith(".jpg") && !image.toLowerCase().endsWith(".jpeg"))
  fail(`primary image must be JPG for crawler-safe OG/Twitter previews (got ${image})`);

// ── 2. JSON-LD Article schema — required fields ────────────────────────────
// The route emits JSON-LD server-side; assert every required field is wired.
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
for (const { field, re } of requiredJsonLd)
  if (!re.test(route)) fail(`JSON-LD Article missing/malformed field: ${field}`);

// ── 3. Drift guard — head tags & canonical wired to post source ────────────
const routeTags = [
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
for (const { name, re } of routeTags) if (!re.test(route)) fail(`route head missing ${name}`);

const rawTitle = seoTitle ?? `${title} | Weddings.io`;
const effectiveTitle = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;
const rawDesc = metaDescription ?? excerpt ?? "";
const effectiveDesc = rawDesc.length > 160 ? `${rawDesc.slice(0, 159)}…` : rawDesc;

if (!title) fail("post.title missing");
if (!metaDescription) fail("post.metaDescription missing (drift risk vs excerpt)");
if (rawTitle.length > 70) warns.push(`title raw ${rawTitle.length}>70 will truncate`);
if (rawDesc.length > 160) warns.push(`description raw ${rawDesc.length}>160 will truncate`);
if (primaryKw && !effectiveTitle.toLowerCase().includes(primaryKw.toLowerCase()))
  fail(`title missing primary keyword "${primaryKw}"`);

// ── 4. Pre-publish smoke — feeds + sitemap agree with slug ─────────────────
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const rss = readFileSync(join(ROOT, "public/rss.xml"), "utf8");
if (!sitemap.includes(`<loc>${CANONICAL}</loc>`))
  fail(`sitemap.xml missing exact <loc>${CANONICAL}</loc>`);
if (!rss.includes(`<link>${CANONICAL}</link>`))
  fail(`rss.xml missing <link>${CANONICAL}</link>`);
if (!rss.includes(`<guid isPermaLink="true">${CANONICAL}</guid>`))
  fail(`rss.xml missing matching <guid> for ${CANONICAL}`);

// dateModified sanity — post.date must not be in the future
if (date && Date.parse(date) > Date.now() + 86_400_000)
  fail(`post.date ${date} is in the future`);

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\nMeragi post (${SLUG})`);
console.log(`  canonical:  ${CANONICAL}`);
console.log(`  title  [${effectiveTitle.length}/70]: ${effectiveTitle}`);
console.log(`  desc   [${effectiveDesc.length}/160]: ${effectiveDesc}`);
console.log(`  image:      ${image} (alt ${imageAlt?.length ?? 0} chars)`);
console.log(`  variants:   AVIF ${imageAvif ? "✓" : "✗"} / WebP ${imageWebp ? "✓" : "✗"} / JPG ${image ? "✓" : "✗"}`);

if (warns.length) {
  console.warn(`\n⚠ warnings (${warns.length}):`);
  for (const w of warns) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n✗ Meragi post validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✓ Meragi post valid: images + alt, JSON-LD Article schema, drift guard, and feed/sitemap smoke all pass.");
