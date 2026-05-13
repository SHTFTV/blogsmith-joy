#!/usr/bin/env node
/**
 * Production verification for the 4 vendor/planner blog posts.
 *
 * Checks per slug:
 *   1. GET https://<base>/blog/<slug>/hero.jpg returns 200 + image/jpeg
 *      and the byte length matches the local file in public/weddings-io-deploy.
 *   2. GET https://<base>/blog/<slug>/ returns 200 HTML.
 *   3. The HTML contains an <img> whose alt is byte-identical to og:image:alt.
 *   4. og:image content equals the canonical hero.jpg URL for that slug.
 *
 * Usage:
 *   node scripts/verify-blog-heroes.mjs                    # defaults to https://weddings.io
 *   node scripts/verify-blog-heroes.mjs https://staging... # override base URL
 *
 * Exits 0 on full pass, 1 on any failure (CI-friendly).
 */
import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const BASE = (process.argv[2] || process.env.VERIFY_BASE || "https://weddings.io").replace(/\/$/, "");
const SLUGS = [
  "vendor-signup-kyc-verification",
  "wedding-planners-app-for-couples",
  "find-verified-wedding-planners",
  "why-vendor-verification-matters",
  "how-to-hire-south-asian-wedding-planner",
  "wedding-vendor-contracts-essentials",
];
const LOCAL_ROOT = resolve(process.cwd(), "public/weddings-io-deploy/blog");

const pick = (html, re) => {
  const m = html.match(re);
  return m ? m[1] : null;
};
const decode = (s) =>
  s == null
    ? null
    : s
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">");

let failures = 0;
const log = (slug, ok, msg) => {
  const tag = ok ? "PASS" : "FAIL";
  if (!ok) failures++;
  console.log(`  [${tag}] ${slug} — ${msg}`);
};

for (const slug of SLUGS) {
  console.log(`\n=== ${slug} ===`);
  const heroUrl = `${BASE}/blog/${slug}/hero.jpg`;
  const pageUrl = `${BASE}/blog/${slug}/`;
  const localHero = `${LOCAL_ROOT}/${slug}/hero.jpg`;

  // 1. Hero image fetch
  let remoteBytes = null;
  try {
    const r = await fetch(heroUrl);
    log(slug, r.status === 200, `hero.jpg HTTP ${r.status}`);
    const ct = r.headers.get("content-type") || "";
    log(slug, ct.startsWith("image/"), `content-type=${ct}`);
    remoteBytes = (await r.arrayBuffer()).byteLength;
  } catch (e) {
    log(slug, false, `hero fetch error: ${e.message}`);
    continue;
  }

  // 2. Local file size match
  try {
    const localSize = statSync(localHero).size;
    log(slug, localSize === remoteBytes, `byte length local=${localSize} remote=${remoteBytes}`);
  } catch (e) {
    log(slug, false, `local hero missing: ${e.message}`);
  }

  // 3. Page HTML
  let html = "";
  try {
    const r = await fetch(pageUrl);
    log(slug, r.status === 200, `page HTTP ${r.status}`);
    html = await r.text();
  } catch (e) {
    log(slug, false, `page fetch error: ${e.message}`);
    continue;
  }

  const imgAlt = decode(pick(html, /<img[^>]*hero\.jpg[^>]*\balt="([^"]*)"/i));
  const ogImg = pick(html, /property="og:image"\s+content="([^"]+)"/);
  const ogAlt = decode(pick(html, /property="og:image:alt"\s+content="([^"]+)"/));
  const expectedOg = `${BASE}/blog/${slug}/hero.jpg`;

  log(slug, !!imgAlt, `<img alt> present`);
  log(slug, !!ogAlt, `og:image:alt present`);
  log(slug, imgAlt === ogAlt, `<img alt> ≡ og:image:alt`);
  log(slug, ogImg === expectedOg, `og:image == ${expectedOg} (got ${ogImg})`);
}

console.log(`\n${failures === 0 ? "✅ ALL CHECKS PASSED" : `❌ ${failures} FAILURE(S)`}`);
process.exit(failures === 0 ? 0 : 1);
