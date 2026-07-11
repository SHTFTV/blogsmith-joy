#!/usr/bin/env node
/**
 * Fallback image audit.
 *
 * Scans every route file under src/routes/ and every static HTML page under
 * public/ for og:image and twitter:image. Any page that doesn't declare its
 * own is required to inherit the root default (src/routes/__root.tsx).
 * Also confirms every referenced image URL resolves to an existing asset
 * (absolute weddings.io URL → public/… file, relative path → public/…).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const DEFAULT_IMG = "/opengraph.jpg";

const walk = (dir, exts, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
};

const problems = [];

// 1. Confirm root default exists.
const rootSrc = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
const rootHasOg = /property:\s*["']og:image["'][\s\S]*?content:\s*["']([^"']+)["']/.exec(rootSrc);
const rootHasTw = /name:\s*["']twitter:image["'][\s\S]*?content:\s*["']([^"']+)["']/.exec(rootSrc);
if (!rootHasOg) problems.push("__root.tsx missing default og:image");
if (!rootHasTw) problems.push("__root.tsx missing default twitter:image");

const resolveToPublic = (url) => {
  const stripped = url
    .replace(/^https?:\/\/(?:www\.)?weddings\.io/i, "")
    .replace(/^\/+/, "/");
  if (!stripped.startsWith("/")) return null; // external — accept
  return join(PUBLIC, stripped.slice(1));
};

for (const [label, url] of [
  ["og:image", rootHasOg?.[1]],
  ["twitter:image", rootHasTw?.[1]],
]) {
  if (!url) continue;
  const local = resolveToPublic(url);
  if (local && !existsSync(local)) {
    problems.push(`default ${label} → ${url} is missing from public/`);
  }
}

// 2. Every referenced image URL in route source or HTML must resolve.
const findImages = (src) => {
  const urls = new Set();
  const re = /(?:property|name)=?["']?(og:image|twitter:image)["']?[^"'>]*(?:content=?["']?|:\s*["'])([^"'\s>]+)/gi;
  let m;
  while ((m = re.exec(src))) urls.add(m[2]);
  return [...urls];
};

const files = [
  ...walk(join(ROOT, "src/routes"), [".tsx", ".ts"]),
  ...walk(PUBLIC, [".html"]),
];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const rel = relative(ROOT, file);

  const hasOg = /og:image/.test(src);
  const hasTw = /twitter:image/.test(src);

  // Route files that render a real page need at least the root fallback to
  // reach them — that's automatic. HTML pages are self-contained: they must
  // declare both explicitly OR nothing (and rely on hosting default).
  if (file.endsWith(".html") && !hasOg && !hasTw) {
    // Only flag content HTML pages, not utility files.
    if (!/^public\/(templates|tests|\.well-known|browserconfig|404|thank-you|_)/.test(rel)) {
      problems.push(`${rel}: HTML page has no og:image or twitter:image`);
    }
  }

  for (const url of findImages(src)) {
    const local = resolveToPublic(url);
    if (local && !existsSync(local)) {
      problems.push(`${rel}: image ${url} does not resolve to a file in public/`);
    }
  }
}

if (problems.length) {
  console.error(`\n✗ Fallback image audit failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log(`✓ Fallback image audit passed — default ${DEFAULT_IMG} present and all og/twitter images resolve`);
