#!/usr/bin/env node
/**
 * Sitemap linter — fails the build on:
 *   • duplicate <loc> URLs
 *   • malformed <lastmod> (must be YYYY-MM-DD or ISO-8601)
 *   • inconsistent lastmod formats across blog-post <url> entries
 *
 * Usage: node scripts/lint-sitemap.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const xml = readFileSync(join(ROOT, "public/sitemap.xml"), "utf8");

const errors = [];
const fail = (m) => errors.push(m);

const urlBlocks = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => m[1]);
if (urlBlocks.length === 0) fail("sitemap.xml contains no <url> entries");

// 1. Duplicate <loc>
const locs = urlBlocks.map((b) => (b.match(/<loc>([^<]+)<\/loc>/) || [])[1]).filter(Boolean);
const seen = new Map();
for (const loc of locs) seen.set(loc, (seen.get(loc) || 0) + 1);
const dupes = [...seen.entries()].filter(([, n]) => n > 1);
if (dupes.length) fail(`duplicate <loc> URLs:\n${dupes.map(([u, n]) => `      × ${n} — ${u}`).join("\n")}`);

// 2. lastmod format
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})$/;
const blogFormats = new Set();
for (const block of urlBlocks) {
  const loc = (block.match(/<loc>([^<]+)<\/loc>/) || [])[1];
  const lastmod = (block.match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1];
  if (!lastmod) continue;
  const dateOk = DATE_ONLY.test(lastmod);
  const isoOk = ISO_DATETIME.test(lastmod);
  if (!dateOk && !isoOk) fail(`invalid <lastmod> "${lastmod}" for ${loc}`);
  if (loc && loc.includes("/blog/") && loc !== "https://weddings.io/blog/") {
    blogFormats.add(dateOk ? "YYYY-MM-DD" : isoOk ? "ISO-8601" : "invalid");
  }
}
if (blogFormats.size > 1) {
  fail(`mismatched <lastmod> formats across blog posts: ${[...blogFormats].join(", ")} (pick one)`);
}

if (errors.length) {
  console.error(`\n✗ Sitemap lint failed (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Sitemap lint passed — ${locs.length} URLs, no dupes, lastmod format="${[...blogFormats][0] || "n/a"}"`);
