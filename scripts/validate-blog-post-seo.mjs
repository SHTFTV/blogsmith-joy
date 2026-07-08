#!/usr/bin/env node
/**
 * Validate a blog post's SEO surface area (canonical, OG, Twitter, Article JSON-LD)
 * before publishing. Works for any slug — pass via CLI arg or BLOG_SLUG env.
 *
 * Usage:
 *   node scripts/validate-blog-post-seo.mjs <slug>
 *   BLOG_SLUG=<slug> node scripts/validate-blog-post-seo.mjs
 *
 * Default slug: the newest post in src/lib/blogPosts.ts by date.
 * Exits non-zero on any failure.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");
const sitemap = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");
const rss = readFileSync(join(ROOT, "public/rss.xml"), "utf8");

// Pick slug: CLI arg, env var, or newest visible slug
let slug = process.argv[2] || process.env.BLOG_SLUG;
if (!slug) {
  const dateSlugs = [...posts.matchAll(/slug:\s*"([^"]+)"[\s\S]*?date:\s*"(\d{4}-\d{2}-\d{2})"/g)]
    .map((m) => ({ slug: m[1], date: m[2] }))
    .sort((a, b) => b.date.localeCompare(a.date));
  slug = dateSlugs[0]?.slug;
}
if (!slug) {
  console.error("✗ No slug provided and none found in blogPosts.ts");
  process.exit(1);
}

const url = `https://weddings.io/blog/${slug}/`;
const errors = [];
const fail = (m) => errors.push(m);

// 1. Post exists and is visible
if (!posts.includes(`slug: "${slug}"`)) fail(`blogPosts.ts missing slug "${slug}"`);
if (!new RegExp(`visibleBlogSlugs[\\s\\S]*?"${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(posts)) {
  fail(`"${slug}" not listed in visibleBlogSlugs`);
}

// 2. Post block has required fields
const startIdx = posts.indexOf(`slug: "${slug}"`);
const nextSlug = posts.indexOf('slug: "', startIdx + 10);
const block = posts.slice(startIdx, nextSlug > 0 ? nextSlug : startIdx + 40000);
for (const field of ["title", "excerpt", "image", "date", "category"]) {
  if (!new RegExp(`\\b${field}:`).test(block)) fail(`post "${slug}" missing ${field}`);
}
if (!/imageAlt:\s*"/.test(block)) fail(`post "${slug}" missing imageAlt (accessibility + og:image alt)`);
if (!/metaDescription:\s*"/.test(block) && !/excerpt:\s*"/.test(block)) {
  fail(`post "${slug}" needs metaDescription or excerpt for og:description`);
}

// 3. blog.$slug.tsx emits every required tag (shared across all blog posts)
const required = [
  { name: "canonical link", re: /rel:\s*"canonical",\s*href:\s*url/ },
  { name: "og:type=article", re: /property:\s*"og:type",\s*content:\s*"article"/ },
  { name: "og:title", re: /property:\s*"og:title"/ },
  { name: "og:description", re: /property:\s*"og:description"/ },
  { name: "og:url", re: /property:\s*"og:url"/ },
  { name: "og:image", re: /property:\s*"og:image"/ },
  { name: "twitter:card=summary_large_image", re: /name:\s*"twitter:card",\s*content:\s*"summary_large_image"/ },
  { name: "twitter:title", re: /name:\s*"twitter:title"/ },
  { name: "twitter:description", re: /name:\s*"twitter:description"/ },
  { name: "twitter:image", re: /name:\s*"twitter:image"/ },
  { name: "Article JSON-LD", re: /"@type":\s*"Article"/ },
  { name: "BreadcrumbList JSON-LD", re: /"@type":\s*"BreadcrumbList"/ },
];
for (const { name, re } of required) {
  if (!re.test(route)) fail(`blog.$slug.tsx missing ${name}`);
}

// 4. Feeds include the URL
if (!sitemap.includes(url)) fail(`sitemap.xml missing ${url}`);
if (!rss.includes(url)) fail(`rss.xml missing ${url}`);

if (errors.length) {
  console.error(`\n✗ Blog SEO validation failed for "${slug}" (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Blog SEO valid for "${slug}" — canonical=${url}, OG+Twitter+Article JSON-LD present, in sitemap+RSS`);
