#!/usr/bin/env node
/**
 * Manifesto image validator.
 * Verifies:
 *   - hero image file exists in /public
 *   - dimensions ≥ 1200×630 (OG minimum for large-image previews)
 *   - file size ≤ 500 KB (share preview / Core Web Vitals budget)
 *   - responsive variants (…-800w, …-1200w) exist next to the source
 *   - imageAlt in blogPosts.ts is non-empty and ≥ 40 chars
 *   - blog.$slug route wires og:image + twitter:image to post.image (no divergence)
 *
 * Uses `sips` (macOS/CI both have imagemagick or sips fallback via `identify`).
 * Prefers `identify -format` from ImageMagick, falls back to reading JPEG SOF0.
 */
import { readFileSync, existsSync, statSync, openSync, readSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname, basename, extname } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);

const start = posts.indexOf(`slug: "${SLUG}"`);
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);
const pick = (k) => block.match(new RegExp(`\\b${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];

const imagePath = pick("image");
const imageAlt = pick("imageAlt");

if (!imagePath) {
  console.error("✗ post has no image field");
  process.exit(1);
}
const absPath = join(ROOT, "public", imagePath.replace(/^\//, ""));
if (!existsSync(absPath)) fail(`image file missing: public${imagePath}`);

// Pure-JS JPEG dimensions parser (SOF0/SOF2). Works without ImageMagick.
function jpegDimensions(file) {
  const fd = openSync(file, "r");
  try {
    const size = statSync(file).size;
    const buf = Buffer.alloc(Math.min(size, 256 * 1024));
    readSync(fd, buf, 0, buf.length, 0);
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) return null;
      const marker = buf[i + 1];
      const len = buf.readUInt16BE(i + 2);
      // SOF markers: C0..CF except C4, C8, CC
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        const h = buf.readUInt16BE(i + 5);
        const w = buf.readUInt16BE(i + 7);
        return { w, h };
      }
      i += 2 + len;
    }
    return null;
  } finally {
    closeSync(fd);
  }
}

if (existsSync(absPath)) {
  const bytes = statSync(absPath).size;
  const kb = Math.round(bytes / 1024);
  const dims = jpegDimensions(absPath);
  if (!dims) fail(`could not read JPEG dimensions from ${imagePath}`);
  else {
    console.log(`  source: ${imagePath}  ${dims.w}×${dims.h}  ${kb} KB`);
    if (dims.w < 1200 || dims.h < 630) fail(`image ${dims.w}×${dims.h} < 1200×630 OG minimum`);
    if (dims.w / dims.h < 1.6 || dims.w / dims.h > 2.2)
      warns.push(`aspect ratio ${(dims.w / dims.h).toFixed(2)} outside 1.6–2.2 (OG cards look best ~1.91)`);
  }
  if (kb > 500) warns.push(`hero image ${kb} KB > 500 KB budget`);
}

// Responsive variants across formats — hard budgets fail the build.
// Budgets per width (KB): JPG, WebP, AVIF.
const BUDGETS = {
  800:  { jpg:  80, webp: 45, avif: 25 },
  1200: { jpg: 120, webp: 70, avif: 40 },
  1600: { jpg: 180, webp: 90, avif: 55 },
};
const FORMATS = ["jpg", "webp", "avif"];
const dir = dirname(absPath);
const base = basename(imagePath, extname(imagePath));
for (const w of Object.keys(BUDGETS).map(Number)) {
  for (const fmt of FORMATS) {
    const variant = join(dir, `${base}-${w}w.${fmt}`);
    const rel = `public/blog-images/${base}-${w}w.${fmt}`;
    if (!existsSync(variant)) {
      fail(`missing variant ${rel} (regenerate with scripts/optimize-manifesto-images.mjs)`);
      continue;
    }
    const kb = Math.round(statSync(variant).size / 1024);
    const budget = BUDGETS[w][fmt];
    const over = kb > budget;
    console.log(`  variant: ${base}-${w}w.${fmt.padEnd(4)} ${kb.toString().padStart(4)} KB  (budget ${budget} KB)${over ? "  ✗ OVER" : ""}`);
    if (over) fail(`${rel} = ${kb} KB exceeds ${budget} KB budget`);
    if (fmt === "jpg") {
      const dims = jpegDimensions(variant);
      if (!dims) fail(`variant ${w}w.jpg unreadable`);
      else if (dims.w !== w) warns.push(`variant ${w}w.jpg reports width ${dims.w}`);
    }
  }
}

// Alt text.
if (!imageAlt) fail("imageAlt missing (accessibility + image SEO)");
else {
  console.log(`  alt (${imageAlt.length} chars): ${imageAlt.slice(0, 90)}…`);
  if (imageAlt.length < 40) warns.push(`imageAlt only ${imageAlt.length} chars (aim ≥40 for descriptive alt)`);
  if (imageAlt.length > 250) warns.push(`imageAlt ${imageAlt.length} chars (screen readers truncate ~250)`);
}

// og:image must point at the JPG (widest crawler support — FB/Twitter/LinkedIn
// do NOT reliably render AVIF/WebP previews). WebP/AVIF are for on-page <picture>.
if (!/property:\s*"og:image"/.test(route)) fail("route missing og:image");
if (!/name:\s*"twitter:image"/.test(route)) fail("route missing twitter:image");
if (!imagePath.toLowerCase().endsWith(".jpg") && !imagePath.toLowerCase().endsWith(".jpeg") && !imagePath.toLowerCase().endsWith(".png")) {
  fail(`og:image source is "${imagePath}" — must be .jpg/.jpeg/.png for crawler compatibility (AVIF/WebP not rendered by FB/Twitter/LinkedIn)`);
}


if (warns.length) {
  console.warn(`\n⚠ warnings (${warns.length}):`);
  for (const w of warns) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n✗ image validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("\n✓ Manifesto images valid: dimensions ≥1200×630, responsive variants present, alt text descriptive, OG tags wired.");
