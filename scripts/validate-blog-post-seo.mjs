#!/usr/bin/env node
/**
 * Build-time SEO validation for every blog post in src/lib/blogPosts.ts.
 *
 * Rules:
 *  1. Every post has focusKeywords (>= 1).
 *  2. Effective SEO title ≤ 70 chars AND unique across all posts.
 *  3. Effective meta description ≤ 160 chars AND unique across all posts.
 *  4. Primary focus keyword (focusKeywords[0]) appears in either the
 *     effective title or effective description (case-insensitive).
 *
 * Effective values mirror src/routes/blog.$slug.tsx head() fallbacks.
 */
import { blogPosts } from "../src/lib/blogPosts.ts";

const MAX_TITLE = 70;
const MAX_DESC = 160;

function effectiveTitle(p) {
  const kw = p.focusKeywords?.[0];
  if (p.seoTitle) return p.seoTitle;
  const includesKw = kw && p.title.toLowerCase().includes(kw.toLowerCase());
  const raw = includesKw || !kw
    ? `${p.title} | Weddings.io`
    : `${p.title} — ${kw} | Weddings.io`;
  return raw.length > MAX_TITLE ? `${raw.slice(0, MAX_TITLE - 1)}…` : raw;
}

function effectiveDescription(p) {
  const kw = p.focusKeywords?.[0];
  const base = p.metaDescription ?? p.excerpt ?? "";
  const withKw = p.metaDescription
    ? base
    : kw && !base.toLowerCase().includes(kw.toLowerCase())
      ? `${kw}: ${base}`
      : base;
  return withKw.length > MAX_DESC ? `${withKw.slice(0, MAX_DESC - 1)}…` : withKw;
}

const errors = [];
const titleSeen = new Map();
const descSeen = new Map();

for (const p of blogPosts) {
  const title = effectiveTitle(p);
  const desc = effectiveDescription(p);
  const kw = p.focusKeywords?.[0];

  if (!p.focusKeywords?.length) {
    errors.push(`${p.slug}: missing focusKeywords`);
    continue;
  }
  if (title.length > MAX_TITLE) errors.push(`${p.slug}: title ${title.length} > ${MAX_TITLE} — "${title}"`);
  if (desc.length > MAX_DESC) errors.push(`${p.slug}: description ${desc.length} > ${MAX_DESC}`);
  if (!desc) errors.push(`${p.slug}: empty description`);

  const kwLower = kw.toLowerCase();
  const kwPresent =
    title.toLowerCase().includes(kwLower) || desc.toLowerCase().includes(kwLower);
  if (!kwPresent) {
    errors.push(`${p.slug}: primary focus keyword "${kw}" not found in title or description`);
  }

  const tKey = title.toLowerCase().trim();
  if (titleSeen.has(tKey)) {
    errors.push(`${p.slug}: duplicate SEO title — also used by ${titleSeen.get(tKey)}`);
  } else titleSeen.set(tKey, p.slug);

  const dKey = desc.toLowerCase().trim();
  if (descSeen.has(dKey)) {
    errors.push(`${p.slug}: duplicate meta description — also used by ${descSeen.get(dKey)}`);
  } else descSeen.set(dKey, p.slug);
}

if (errors.length) {
  console.error(`✗ Blog post SEO validation failed (${errors.length} issue${errors.length > 1 ? "s" : ""}):\n`);
  for (const e of errors) console.error("  •", e);
  process.exit(1);
}

console.log(`✓ ${blogPosts.length} blog posts pass SEO validation (unique titles ≤${MAX_TITLE}, unique descriptions ≤${MAX_DESC}, focus keywords present).`);
