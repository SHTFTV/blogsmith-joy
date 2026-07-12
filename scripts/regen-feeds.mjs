// Regenerate sitemap.xml + rss.xml from src/lib/blogPosts.ts
// Blog URLs use trailing slashes to match Netlify's canonical /blog/<slug>/ form.
import { blogPosts, allCategories, allTags } from '../src/lib/blogPosts.ts';
import fs from 'fs';

const BASE = 'https://weddings.io';

// Standalone static blog posts under public/blog/ that don't live in blogPosts.ts.
// Keep this in sync when new static HTML posts are added.
const extraStaticBlogPosts = [
  {
    slug: 'transparent-territory-pricing-weddings-io',
    date: '2026-07-12',
    title: 'Transparent Territory Pricing: The Weddings.io Bracket Model',
    seoTitle: 'Transparent Territory Pricing: The Weddings.io Bracket Model | Weddings.io',
    category: 'Pricing',
    excerpt: 'Every territory bracket, published. Flat $10 per 100K population up to $290/mo at 29M+. No sales calls, no hidden tiers.',
    metaDescription: 'Weddings.io publishes every territory price bracket — a flat $10 per 100K population, up to $290/mo at 29M+. No sales calls, no hidden tiers.',
  },
];

const sorted = [...blogPosts, ...extraStaticBlogPosts].sort((a, b) => b.date.localeCompare(a.date));

const staticRoutes = [
  { loc: '/',                priority: '1.0', changefreq: 'weekly' },
  { loc: '/about',           priority: '0.7', changefreq: 'monthly' },
  { loc: '/blog/',           priority: '0.9', changefreq: 'daily' },
  { loc: '/blog/topics/',    priority: '0.7', changefreq: 'weekly' },
  { loc: '/vendors',         priority: '0.8', changefreq: 'weekly' },
  { loc: '/eyespyr',         priority: '0.8', changefreq: 'monthly' },
  { loc: '/ecosystem/',      priority: '0.8', changefreq: 'monthly' },
];

const topicRoutes = [
  ...allCategories.map((c) => ({ loc: `/blog/category/${c.slug}/`, priority: '0.7', changefreq: 'weekly' })),
  ...allTags.map((t) => ({ loc: `/blog/tag/${t.slug}/`, priority: '0.6', changefreq: 'weekly' })),
];

const today = new Date().toISOString().slice(0, 10);
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticRoutes, ...topicRoutes].map((r) => `  <url>
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
  if (!fs.existsSync(dir)) continue;
  fs.writeFileSync(`${dir}/sitemap.xml`, sitemap);
  fs.writeFileSync(`${dir}/rss.xml`, rss);
}

console.log(`Wrote ${sorted.length} posts + ${staticRoutes.length} static routes (trailing-slash blog URLs)`);
