// public/sitemap.xml generator
// Run: npx ts-node scripts/generate-sitemap.ts
// Generates sitemap for all 797 cities + all pages

import { citiesData } from '../lib/cities';
import * as fs from 'fs';
import * as path from 'path';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

async function generateSitemap() {
  const baseUrl = 'https://weddings.io';
  const today = new Date().toISOString().split('T')[0];
  const urls: SitemapUrl[] = [];

  // 1. Homepage (highest priority)
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: today,
    changefreq: 'weekly',
    priority: 1.0,
  });

  // 2. Pillar pages (guides)
  const guides = [
    { slug: 'hindu-wedding-planning', priority: 0.9 },
    { slug: 'sikh-wedding-planning', priority: 0.9 },
    { slug: 'muslim-wedding-planning', priority: 0.9 },
    { slug: 'interfaith-wedding-planning', priority: 0.9 },
  ];

  guides.forEach(guide => {
    urls.push({
      loc: `${baseUrl}/guides/${guide.slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: guide.priority,
    });
  });

  // 3. Blog/Resources
  const resources = [
    { slug: 'wedding-budget-breakdown', priority: 0.8 },
    { slug: 'wedding-timeline-guide', priority: 0.8 },
    { slug: 'top-wedding-venues-2024', priority: 0.8 },
  ];

  resources.forEach(resource => {
    urls.push({
      loc: `${baseUrl}/resources/${resource.slug}`,
      lastmod: today,
      changefreq: 'monthly',
      priority: resource.priority,
    });
  });

  // 4. All 797 city pages (largest portion)
  Object.entries(citiesData).forEach(([cityName, cityData]) => {
    urls.push({
      loc: `${baseUrl}/planners/${cityData.slug}`,
      lastmod: today,
      changefreq: 'weekly',
      priority: 0.7,
    });
  });

  // 5. City vendor pages (future - for when you have individual vendor pages)
  // For now, skip to avoid bloating sitemap

  // Generate XML
  const sitemapXml = generateSitemapXml(urls);

  // Save to public/sitemap.xml
  const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, sitemapXml);

  console.log(`✅ Sitemap generated with ${urls.length} URLs`);
  console.log(`📄 Saved to: ${sitemapPath}`);
  console.log(`🌍 Sitemap location: https://weddings.io/sitemap.xml`);

  // Also save sitemap index (for future expansion to multiple sitemaps)
  const sitemapIndexXml = generateSitemapIndex(urls.length);
  const sitemapIndexPath = path.join(process.cwd(), 'public', 'sitemap-index.xml');
  fs.writeFileSync(sitemapIndexPath, sitemapIndexXml);

  console.log(`📑 Sitemap index saved to: ${sitemapIndexPath}`);
}

function generateSitemapXml(urls: SitemapUrl[]): string {
  const xmlUrls = urls
    .map(
      url => `
  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlUrls}
</urlset>`;
}

function generateSitemapIndex(totalUrls: number): string {
  const baseUrl = 'https://weddings.io';
  const today = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case '\'':
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}

// Run
generateSitemap().catch(console.error);
