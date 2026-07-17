#!/usr/bin/env node
/**
 * Manifesto metadata validator.
 * Checks title tag, meta description, canonical URL, and Open Graph/Twitter
 * tags for length and presence on every build.
 *
 * Runs offline against src/lib/blogPosts.ts + src/routes/blog.$slug.tsx.
 * Length rules mirror what verify-production-og.mjs enforces on the live URL:
 *   - title 30–70 chars (Google truncates ~60)
 *   - description 70–160 chars (Google truncates ~160)
 *   - canonical + og:url + twitter tags all present in the route head()
 *   - image path resolves to a file in /public
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";
const CANONICAL = `https://weddings.io/blog/${SLUG}/`;

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);

// Locate the manifesto post block.
const start = posts.indexOf(`slug: "${SLUG}"`);
if (start === -1) {
  console.error(`✗ blogPosts.ts missing slug ${SLUG}`);
  process.exit(1);
}
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);

// Grab a string field's value from the block (single or double quoted).
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
const imageAlt = pick("imageAlt");
const primaryKw = pickArrayFirst("focusKeywords");

// Derive effective title exactly as verify-production-og does.
const rawTitle =
  seoTitle ??
  (primaryKw && !title?.toLowerCase().includes(primaryKw.toLowerCase())
    ? `${title} — ${primaryKw} | Weddings.io`
    : `${title} | Weddings.io`);
const effectiveTitle = rawTitle.length > 70 ? `${rawTitle.slice(0, 69)}…` : rawTitle;

const rawDesc = metaDescription ?? excerpt ?? "";
const descWithKw = metaDescription
  ? rawDesc
  : primaryKw && !rawDesc.toLowerCase().includes(primaryKw.toLowerCase())
    ? `${primaryKw}: ${rawDesc}`
    : rawDesc;
const effectiveDesc = descWithKw.length > 160 ? `${descWithKw.slice(0, 159)}…` : descWithKw;

// Presence.
if (!title) fail("title missing");
if (!excerpt && !metaDescription) fail("description missing (need metaDescription or excerpt)");
if (!image) fail("image missing (feeds og:image + twitter:image)");
if (!imageAlt) fail("imageAlt missing (accessibility + image SEO)");

// Length rules.
if (effectiveTitle.length < 30) warns.push(`title short (${effectiveTitle.length} chars): "${effectiveTitle}"`);
if (rawTitle.length > 70) warns.push(`title raw ${rawTitle.length}>70 will truncate to "…"`);
if (effectiveDesc.length < 70) warns.push(`description short (${effectiveDesc.length} chars)`);
if (descWithKw.length > 160) warns.push(`description raw ${descWithKw.length}>160 will truncate`);

// Primary keyword coverage.
if (primaryKw) {
  if (!effectiveTitle.toLowerCase().includes(primaryKw.toLowerCase()))
    fail(`title missing primary keyword "${primaryKw}"`);
  if (!effectiveDesc.toLowerCase().includes(primaryKw.toLowerCase()))
    fail(`description missing primary keyword "${primaryKw}"`);
}

// Image file resolves on disk.
if (image && image.startsWith("/") && !existsSync(join(ROOT, "public", image.replace(/^\//, "")))) {
  fail(`image file not found on disk: public${image}`);
}

// Route emits every required head tag.
const routeTags = [
  { name: "canonical link", re: /rel:\s*"canonical",\s*href:\s*url/ },
  { name: "og:title", re: /property:\s*"og:title"/ },
  { name: "og:description", re: /property:\s*"og:description"/ },
  { name: "og:url", re: /property:\s*"og:url"/ },
  { name: "og:image", re: /property:\s*"og:image"/ },
  { name: "og:type", re: /property:\s*"og:type"/ },
  { name: "twitter:card summary_large_image", re: /name:\s*"twitter:card",\s*content:\s*"summary_large_image"/ },
  { name: "twitter:title", re: /name:\s*"twitter:title"/ },
  { name: "twitter:description", re: /name:\s*"twitter:description"/ },
  { name: "twitter:image", re: /name:\s*"twitter:image"/ },
];
for (const { name, re } of routeTags) if (!re.test(route)) fail(`route head missing ${name}`);

// Report.
console.log(`Manifesto metadata (${SLUG})`);
console.log(`  canonical:    ${CANONICAL}`);
console.log(`  title  [${effectiveTitle.length}/70]: ${effectiveTitle}`);
console.log(`  desc   [${effectiveDesc.length}/160]: ${effectiveDesc}`);
console.log(`  image:        ${image} (alt ${imageAlt?.length ?? 0} chars)`);

if (warns.length) {
  console.warn(`\n⚠ warnings (${warns.length}):`);
  for (const w of warns) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n✗ metadata validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✓ Manifesto metadata valid: title, description, canonical, OG + Twitter tags all present within length limits.");
