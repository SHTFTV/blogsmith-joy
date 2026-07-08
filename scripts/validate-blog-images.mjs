#!/usr/bin/env node
/**
 * Fetches every blog post's og/twitter image URL and asserts:
 *   • HTTP 200
 *   • Content-Type: image/*
 *   • Minimum dimensions (default 600×315 — Twitter/OG lower bound)
 *
 * Blog images in src/lib/blogPosts.ts are stored as absolute site paths
 * (e.g. "/images/foo.jpg" or Lovable "/__l5e/..." asset URLs), so we
 * resolve them against BASE_URL.
 *
 * Usage:
 *   BASE_URL=https://weddings.io node scripts/validate-blog-images.mjs
 *   MIN_W=1200 MIN_H=630 BASE_URL=... node scripts/validate-blog-images.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASE_URL = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const MIN_W = Number(process.env.MIN_W || 600);
const MIN_H = Number(process.env.MIN_H || 315);

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
// Collect string-literal image fields (asset-imported images resolve at build
// time and are validated in production by the SEO scanner + rich-results job).
const imageMatches = [...posts.matchAll(/image:\s*"([^"]+)"/g)].map((m) => m[1]);
const unique = [...new Set(imageMatches)];

if (unique.length === 0) {
  console.log("✓ No literal image URLs to validate (all bundled via imports).");
  process.exit(0);
}

// --- tiny dimension parsers (PNG + JPEG); returns {w,h} or null ---
function pngDims(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}
function jpegDims(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}
function webpDims(buf) {
  if (buf.length < 30 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const chunk = buf.toString("ascii", 12, 16);
  if (chunk === "VP8X") return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
  if (chunk === "VP8L") return { w: 1 + (((buf[22] | (buf[23] << 8)) & 0x3fff)), h: 1 + ((((buf[23] >> 6) | (buf[24] << 2) | (buf[25] << 10)) & 0x3fff)) };
  if (chunk === "VP8 ") return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  return null;
}
const dims = (buf) => pngDims(buf) || jpegDims(buf) || webpDims(buf);

const errors = [];
for (const src of unique) {
  const url = /^https?:/.test(src) ? src : `${BASE_URL}${src.startsWith("/") ? "" : "/"}${src}`;
  try {
    const res = await fetch(url);
    if (!res.ok) { errors.push(`${url} — HTTP ${res.status}`); continue; }
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) { errors.push(`${url} — content-type "${ct}" not image/*`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const d = dims(buf);
    if (!d) { errors.push(`${url} — could not parse dimensions (unsupported format)`); continue; }
    if (d.w < MIN_W || d.h < MIN_H) {
      errors.push(`${url} — ${d.w}×${d.h} below minimum ${MIN_W}×${MIN_H}`);
      continue;
    }
    console.log(`  ✓ ${d.w}×${d.h} ${ct.split(";")[0]} — ${url}`);
  } catch (err) {
    errors.push(`${url} — ${err.message}`);
  }
}

if (errors.length) {
  console.error(`\n✗ Blog image validation failed (${errors.length}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ ${unique.length} blog image URLs validated (≥${MIN_W}×${MIN_H}, image/*)`);
