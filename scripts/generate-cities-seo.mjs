// Adds 301 redirects from the legacy static /cities/*.html URLs to the /cities/$slug routes,
// and regenerates public/sitemap-cities.xml + the sitemap index entry.
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'https://weddings.io';
const today = new Date().toISOString().slice(0, 10);

const src = fs.readFileSync('src/lib/cityDirectory.ts', 'utf8');
const slugs = [...src.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
if (slugs.length === 0) throw new Error('No city slugs found in src/lib/cityDirectory.ts');

// ---- 1. _redirects -------------------------------------------------------
const MARK_START = '# BEGIN cities-html-redirects (generated)';
const MARK_END = '# END cities-html-redirects';
const redirectLines = [
  MARK_START,
  ...slugs.flatMap((s) => [
    `/cities/${s}.html    /cities/${s}    301!`,
    `/cities/${s}/index.html    /cities/${s}    301!`,
  ]),
  '/cities/index.html    /cities    301!',
  MARK_END,
].join('\n');

const redirectsPath = 'public/_redirects';
let redirects = fs.existsSync(redirectsPath) ? fs.readFileSync(redirectsPath, 'utf8') : '';
const blockRe = new RegExp(`${MARK_START}[\\s\\S]*?${MARK_END}`);
redirects = blockRe.test(redirects)
  ? redirects.replace(blockRe, redirectLines)
  : `${redirects.trimEnd()}\n\n${redirectLines}\n`;
fs.writeFileSync(redirectsPath, redirects.endsWith('\n') ? redirects : `${redirects}\n`);

// ---- 2. sitemap-cities.xml ----------------------------------------------
const urls = [
  { loc: `${BASE}/cities`, priority: '0.8' },
  ...slugs.map((s) => ({ loc: `${BASE}/cities/${s}`, priority: '0.8' })),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`;

const targets = ['public'];
if (fs.existsSync('dist/client')) targets.push('dist/client');
for (const dir of targets) {
  fs.writeFileSync(path.join(dir, 'sitemap-cities.xml'), xml);

  // ---- 3. sitemap-index.xml ----
  const idxPath = path.join(dir, 'sitemap-index.xml');
  if (fs.existsSync(idxPath)) {
    let idx = fs.readFileSync(idxPath, 'utf8');
    const entry = `  <sitemap>\n    <loc>${BASE}/sitemap-cities.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>`;
    idx = idx.replace(
      /\s*<sitemap>\s*<loc>[^<]*sitemap-cities\.xml<\/loc>[\s\S]*?<\/sitemap>/,
      '',
    );
    idx = idx.replace('</sitemapindex>', `${entry}\n</sitemapindex>`);
    fs.writeFileSync(idxPath, idx);
  }

  // ---- 4. robots.txt ----
  const robotsPath = path.join(dir, 'robots.txt');
  if (fs.existsSync(robotsPath)) {
    let robots = fs.readFileSync(robotsPath, 'utf8');
    if (!robots.includes('sitemap-cities.xml')) {
      robots = robots.replace(
        'Sitemap: https://weddings.io/sitemap-images.xml',
        'Sitemap: https://weddings.io/sitemap-images.xml\nSitemap: https://weddings.io/sitemap-cities.xml',
      );
      fs.writeFileSync(robotsPath, robots);
    }
  }
}

console.log(
  `cities: ${slugs.length} slugs → ${slugs.length * 2 + 1} redirects, sitemap-cities.xml (${urls.length} urls), index + robots updated.`,
);
