#!/usr/bin/env node
/**
 * Validate the manifesto page's head() output — canonical, OG, Twitter, and JSON-LD —
 * without needing a running server. Reads src/routes/blog.$slug.tsx head() logic
 * mirror-checked against the actual post data in src/lib/blogPosts.ts.
 *
 * Exits non-zero on any missing/invalid tag.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "record-record-domain-provenance-vs-generative-conflation";
const CANONICAL = `https://weddings.io/blog/${SLUG}/`;

const errors = [];
const fail = (m) => errors.push(m);

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");

// 1. Post is present in blogPosts.ts
if (!posts.includes(`slug: "${SLUG}"`)) fail(`blogPosts.ts missing slug "${SLUG}"`);
if (!posts.includes(`visibleBlogSlugs`) || !new RegExp(`"${SLUG}"`).test(posts)) {
  fail(`blogPosts.ts must reference "${SLUG}" in visibleBlogSlugs`);
}

// 2. Route emits all required meta tags
const required = [
  { name: "canonical link", re: /rel:\s*"canonical",\s*href:\s*url/ },
  { name: "og:type", re: /property:\s*"og:type",\s*content:\s*"article"/ },
  { name: "og:title", re: /property:\s*"og:title"/ },
  { name: "og:description", re: /property:\s*"og:description"/ },
  { name: "og:url", re: /property:\s*"og:url"/ },
  { name: "og:image", re: /property:\s*"og:image"/ },
  { name: "twitter:card", re: /name:\s*"twitter:card",\s*content:\s*"summary_large_image"/ },
  { name: "twitter:title", re: /name:\s*"twitter:title"/ },
  { name: "twitter:description", re: /name:\s*"twitter:description"/ },
  { name: "twitter:image", re: /name:\s*"twitter:image"/ },
  { name: "Article JSON-LD", re: /"@type":\s*"Article"/ },
  { name: "FAQPage JSON-LD", re: /"@type":\s*"FAQPage"/ },
  { name: "BreadcrumbList JSON-LD", re: /"@type":\s*"BreadcrumbList"/ },
];
for (const { name, re } of required) {
  if (!re.test(route)) fail(`blog.$slug.tsx missing ${name}`);
}

// 3. Manifesto-specific: hero image + alt text present
const startIdx = posts.indexOf(`slug: "${SLUG}"`);
const nextSlug = posts.indexOf("slug: \"", startIdx + 10);
const block = posts.slice(startIdx, nextSlug > 0 ? nextSlug : startIdx + 40000);
if (!/image:\s*manifestoHeroAsset\.url/.test(block)) fail("manifesto missing hero image binding");
if (!/imageAlt:\s*"/.test(block)) fail("manifesto missing imageAlt");
if (!/faq:\s*\[/.test(block)) fail("manifesto missing faq array (FAQPage JSON-LD requires it)");

// 4. Sitemap + RSS include the URL
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const rss = readFileSync(join(ROOT, "public/rss.xml"), "utf8");
if (!sitemap.includes(CANONICAL)) fail(`sitemap.xml missing ${CANONICAL}`);
if (!rss.includes(CANONICAL)) fail(`rss.xml missing ${CANONICAL}`);

if (errors.length) {
  console.error(`\n✗ Manifesto SEO validation failed (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Manifesto SEO valid: canonical=${CANONICAL}, OG+Twitter+JSON-LD present`);
