#!/usr/bin/env node
/**
 * Post-publish crawler for the manifesto's key internal targets.
 * For each target:
 *   - follows redirects manually (rejects loops, >5 hops)
 *   - requires terminal HTTP 200
 *   - fetches the terminal HTML and reads <link rel="canonical">
 *   - fails when the canonical does not equal the expected URL
 *     (crawlers silently drop pages whose canonical points elsewhere)
 *
 * Runs against BASE_URL (defaults to https://weddings.io). Skip with
 * SKIP_MANIFESTO_CANONICALS=1.
 */
if (process.env.SKIP_MANIFESTO_CANONICALS === "1") {
  console.log("↷ Manifesto internal-canonicals check skipped (SKIP_MANIFESTO_CANONICALS=1)");
  process.exit(0);
}

const BASE = (process.env.BASE_URL || "https://weddings.io").replace(/\/$/, "");
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";

// Expected canonical for each internal target linked from the manifesto.
// key = path linked from the post body; value = the canonical it MUST resolve to.
const TARGETS = {
  [`/blog/${SLUG}/`]: `${BASE}/blog/${SLUG}/`,
  "/ecosystem/": `${BASE}/ecosystem/`,
  "/blog/ppp-pricing-wedding-platform-industry-first/": `${BASE}/blog/ppp-pricing-wedding-platform-industry-first/`,
  "/blog/ultimate-south-asian-wedding-checklist-2025/": `${BASE}/blog/ultimate-south-asian-wedding-checklist-2025/`,
};

const errors = [];
const UA = { "user-agent": "weddings-io-canonical-crawler/1.0" };

async function trace(startUrl) {
  const chain = [];
  let cur = startUrl;
  for (let i = 0; i < 6; i++) {
    if (chain.includes(cur)) return { ok: false, chain, reason: `redirect loop at ${cur}` };
    chain.push(cur);
    let r;
    try { r = await fetch(cur, { method: "GET", redirect: "manual", headers: UA }); }
    catch (e) { return { ok: false, chain, reason: `fetch error: ${e.message}` }; }
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location");
      if (!loc) return { ok: false, chain, reason: `${r.status} without Location` };
      cur = new URL(loc, cur).toString();
      continue;
    }
    return { ok: r.status === 200, chain, status: r.status, res: r };
  }
  return { ok: false, chain, reason: "too many redirects (>5)" };
}

console.log(`Post-publish canonical crawl against ${BASE}\n`);
for (const [path, expectedCanonical] of Object.entries(TARGETS)) {
  const url = `${BASE}${path}`;
  const result = await trace(url);
  if (!result.ok) {
    errors.push(`${path} → ${result.reason ?? `HTTP ${result.status}`}  chain: ${result.chain.join(" → ")}`);
    console.error(`  ✗ ${path} — ${result.reason ?? `HTTP ${result.status}`}`);
    continue;
  }
  const html = await result.res.text();
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1];
  if (!canonical) {
    errors.push(`${path} — missing <link rel="canonical">`);
    console.error(`  ✗ ${path} — missing canonical`);
    continue;
  }
  if (canonical !== expectedCanonical) {
    errors.push(`${path} — canonical drift\n      expected: ${expectedCanonical}\n      got:      ${canonical}`);
    console.error(`  ✗ ${path} — canonical drift → ${canonical}`);
    continue;
  }
  const hops = result.chain.length;
  console.log(`  ✓ ${path} — 200, canonical OK${hops > 1 ? ` (${hops - 1} redirect${hops > 2 ? "s" : ""})` : ""}`);
}

if (errors.length) {
  console.error(`\n✗ Manifesto internal canonicals FAILED (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`\n✓ All ${Object.keys(TARGETS).length} manifesto internal targets resolve 200 with matching canonicals.`);
