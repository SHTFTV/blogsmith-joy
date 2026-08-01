// Validates every /cities/$slug route: HTTP 200, correct <title>, description,
// canonical, OG/Twitter tags and LocalBusiness JSON-LD.
// Usage: node scripts/validate-city-routes.mjs [baseUrl]
// Report: reports/city-routes-report.json
import fs from 'node:fs';

const BASE = process.argv[2] || process.env.CITY_VALIDATE_BASE || 'http://localhost:8080';
const CANONICAL_BASE = 'https://weddings.io';

const src = fs.readFileSync('src/lib/cityDirectory.ts', 'utf8');
const cities = [...src.matchAll(/slug: "([^"]+)", name: "([^"]+)"/g)].map((m) => ({
  slug: m[1],
  name: m[2],
}));

function pick(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}
const decode = (s) =>
  s
    ?.replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>') ?? s;

async function check(city) {
  const url = `${BASE}/cities/${city.slug}`;
  const errors = [];
  let status = 0;
  let html = '';
  try {
    const res = await fetch(url, { headers: { 'user-agent': 'weddings-io-city-validator' } });
    status = res.status;
    html = await res.text();
  } catch (e) {
    return { slug: city.slug, url, status: 0, ok: false, errors: [`fetch failed: ${e.message}`] };
  }

  if (status !== 200) errors.push(`expected 200, got ${status}`);

  const title = decode(pick(html, /<title[^>]*>([^<]*)<\/title>/i));
  const expectedTitle = `${city.name} Wedding Planner App — Exclusive Territory | Weddings.io`;
  if (title !== expectedTitle) errors.push(`title mismatch: got "${title}"`);

  const description = decode(
    pick(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i),
  );
  if (!description) errors.push('missing meta description');
  else if (!description.includes(city.name)) errors.push('description missing city name');

  const canonical = pick(html, /<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
  const expectedCanonical = `${CANONICAL_BASE}/cities/${city.slug}`;
  if (canonical !== expectedCanonical) errors.push(`canonical mismatch: got "${canonical}"`);

  const ogTitle = decode(pick(html, /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/i));
  if (!ogTitle) errors.push('missing og:title');
  const ogUrl = pick(html, /<meta[^>]+property="og:url"[^>]+content="([^"]*)"/i);
  if (ogUrl !== expectedCanonical) errors.push(`og:url mismatch: got "${ogUrl}"`);
  const twitterCard = pick(html, /<meta[^>]+name="twitter:card"[^>]+content="([^"]*)"/i);
  if (!twitterCard) errors.push('missing twitter:card');

  const hasLocalBusiness = /"@type"\s*:\s*"LocalBusiness"/.test(html);
  if (!hasLocalBusiness) errors.push('missing LocalBusiness JSON-LD');
  const hasFounding = /"foundingDate"\s*:\s*"2015-05-13"/.test(html);
  if (!hasFounding) errors.push('missing foundingDate 2015-05-13');

  return {
    slug: city.slug,
    name: city.name,
    url,
    status,
    title,
    description,
    canonical,
    ogUrl,
    twitterCard,
    hasLocalBusiness,
    ok: errors.length === 0,
    errors,
  };
}

const results = [];
const CONCURRENCY = 8;
for (let i = 0; i < cities.length; i += CONCURRENCY) {
  results.push(...(await Promise.all(cities.slice(i, i + CONCURRENCY).map(check))));
}

const failed = results.filter((r) => !r.ok);
const report = {
  generatedAt: new Date().toISOString(),
  baseUrl: BASE,
  total: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};

fs.mkdirSync('reports', { recursive: true });
fs.writeFileSync('reports/city-routes-report.json', JSON.stringify(report, null, 2));

console.log(`City route validation — ${report.passed}/${report.total} passed (${BASE})`);
for (const f of failed.slice(0, 20)) console.log(`  ✗ ${f.slug}: ${f.errors.join('; ')}`);
if (failed.length > 20) console.log(`  …and ${failed.length - 20} more`);
console.log('Report: reports/city-routes-report.json');
process.exit(failed.length ? 1 : 0);
