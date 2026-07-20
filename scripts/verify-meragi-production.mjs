#!/usr/bin/env node
/**
 * Post-deploy verifier for the Meragi post.
 *
 * Fetches the production URL and confirms:
 *   • <title> and meta description match src/lib/blogPosts.ts
 *   • canonical + og:image + twitter:image are correct absolute URLs
 *   • BlogPosting/Article JSON-LD embeds the expected headline + image
 *   • Every declared image variant (AVIF/WebP/JPG) responds 200 with the
 *     right Content-Type header — i.e. what CI built is what production serves.
 *
 * Usage:
 *   BASE_URL=https://weddings.io node scripts/verify-meragi-production.mjs
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "meragi-vs-wedding-company-india-2026";
const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const URL = `${BASE}/blog/${SLUG}/`;

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const start = posts.indexOf(`slug: "${SLUG}"`);
const next = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, next > 0 ? next : start + 60000);
const pick = (k) => {
  const m = block.match(new RegExp(`\\b${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  return m ? m[1].replace(/\\"/g, '"') : "";
};
const expected = {
  title: pick("seoTitle") || `${pick("title")} | Weddings.io`,
  description: pick("metaDescription") || pick("excerpt"),
  headline: pick("title"),
  canonical: `${BASE}/blog/${SLUG}/`,
  images: [pick("image"), pick("imageWebp"), pick("imageWebpSmall"), pick("imageAvif"), pick("imageAvifSmall")].filter(Boolean),
};
const CT = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };

const errors = [];
const info = [];

console.log(`Verifying ${URL}`);
const res = await fetch(URL, { redirect: "follow" });
if (!res.ok) { console.error(`✗ HTTP ${res.status} — production not reachable yet.`); process.exit(1); }
const html = await res.text();

const grab = (re) => html.match(re)?.[1]?.trim() ?? "";
const gotTitle = grab(/<title[^>]*>([^<]+)<\/title>/i);
const gotDesc = grab(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
const gotCanonical = grab(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
const gotOg = grab(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
const gotTw = grab(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

const trunc = (s, n) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
if (gotTitle !== trunc(expected.title, 70)) errors.push(`title drift\n    expected: ${trunc(expected.title,70)}\n    got:      ${gotTitle}`);
if (gotDesc !== trunc(expected.description, 160)) errors.push(`description drift\n    expected: ${trunc(expected.description,160)}\n    got:      ${gotDesc}`);
if (gotCanonical !== expected.canonical) errors.push(`canonical drift: expected ${expected.canonical}, got ${gotCanonical}`);
if (!gotOg.endsWith(expected.images[0])) errors.push(`og:image mismatch: expected …${expected.images[0]}, got ${gotOg}`);
if (!gotTw.endsWith(expected.images[0])) errors.push(`twitter:image mismatch: expected …${expected.images[0]}, got ${gotTw}`);
info.push(`  title: ${gotTitle}`);
info.push(`  desc:  ${gotDesc}`);
info.push(`  canonical: ${gotCanonical}`);
info.push(`  og:image:  ${gotOg}`);

// JSON-LD
const jsonLdBlocks = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
  .map((m) => { try { return JSON.parse(m[1]); } catch { return null; } })
  .filter(Boolean);
const article = jsonLdBlocks.find((b) => {
  const t = Array.isArray(b) ? b : [b];
  return t.some((x) => x?.["@type"] === "Article" || x?.["@type"] === "BlogPosting");
});
if (!article) errors.push("JSON-LD Article/BlogPosting block not found");
else {
  const node = Array.isArray(article)
    ? article.find((x) => x?.["@type"] === "Article" || x?.["@type"] === "BlogPosting")
    : article;
  if (node.headline !== expected.headline) errors.push(`JSON-LD headline drift: expected "${expected.headline}", got "${node.headline}"`);
  const imgUrl = typeof node.image === "string" ? node.image : node.image?.url ?? node.image?.[0];
  if (!String(imgUrl).endsWith(expected.images[0])) errors.push(`JSON-LD image mismatch: expected …${expected.images[0]}, got ${imgUrl}`);
  info.push(`  JSON-LD headline: ${node.headline}`);
  info.push(`  JSON-LD image:    ${imgUrl}`);
}

// Image HEAD checks
for (const p of expected.images) {
  const u = `${BASE}${p}`;
  try {
    const r = await fetch(u, { method: "HEAD", redirect: "follow" });
    const ct = (r.headers.get("content-type") || "").split(";")[0].trim();
    const ext = p.slice(p.lastIndexOf(".")).toLowerCase();
    const want = CT[ext];
    if (!r.ok) errors.push(`image ${p} → HTTP ${r.status}`);
    else if (want && ct !== want) errors.push(`image ${p} wrong Content-Type: got ${ct}, want ${want}`);
    else info.push(`  ✓ ${p} → ${r.status} ${ct}`);
  } catch (e) { errors.push(`image ${p} fetch error: ${e.message}`); }
}

for (const line of info) console.log(line);
if (errors.length) {
  console.error(`\n✗ Production verification failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ Production matches CI build artifacts for ${SLUG}.`);
