#!/usr/bin/env node
/**
 * Scrape a live production blog URL and assert its <head> matches
 * the source-of-truth in src/lib/blogPosts.ts.
 *
 * Checks:
 *   - canonical → https://weddings.io/blog/<slug>/
 *   - og:url    → same
 *   - og:title matches derived title (seoTitle || `${title} | Weddings.io`)
 *   - og:description matches metaDescription || excerpt
 *   - og:image resolves absolute + returns HTTP 200 image/*
 *   - twitter:card = summary_large_image
 *   - JSON-LD contains an @type of BlogPosting (or Article) with matching headline
 *
 * Usage:
 *   node scripts/verify-production-og.mjs <slug>
 *   node scripts/verify-production-og.mjs entity-authority-modern-seo
 *   BASE_URL=https://weddings.io node scripts/verify-production-og.mjs <slug>
 */
import { blogPosts } from "../src/lib/blogPosts.ts";

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const slug = process.argv[2];
if (!slug) {
  console.error("Usage: verify-production-og.mjs <slug>");
  process.exit(2);
}
const post = blogPosts.find((p) => p.slug === slug);
if (!post) {
  console.error(`Unknown slug in blogPosts.ts: ${slug}`);
  process.exit(2);
}

const url = `${BASE}/blog/${slug}/`;
const res = await fetch(url, { headers: { "user-agent": "weddings-io-og-verifier/1.0" } });
if (!res.ok) {
  console.error(`✗ ${url} → HTTP ${res.status}`);
  process.exit(1);
}
const html = await res.text();

const meta = (name, attr = "property") => {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");
  const m = html.match(re) || html.match(
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${name}["']`, "i"),
  );
  return m?.[1];
};
const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];

const primaryKeyword = post.focusKeywords?.[0];
const expectedRawTitle = post.seoTitle
  ?? (primaryKeyword && !post.title.toLowerCase().includes(primaryKeyword.toLowerCase())
      ? `${post.title} — ${primaryKeyword} | Weddings.io`
      : `${post.title} | Weddings.io`);
const expectedTitle = expectedRawTitle.length > 70
  ? `${expectedRawTitle.slice(0, 69)}…` : expectedRawTitle;
const expectedDescRaw = post.metaDescription ?? post.excerpt ?? "";
const expectedDescWithKw = post.metaDescription
  ? expectedDescRaw
  : (primaryKeyword && !expectedDescRaw.toLowerCase().includes(primaryKeyword.toLowerCase())
      ? `${primaryKeyword}: ${expectedDescRaw}` : expectedDescRaw);
const expectedDesc = expectedDescWithKw.length > 160
  ? `${expectedDescWithKw.slice(0, 159)}…` : expectedDescWithKw;
const expectedImage = post.image?.startsWith("http")
  ? post.image : `${BASE}${post.image ?? "/opengraph.jpg"}`;

const errors = [];
const check = (label, actual, expected) => {
  if (actual !== expected) errors.push(`${label}\n    expected: ${expected}\n    got:      ${actual ?? "(missing)"}`);
  else console.log(`  ✓ ${label} = ${actual}`);
};

check("canonical", canonical, url);
check("og:url", meta("og:url"), url);
check("og:title", meta("og:title"), expectedTitle);
check("og:description", meta("og:description"), expectedDesc);
check("og:image", meta("og:image"), expectedImage);
check("twitter:card", meta("twitter:card", "name"), "summary_large_image");
check("twitter:image", meta("twitter:image", "name"), expectedImage);

// JSON-LD headline sanity.
const ldMatch = [...html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)];
let ldOk = false;
for (const m of ldMatch) {
  try {
    const obj = JSON.parse(m[1].trim());
    const t = Array.isArray(obj["@type"]) ? obj["@type"][0] : obj["@type"];
    if ((t === "BlogPosting" || t === "Article") && obj.headline === post.title) {
      console.log(`  ✓ JSON-LD ${t} headline = ${obj.headline}`);
      ldOk = true; break;
    }
  } catch {}
}
if (!ldOk) errors.push(`JSON-LD BlogPosting/Article with headline "${post.title}" not found`);

// og:image must fetch as image/*.
try {
  let img = await fetch(expectedImage, { method: "HEAD", redirect: "follow" });
  if (img.status === 405 || img.status === 501) img = await fetch(expectedImage, { redirect: "follow" });
  const ct = img.headers.get("content-type") || "";
  if (!img.ok) errors.push(`og:image HTTP ${img.status} — ${expectedImage}`);
  else if (!/^image\//i.test(ct)) errors.push(`og:image content-type "${ct}" not image/*`);
  else console.log(`  ✓ og:image reachable ${img.status} ${ct.split(";")[0]}`);
} catch (e) {
  errors.push(`og:image fetch error: ${e.message}`);
}

if (errors.length) {
  console.error(`\n✗ Production OG verification failed for ${url}:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ Production OG verified for ${url}`);
