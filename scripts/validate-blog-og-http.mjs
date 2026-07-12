#!/usr/bin/env node
/**
 * Verify every blog post's effective og:image URL is:
 *   1. absolute (starts with https://), and
 *   2. returns HTTP 200 with a Content-Type: image/* header.
 *
 * Mirrors the fallback logic in src/routes/blog.$slug.tsx:
 *   absoluteImage = image.startsWith("http") ? image : `https://weddings.io${image}`
 *   image ??= "/opengraph.jpg"
 *
 * Set BASE_URL to override the default host (useful for staging).
 *
 * Usage:
 *   node scripts/validate-blog-og-http.mjs
 *   BASE_URL=https://preview.weddings.io node scripts/validate-blog-og-http.mjs
 */
import { blogPosts } from "../src/lib/blogPosts.ts";

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const DEFAULT_OG = "/opengraph.jpg";

const effectiveOg = (post) => {
  const raw = post.image ?? DEFAULT_OG;
  return /^https?:\/\//i.test(raw) ? raw : `${BASE}${raw.startsWith("/") ? "" : "/"}${raw}`;
};

const targets = blogPosts.map((p) => ({ slug: p.slug, url: effectiveOg(p) }));
// Dedupe: many posts may share the default hero.
const unique = [...new Map(targets.map((t) => [t.url, t])).values()];

const errors = [];

for (const { slug, url } of unique) {
  if (!/^https:\/\//i.test(url)) {
    errors.push(`${slug}: og:image "${url}" is not absolute https://`);
    continue;
  }
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    // Some CDNs (Lovable /__l5e/) 405 on HEAD; fall back to GET.
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, { method: "GET", redirect: "follow" });
    }
    if (!res.ok) {
      errors.push(`${slug}: ${url} → HTTP ${res.status}`);
      continue;
    }
    const ct = res.headers.get("content-type") || "";
    if (!/^image\//i.test(ct)) {
      errors.push(`${slug}: ${url} content-type "${ct}" not image/*`);
      continue;
    }
    console.log(`  ✓ ${res.status} ${ct.split(";")[0]} — ${slug}`);
  } catch (err) {
    errors.push(`${slug}: ${url} — ${err.message}`);
  }
}

if (errors.length) {
  console.error(`\n✗ Blog og:image HTTP validation failed (${errors.length}):\n`);
  for (const e of errors) console.error("  -", e);
  process.exit(1);
}
console.log(`\n✓ ${unique.length} unique blog og:image URL(s) return HTTP 200 image/*`);
