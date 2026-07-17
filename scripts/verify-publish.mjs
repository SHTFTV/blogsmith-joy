#!/usr/bin/env node
/**
 * Poll production for expected blog metadata and exit 0 only when every
 * requested slug matches.
 *
 * Usage:
 *   node scripts/verify-publish.mjs                                # 10 newest posts, https://weddings.io
 *   node scripts/verify-publish.mjs entity-authority-modern-seo    # one or more slugs
 *   ORIGIN=https://project--xxx.lovable.app node scripts/verify-publish.mjs slug
 *
 * Env:
 *   ORIGIN        default https://weddings.io
 *   MAX_ATTEMPTS  default 20
 *   INTERVAL_MS   default 15000
 */
const ORIGIN = (process.env.ORIGIN ?? "https://weddings.io").replace(/\/$/, "");
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS ?? 20);
const INTERVAL_MS = Number(process.env.INTERVAL_MS ?? 15_000);

const slugs = process.argv.slice(2);
const query = new URLSearchParams();
for (const s of slugs) query.append("slug", s);
const url = `${ORIGIN}/api/public/verify-posts${query.toString() ? `?${query}` : ""}`;

console.log(`→ polling ${url} (max ${MAX_ATTEMPTS} attempts, ${INTERVAL_MS}ms interval)`);

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  try {
    const res = await fetch(`${url}${query.toString() ? "&" : "?"}_cb=${Date.now()}`, {
      headers: { "cache-control": "no-cache" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const bar = `[${attempt}/${MAX_ATTEMPTS}]`;
    console.log(`${bar} ${data.matched}/${data.total} matched on ${data.origin}`);
    for (const r of data.results) {
      const tag = r.match ? "✓" : r.fallback ? "✗ FALLBACK" : "· MISMATCH";
      console.log(`  ${tag} /blog/${r.slug}/  HTTP ${r.status}`);
      for (const d of r.diffs) console.log(`      - ${d}`);
    }
    if (data.allMatched) {
      console.log("✓ Publish confirmed on production.");
      process.exit(0);
    }
  } catch (err) {
    console.error(`[${attempt}/${MAX_ATTEMPTS}] fetch error:`, err.message ?? err);
  }
  if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, INTERVAL_MS));
}

console.error("✗ Publish verification did not converge — production still stale.");
process.exit(1);
