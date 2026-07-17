#!/usr/bin/env node
/**
 * CI gate: every non-skipped HTML entry point under public/ must declare
 * both og:image and twitter:image. Fails with a clear list of offenders.
 * Runs after scripts/inject-html-og.mjs so any remaining miss is a real bug
 * (e.g. no <head> tag to inject into).
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUBLIC = join(ROOT, "public");
const SKIP_RE = /^public\/(templates|tests|\.well-known|browserconfig|404|thank-you|google[^/]*\.html|google-verification|_)/;

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

const missing = [];
for (const file of walk(PUBLIC)) {
  const rel = relative(ROOT, file);
  if (SKIP_RE.test(rel)) continue;
  const src = readFileSync(file, "utf8");
  const hasOg = /og:image/i.test(src);
  const hasTw = /twitter:image/i.test(src);
  if (!hasOg || !hasTw) {
    missing.push({ rel, hasOg, hasTw });
  }
}

if (missing.length) {
  console.error(`\n✗ HTML og:image / twitter:image gate failed (${missing.length} page(s)):`);
  for (const { rel, hasOg, hasTw } of missing) {
    const flags = [!hasOg && "og:image", !hasTw && "twitter:image"].filter(Boolean).join(" + ");
    console.error(`  - ${rel} — missing ${flags}`);
  }
  console.error(`\nRun \`node scripts/inject-html-og.mjs\` to auto-inject defaults.`);
  process.exit(1);
}
console.log(`✓ HTML og:image / twitter:image gate passed`);
