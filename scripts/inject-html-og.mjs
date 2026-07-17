#!/usr/bin/env node
/**
 * Inject default og:image / twitter:image into any HTML entry point under
 * public/ that doesn't already declare them. Runs before the fallback image
 * audit so newly-authored pages don't ship without a share preview.
 *
 * Skip list mirrors scripts/audit-og-images.mjs (templates/tests/etc).
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const DEFAULT_IMG = "https://weddings.io/opengraph.jpg";
const SKIP_RE = /^public\/(templates|tests|\.well-known|browserconfig|404|thank-you|google[^/]*\.html|google-verification|_)/;

const OG_TAGS = [
  `<meta property="og:image" content="${DEFAULT_IMG}">`,
  `<meta property="og:image:width" content="1200">`,
  `<meta property="og:image:height" content="630">`,
].join("\n");
const TW_TAG = `<meta name="twitter:image" content="${DEFAULT_IMG}">`;

const walk = (dir, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (extname(p) === ".html") out.push(p);
  }
  return out;
};

const injected = [];
for (const file of walk(PUBLIC)) {
  const rel = relative(ROOT, file);
  if (SKIP_RE.test(rel)) continue;
  const src = readFileSync(file, "utf8");
  if (/og:image/i.test(src) || /twitter:image/i.test(src)) continue;
  if (!/<head[^>]*>/i.test(src)) continue;
  const next = src.replace(/<head([^>]*)>/i, (_m, attrs) => `<head${attrs}>\n${TAGS}`);
  writeFileSync(file, next);
  injected.push(rel);
}

if (injected.length) {
  console.log(`✓ Injected default og:image / twitter:image into ${injected.length} HTML page(s):`);
  for (const p of injected) console.log(`  + ${p}`);
} else {
  console.log("✓ No HTML pages needed og:image / twitter:image injection");
}
