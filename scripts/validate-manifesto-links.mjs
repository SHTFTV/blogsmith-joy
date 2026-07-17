#!/usr/bin/env node
/**
 * Manifesto link scanner.
 * Extracts every markdown link [text](url) from the manifesto post body plus
 * the canonical URL and any related-post links, then HEAD-checks each internal
 * link against BASE_URL (default https://weddings.io). Detects:
 *   - hard 404 / 5xx
 *   - redirect loops (visits the same URL twice)
 *   - excessive redirect chains (>5 hops)
 *
 * External links are recorded but not blocking (warned only). Skipped
 * entirely with SKIP_MANIFESTO_LINKS=1 for offline runs.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

if (process.env.SKIP_MANIFESTO_LINKS === "1") {
  console.log("↷ Manifesto link scan skipped (SKIP_MANIFESTO_LINKS=1)");
  process.exit(0);
}

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";
const CANONICAL = `${BASE}/blog/${SLUG}/`;

const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const start = posts.indexOf(`slug: "${SLUG}"`);
if (start === -1) {
  console.error(`✗ slug ${SLUG} missing from blogPosts.ts`);
  process.exit(1);
}
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);

const linkRe = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
const found = new Map(); // url -> anchor text
let m;
while ((m = linkRe.exec(block)) !== null) {
  const url = m[2].startsWith("/") ? `${BASE}${m[2]}` : m[2];
  if (!found.has(url)) found.set(url, m[1]);
}
found.set(CANONICAL, "canonical");

const isInternal = (u) => u.startsWith(BASE + "/") || u === BASE;
const internal = [...found.entries()].filter(([u]) => isInternal(u));
const external = [...found.entries()].filter(([u]) => !isInternal(u));
console.log(`Manifesto: ${internal.length} internal + ${external.length} external link(s)\n`);

const errors = [];
const warns = [];

async function check(url) {
  const visited = new Set();
  let current = url;
  for (let hop = 0; hop < 6; hop++) {
    if (visited.has(current)) return { ok: false, status: "loop", chain: [...visited, current] };
    visited.add(current);
    let res;
    try {
      res = await fetch(current, {
        method: "HEAD",
        redirect: "manual",
        headers: { "user-agent": "weddings-io-link-scanner/1.0" },
      });
      // Some CDNs 405 HEAD — retry with GET.
      if (res.status === 405 || res.status === 501) {
        res = await fetch(current, { method: "GET", redirect: "manual" });
      }
    } catch (e) {
      return { ok: false, status: `fetch-error: ${e.message}` };
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return { ok: false, status: `${res.status} without Location` };
      current = new URL(loc, current).toString();
      continue;
    }
    return { ok: res.status < 400, status: res.status, chain: [...visited, current], hops: hop };
  }
  return { ok: false, status: "too-many-redirects", chain: [...visited] };
}

for (const [url, text] of internal) {
  const r = await check(url);
  const label = `[${text.slice(0, 32)}] ${url}`;
  if (r.status === "loop") {
    errors.push(`REDIRECT LOOP: ${label}\n    chain: ${r.chain.join(" → ")}`);
    console.error(`  ✗ ${label} — loop`);
  } else if (!r.ok) {
    errors.push(`${r.status} ${label}`);
    console.error(`  ✗ ${label} — ${r.status}`);
  } else {
    const hopNote = r.hops ? ` (${r.hops} redirect${r.hops > 1 ? "s" : ""})` : "";
    console.log(`  ✓ ${r.status} ${label}${hopNote}`);
  }
}

for (const [url, text] of external) {
  try {
    let res = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (res.status === 405 || res.status === 501) res = await fetch(url, { redirect: "follow" });
    if (!res.ok) warns.push(`external ${res.status} [${text}] ${url}`);
    else console.log(`  ✓ ${res.status} [external:${text.slice(0, 24)}] ${url}`);
  } catch (e) {
    warns.push(`external unreachable [${text}] ${url} — ${e.message}`);
  }
}

if (warns.length) {
  console.warn(`\n⚠ external warnings (${warns.length}):`);
  for (const w of warns) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n✗ Manifesto link scan failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ Manifesto links clean: ${internal.length} internal link(s) resolve, no 404s or redirect loops.`);
