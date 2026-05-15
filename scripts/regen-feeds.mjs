// Regenerate sitemap.xml + rss.xml from src/lib/blogPosts.ts
// Blog URLs use trailing slashes to match Netlify's canonical /blog/<slug>/ form.
import { blogPosts } from '../src/lib/blogPosts.ts';
import fs from 'fs';

const BASE = 'https://weddings.io';
const sorted = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date));

const staticRoutes = [
  { loc: '/',           priority: '1.0', changefreq: 'weekly' },
  { loc: '/about',      priority: '0.7', changefreq: 'monthly' },
  { loc: '/blog/',      priority: '0.9', changefreq: 'daily' },
  { loc: '/vendors',    priority: '0.8', changefreq: 'weekly' },
  { loc: '/eyespyr',    priority: '0.8', changefreq: 'monthly' },
  { loc: '/ecosystem/', priority: '0.8', changefreq: 'monthly' },
];

const today = new Date().toISOString().slice(0, 10);
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticRoutes.map((r) => `  <url>
    <loc>${BASE}${r.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`).join('\n')}
${sorted.map((p) => `  <url>
    <loc>${BASE}/blog/${p.slug}/</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}
</urlset>
`;

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Weddings.io Blog</title>
    <link>${BASE}/blog/</link>
    <description>South Asian wedding planning, vendor intelligence, and AI verification — from Weddings.io.</description>
    <language>en-us</language>
    <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${sorted.map((p) => `    <item>
      <title>${escape(p.seoTitle || p.title)}</title>
      <link>${BASE}/blog/${p.slug}/</link>
      <guid isPermaLink="true">${BASE}/blog/${p.slug}/</guid>
      <pubDate>${new Date(p.date + 'T12:00:00Z').toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <description>${escape(p.metaDescription || p.excerpt)}</description>
    </item>`).join('\n')}
  </channel>
</rss>
`;

for (const dir of ['public', 'public/weddings-io-deploy']) {
  fs.writeFileSync(`${dir}/sitemap.xml`, sitemap);
  fs.writeFileSync(`${dir}/rss.xml`, rss);
}

console.log(`Wrote ${sorted.length} posts + ${staticRoutes.length} static routes (trailing-slash blog URLs)`);
