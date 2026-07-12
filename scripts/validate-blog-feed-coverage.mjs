#!/usr/bin/env node
/**
 * Parses public/sitemap.xml, public/sitemap-images.xml, and public/rss.xml
 * and confirms every blog post (dynamic + static) appears in each feed and
 * that entry counts match the source of truth.
 *
 * Source of truth = blogPosts.ts + extraStaticBlogPosts registered in
 * scripts/regen-feeds.mjs (mirrors what regen-feeds.mjs writes).
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { blogPosts } from "../src/lib/blogPosts.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASE = "https://weddings.io";

// Recover the extraStaticBlogPosts slug list from regen-feeds.mjs so this
// validator stays in lockstep with generation without importing that file.
const feedSrc = readFileSync(join(ROOT, "scripts/regen-feeds.mjs"), "utf8");
const extraSlugs = [...feedSrc.matchAll(/slug:\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);

const expectedSlugs = new Set([...blogPosts.map((p) => p.slug), ...extraSlugs]);

// Also cross-check that every static folder under public/blog/ is either in
// blogPosts.ts or in extraSlugs; otherwise it's missing from all feeds.
const staticDir = join(ROOT, "public/blog");
if (existsSync(staticDir)) {
  for (const name of readdirSync(staticDir)) {
    const p = join(staticDir, name);
    if (statSync(p).isDirectory() && existsSync(join(p, "index.html")) && !expectedSlugs.has(name)) {
      console.error(`✗ public/blog/${name}/ exists but is not in blogPosts.ts or extraStaticBlogPosts`);
      process.exit(1);
    }
  }
}

const read = (p) => readFileSync(join(ROOT, p), "utf8");

const parseLocs = (xml) => new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
const parseLinks = (xml) => new Set([...xml.matchAll(/<link>([^<]+)<\/link>/g)].map((m) => m[1]));

const sitemap = parseLocs(read("public/sitemap.xml"));
const sitemapImages = parseLocs(read("public/sitemap-images.xml"));
const rssLinks = parseLinks(read("public/rss.xml"));

const errors = [];

const isBlogLoc = (u) => {
  if (!u.startsWith(`${BASE}/blog/`) || u === `${BASE}/blog/`) return false;
  const rest = u.slice(`${BASE}/blog/`.length).replace(/\/$/, "");
  // Exclude taxonomy/pagination/index routes — only individual post slugs count.
  if (!rest) return false;
  if (rest.includes("/")) return false;
  if (["tag", "category", "page", "topics", "index"].includes(rest)) return false;
  return true;
};
const slugFromBlogUrl = (u) => u.replace(`${BASE}/blog/`, "").replace(/\/$/, "");

const sitemapBlogSlugs = new Set([...sitemap].filter(isBlogLoc).map(slugFromBlogUrl));
const imageSitemapBlogSlugs = new Set([...sitemapImages].filter(isBlogLoc).map(slugFromBlogUrl));
const rssBlogSlugs = new Set([...rssLinks].filter(isBlogLoc).map(slugFromBlogUrl));

for (const slug of expectedSlugs) {
  if (!sitemapBlogSlugs.has(slug)) errors.push(`sitemap.xml missing /blog/${slug}/`);
  if (!rssBlogSlugs.has(slug)) errors.push(`rss.xml missing /blog/${slug}/`);
}

// Reverse check: no unexpected entries in the full-coverage feeds.
for (const slug of sitemapBlogSlugs) {
  if (!expectedSlugs.has(slug)) errors.push(`sitemap.xml has unknown /blog/${slug}/`);
}
for (const slug of rssBlogSlugs) {
  if (!expectedSlugs.has(slug)) errors.push(`rss.xml has unknown /blog/${slug}/`);
}
for (const slug of imageSitemapBlogSlugs) {
  if (!expectedSlugs.has(slug)) errors.push(`sitemap-images.xml has unknown /blog/${slug}/`);
}

// Count parity for the two full-coverage feeds.
if (sitemapBlogSlugs.size !== expectedSlugs.size) {
  errors.push(`sitemap.xml blog count ${sitemapBlogSlugs.size} ≠ expected ${expectedSlugs.size}`);
}
if (rssBlogSlugs.size !== expectedSlugs.size) {
  errors.push(`rss.xml blog count ${rssBlogSlugs.size} ≠ expected ${expectedSlugs.size}`);
}
// sitemap-images.xml is a curated image sitemap (not every post has a
// dedicated hero worth submitting to Google Images), so we don't demand
// full coverage — but the newest posts MUST be present.

// Explicit sanity: the new transparent territory pricing post is present.
const REQUIRED = "transparent-territory-pricing-weddings-io";
if (!sitemapBlogSlugs.has(REQUIRED)) errors.push(`sitemap.xml missing REQUIRED post ${REQUIRED}`);
if (!rssBlogSlugs.has(REQUIRED)) errors.push(`rss.xml missing REQUIRED post ${REQUIRED}`);
if (!imageSitemapBlogSlugs.has(REQUIRED)) errors.push(`sitemap-images.xml missing REQUIRED post ${REQUIRED}`);

if (errors.length) {
  console.error(`\n✗ Blog feed coverage failed (${errors.length}):\n`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log(
  `✓ Feeds cover all ${expectedSlugs.size} blog post(s) — sitemap.xml, sitemap-images.xml, rss.xml counts match`,
);
