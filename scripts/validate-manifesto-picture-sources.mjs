#!/usr/bin/env node
/**
 * Hero <picture> source-order + variant integrity test for the manifesto.
 * Fetches the live/preview manifesto HTML and asserts:
 *   1. The hero <picture> emits sources in order: image/avif → image/webp → <img> JPG fallback.
 *   2. Every referenced variant (AVIF, WebP, JPG at 800w/1200w/1600w) returns 200 with
 *      Content-Type matching its format and size within the per-format KB budget.
 *   3. og:image AND twitter:image resolve to the crawler-safe JPG (never AVIF/WebP).
 *
 * BASE_URL defaults to https://weddings.io. Skip with SKIP_PICTURE_SOURCES=1.
 */
if (process.env.SKIP_PICTURE_SOURCES === "1") {
  console.log("↷ Manifesto picture sources check skipped (SKIP_PICTURE_SOURCES=1)");
  process.exit(0);
}

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";
const URL_ = `${BASE}/blog/${SLUG}/`;

// Per-format KB budgets (keep aligned with validate-manifesto-discoverability.mjs).
const BUDGETS = {
  avif: { "800w": 25, "1200w": 40, "1600w": 60 },
  webp: { "800w": 30, "1200w": 55, "1600w": 80 },
  jpg:  { "800w": 60, "1200w": 100, "1600w": 140 },
};
const CT_EXPECT = { avif: /^image\/avif/i, webp: /^image\/webp/i, jpg: /^image\/jpe?g/i };

const errors = [];
const fail = (m) => errors.push(m);

console.log(`Fetching manifesto: ${URL_}\n`);
const res = await fetch(URL_, { headers: { "user-agent": "weddings-io-picture-tester/1.0" } });
if (!res.ok) { console.error(`✗ ${URL_} → HTTP ${res.status}`); process.exit(1); }
const html = await res.text();

// Isolate the hero <picture> — the first one that references the ai-weddings-who-wins base.
const heroMatch = html.match(/<picture\b[\s\S]*?<\/picture>/gi)?.find((p) => p.includes("ai-weddings-who-wins"));
if (!heroMatch) { console.error("✗ hero <picture> not found in manifesto HTML"); process.exit(1); }

// --- 1. source order: AVIF, then WebP, then <img> fallback ---
const orderedTypes = [...heroMatch.matchAll(/<source[^>]+type=["']([^"']+)["']/gi)].map((m) => m[1]);
const imgTag = heroMatch.match(/<img\b[^>]*>/i)?.[0];
if (!imgTag) fail("hero <picture> missing <img> fallback");
const expectedOrder = ["image/avif", "image/webp"];
if (orderedTypes.length < 2 || orderedTypes[0] !== "image/avif" || orderedTypes[1] !== "image/webp") {
  fail(`hero <picture> source order wrong. expected: ${expectedOrder.join(", ")} → <img>. got: ${orderedTypes.join(", ")} → <img>`);
} else {
  console.log(`  ✓ hero source order: image/avif → image/webp → <img> JPG`);
}
if (imgTag && !/\.jpe?g(\?|"|')/i.test(imgTag)) {
  fail(`hero <img> fallback is not a JPG — crawlers will drop the OG preview. got: ${imgTag}`);
}

// --- 2. fetch every variant referenced in srcset + <img src> ---
const collected = new Set();
for (const src of [...heroMatch.matchAll(/srcset=["']([^"']+)["']/gi)].map((m) => m[1])) {
  for (const part of src.split(",")) {
    const u = part.trim().split(/\s+/)[0];
    if (u) collected.add(u);
  }
}
const imgSrc = imgTag?.match(/\ssrc=["']([^"']+)["']/i)?.[1];
if (imgSrc) collected.add(imgSrc);

console.log(`\nProbing ${collected.size} hero variants…`);
for (const rel of collected) {
  const abs = rel.startsWith("http") ? rel : `${BASE}${rel.startsWith("/") ? "" : "/"}${rel}`;
  const ext = (abs.match(/\.(avif|webp|jpe?g)(?:\?|$)/i)?.[1] ?? "").toLowerCase().replace("jpeg", "jpg");
  const w = abs.match(/-(\d{3,4})w\./)?.[1];
  const bucket = w ? `${w}w` : null;

  let r;
  try { r = await fetch(abs, { method: "GET", redirect: "follow" }); }
  catch (e) { fail(`fetch error ${abs}: ${e.message}`); continue; }
  if (r.status !== 200) { fail(`HTTP ${r.status} ${abs}`); continue; }

  const ct = (r.headers.get("content-type") || "").split(";")[0].trim();
  if (ext && CT_EXPECT[ext] && !CT_EXPECT[ext].test(ct)) {
    fail(`content-type mismatch for ${abs}: expected image/${ext}, got "${ct}"`);
    continue;
  }
  const bytes = Number(r.headers.get("content-length")) || (await r.arrayBuffer()).byteLength;
  const kb = bytes / 1024;
  const budget = ext && bucket ? BUDGETS[ext]?.[bucket] : null;
  if (budget && kb > budget) {
    fail(`${abs} = ${kb.toFixed(1)}KB > ${budget}KB budget`);
    continue;
  }
  console.log(`  ✓ ${ext.toUpperCase().padEnd(4)} ${bucket ?? "?".padEnd(5)} ${kb.toFixed(1).padStart(6)}KB  ${ct}  ${abs}`);
}

// --- 3. og:image + twitter:image MUST be JPG ---
const meta = (name, attr = "property") => {
  const re1 = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*content=["']([^"']+)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]*${attr}=["']${name}["']`, "i");
  return (html.match(re1) || html.match(re2))?.[1];
};
for (const [tag, attr] of [["og:image", "property"], ["twitter:image", "name"]]) {
  const v = meta(tag, attr);
  if (!v) { fail(`${tag} missing on rendered page`); continue; }
  if (!/\.jpe?g(\?|$)/i.test(v)) {
    fail(`${tag} must reference a JPG for crawler compatibility. got: ${v}`);
  } else {
    console.log(`  ✓ ${tag} = JPG (${v})`);
  }
}

if (errors.length) {
  console.error(`\n✗ Hero picture-sources test FAILED (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ Hero <picture> order valid, all variants 200 within budget, og:image + twitter:image = JPG.`);
