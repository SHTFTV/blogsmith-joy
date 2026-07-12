#!/usr/bin/env node
/**
 * Verify every blog post has a canonical link that self-references its
 * expected URL (https://weddings.io/blog/<slug>/).
 *
 *   • src/routes/blog.$slug.tsx — dynamic route builds canonical from params.
 *     We assert the source contains the exact template we expect.
 *   • public/blog/<slug>/index.html — every static HTML post must include
 *     <link rel="canonical" href="https://weddings.io/blog/<slug>/">.
 *   • Every slug in src/lib/blogPosts.ts (and the static-posts registry in
 *     scripts/regen-feeds.mjs) must resolve to one of the two above.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { blogPosts } from "../src/lib/blogPosts.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASE = "https://weddings.io";
const canonicalFor = (slug) => `${BASE}/blog/${slug}/`;

const errors = [];

// 1. Dynamic route source uses the expected canonical template.
const routeSrc = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");
const tmplRe = /https:\/\/weddings\.io\/blog\/\$\{params\.slug\}\//;
const canonicalRe = /rel:\s*["']canonical["'][\s\S]{0,80}?href:\s*url/;
if (!tmplRe.test(routeSrc)) {
  errors.push("blog.$slug.tsx: expected URL template `https://weddings.io/blog/${params.slug}/`");
}
if (!canonicalRe.test(routeSrc)) {
  errors.push("blog.$slug.tsx: expected `{ rel: 'canonical', href: url }` link entry");
}

// 2. Static HTML posts under public/blog/ must self-canonical.
const staticDir = join(ROOT, "public/blog");
const staticSlugs = existsSync(staticDir)
  ? readdirSync(staticDir).filter((n) => {
      const p = join(staticDir, n);
      return statSync(p).isDirectory() && existsSync(join(p, "index.html"));
    })
  : [];

for (const slug of staticSlugs) {
  const html = readFileSync(join(staticDir, slug, "index.html"), "utf8");
  const match = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  if (!match) {
    errors.push(`public/blog/${slug}/index.html: missing <link rel="canonical">`);
    continue;
  }
  const expected = canonicalFor(slug);
  if (match[1] !== expected) {
    errors.push(`public/blog/${slug}/index.html: canonical "${match[1]}" ≠ expected "${expected}"`);
  }
}

// 3. Every blogPosts.ts slug is served by the dynamic route (has no
//    conflicting static HTML with a different canonical). Static overrides
//    must match too — already covered by (2).
const dynamicSlugs = new Set(blogPosts.map((p) => p.slug));
for (const slug of staticSlugs) {
  // If a static HTML exists AND the slug is in blogPosts.ts, both must
  // canonical to the same URL — dynamic route already emits the expected
  // URL, so nothing extra to check.
  if (!dynamicSlugs.has(slug)) {
    // Static-only post — must be registered in regen-feeds.mjs's
    // extraStaticBlogPosts so it lands in sitemap.xml / rss.xml.
    const feed = readFileSync(join(ROOT, "scripts/regen-feeds.mjs"), "utf8");
    if (!feed.includes(`slug: '${slug}'`) && !feed.includes(`slug: "${slug}"`)) {
      errors.push(`public/blog/${slug}/: static post not registered in scripts/regen-feeds.mjs`);
    }
  }
}

// 4. Explicit spot-check: the transparent-territory-pricing-weddings-io
//    static post must have a correct canonical, OG (title/description/image),
//    Twitter card, and meta description. Regressions here silently break
//    social shares and search, so gate the build on it.
const REQUIRED_SLUG = "transparent-territory-pricing-weddings-io";
const REQUIRED_CANONICAL = canonicalFor(REQUIRED_SLUG);
const requiredPath = join(staticDir, REQUIRED_SLUG, "index.html");
if (!existsSync(requiredPath)) {
  errors.push(`REQUIRED post ${REQUIRED_SLUG}/index.html missing from public/blog/`);
} else {
  const html = readFileSync(requiredPath, "utf8");
  const metaContent = (name, attr = "name") => {
    const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']+)["']`, "i");
    const m = html.match(re);
    return m?.[1] ?? null;
  };
  const checks = [
    ["canonical", (html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) || [])[1], REQUIRED_CANONICAL],
    ["og:url", metaContent("og:url", "property"), REQUIRED_CANONICAL],
    ["og:type", metaContent("og:type", "property"), "article"],
    ["og:title", metaContent("og:title", "property"), null],
    ["og:description", metaContent("og:description", "property"), null],
    ["og:image", metaContent("og:image", "property"), null],
    ["twitter:card", metaContent("twitter:card"), "summary_large_image"],
    ["twitter:title", metaContent("twitter:title"), null],
    ["twitter:description", metaContent("twitter:description"), null],
    ["twitter:image", metaContent("twitter:image"), null],
    ["description", metaContent("description"), null],
  ];
  for (const [label, actual, expected] of checks) {
    if (!actual) {
      errors.push(`${REQUIRED_SLUG}: missing <meta ${label}>`);
    } else if (expected && actual !== expected) {
      errors.push(`${REQUIRED_SLUG}: ${label} "${actual}" ≠ expected "${expected}"`);
    }
  }
  // OG/Twitter title + description parity (social shares must match SEO).
  const ogTitle = metaContent("og:title", "property");
  const twTitle = metaContent("twitter:title");
  const ogDesc = metaContent("og:description", "property");
  const twDesc = metaContent("twitter:description");
  const metaDesc = metaContent("description");
  if (ogTitle && twTitle && ogTitle !== twTitle) errors.push(`${REQUIRED_SLUG}: og:title ≠ twitter:title`);
  if (ogDesc && twDesc && ogDesc !== twDesc) errors.push(`${REQUIRED_SLUG}: og:description ≠ twitter:description`);
  if (ogDesc && metaDesc && ogDesc !== metaDesc) errors.push(`${REQUIRED_SLUG}: og:description ≠ <meta description>`);
  const ogImg = metaContent("og:image", "property");
  const twImg = metaContent("twitter:image");
  if (ogImg && !/^https:\/\//i.test(ogImg)) errors.push(`${REQUIRED_SLUG}: og:image "${ogImg}" not absolute https://`);
  if (twImg && !/^https:\/\//i.test(twImg)) errors.push(`${REQUIRED_SLUG}: twitter:image "${twImg}" not absolute https://`);
  if (ogTitle && ogTitle.length > 70) errors.push(`${REQUIRED_SLUG}: og:title ${ogTitle.length} > 70 chars`);
  if (ogDesc && ogDesc.length > 160) errors.push(`${REQUIRED_SLUG}: og:description ${ogDesc.length} > 160 chars`);
}

if (errors.length) {
  console.error(`\n✗ Blog canonical validation failed (${errors.length}):\n`);
  for (const e of errors) console.error("  •", e);
  process.exit(1);
}
console.log(
  `✓ Canonicals OK — dynamic route + ${staticSlugs.length} static HTML post(s) self-canonical to ${BASE}/blog/<slug>/`,
);
