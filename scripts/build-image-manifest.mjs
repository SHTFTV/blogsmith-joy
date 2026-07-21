#!/usr/bin/env node
/**
 * build-image-manifest.mjs
 * Walk public/blog-images + public/opengraph-images, hash each file,
 * and write src/lib/blogImageManifest.json mapping "/path" → "shorthash".
 * Consumed by withImageVersion() at render time to bust CDN/browser caches.
 */
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const ROOTS = ["public/blog-images", "public/opengraph-images"];
const OUT = "src/lib/blogImageManifest.json";
const EXT = /\.(jpe?g|png|webp|avif|gif|svg)$/i;

async function walk(dir) {
  const out = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

const files = (await Promise.all(ROOTS.map(walk))).flat();
const manifest = {};
for (const f of files) {
  const buf = await fs.readFile(f);
  const hash = createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const webPath = "/" + f.replace(/^public\//, "");
  manifest[webPath] = hash;
}

const sorted = Object.fromEntries(Object.entries(manifest).sort());
await fs.writeFile(OUT, JSON.stringify(sorted, null, 2) + "\n");
console.log(`✓ wrote ${OUT} with ${files.length} entries`);
