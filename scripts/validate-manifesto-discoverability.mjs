#!/usr/bin/env node
/**
 * Manifesto discoverability validator.
 * Fails CI if:
 *   - public/sitemap.xml is missing the manifesto URL
 *   - public/sitemap.xml is missing key internal-link targets used from the manifesto
 *     (PPP explainer, ecosystem directory, checklists)
 *   - public/robots.txt does not advertise sitemap.xml
 *   - public/robots.txt Disallows the manifesto path or /blog/
 *
 * Also enforces the hero-image performance budget (LCP-friendly):
 *   - each responsive variant stays under its per-format KB cap
 *   - AVIF + WebP + JPG variants all exist at 800w / 1200w / 1600w
 *   - og:image references the crawler-safe JPG (not AVIF/WebP)
 */
import { readFileSync, existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const MANIFESTO_PATH = "/blog/ai-weddings-who-wins-when-every-app-looks-the-same/";
const INTERNAL_TARGETS = [
  "/ecosystem/",
  "/blog/ppp-pricing-wedding-platform-industry-first/",
  "/blog/ultimate-south-asian-wedding-checklist-2025/",
];

const HERO_BASENAME = "ai-weddings-who-wins";
// Per-format KB budgets (largest allowed at 1600w).
const IMAGE_BUDGETS = {
  avif: { "800w": 25, "1200w": 40, "1600w": 60 },
  webp: { "800w": 30, "1200w": 55, "1600w": 80 },
  jpg:  { "800w": 60, "1200w": 100, "1600w": 140 },
};

const errors = [];
const warns = [];
const fail = (m) => errors.push(m);
const warn = (m) => warns.push(m);

// --- sitemap ---
const sitemapPath = join(ROOT, "public/sitemap.xml");
if (!existsSync(sitemapPath)) {
  fail("public/sitemap.xml is missing");
} else {
  const xml = readFileSync(sitemapPath, "utf8");
  if (!xml.includes(MANIFESTO_PATH)) {
    fail(`sitemap.xml missing manifesto URL: ${MANIFESTO_PATH}`);
  }
  for (const target of INTERNAL_TARGETS) {
    if (!xml.includes(target)) {
      fail(`sitemap.xml missing internal target linked from manifesto: ${target}`);
    }
  }
}

// --- robots.txt ---
const robotsPath = join(ROOT, "public/robots.txt");
if (!existsSync(robotsPath)) {
  fail("public/robots.txt is missing");
} else {
  const robots = readFileSync(robotsPath, "utf8");
  if (!/^Sitemap:\s*https?:\/\/\S+sitemap\.xml/mi.test(robots)) {
    fail("robots.txt does not advertise sitemap.xml via a Sitemap: directive");
  }
  // Reject Disallow rules that would block the manifesto or /blog/.
  const disallows = [...robots.matchAll(/^Disallow:\s*(\S+)/gmi)].map((m) => m[1]);
  for (const rule of disallows) {
    if (rule === "/" || rule === "/blog" || rule === "/blog/" || MANIFESTO_PATH.startsWith(rule) && rule.length > 1 && !["/auth/","/admin/","/dashboard","/vendor/dashboard","/checkout/","/billing"].includes(rule)) {
      fail(`robots.txt Disallow: ${rule} would block the manifesto post`);
    }
  }
}

// --- hero image budget + format coverage ---
const imgDir = join(ROOT, "public/blog-images");
for (const [fmt, budgets] of Object.entries(IMAGE_BUDGETS)) {
  for (const [w, kb] of Object.entries(budgets)) {
    const file = join(imgDir, `${HERO_BASENAME}-${w}.${fmt}`);
    if (!existsSync(file)) {
      fail(`missing hero variant: ${HERO_BASENAME}-${w}.${fmt}`);
      continue;
    }
    const sizeKb = statSync(file).size / 1024;
    if (sizeKb > kb) {
      fail(`hero variant over budget: ${HERO_BASENAME}-${w}.${fmt} = ${sizeKb.toFixed(1)}KB > ${kb}KB`);
    } else if (sizeKb > kb * 0.9) {
      warn(`hero variant near budget: ${HERO_BASENAME}-${w}.${fmt} = ${sizeKb.toFixed(1)}KB (limit ${kb}KB)`);
    }
  }
}

// --- og:image is crawler-safe JPG ---
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");
const ogImageWiring = /property:\s*"og:image".*absoluteImage/s.test(route)
  && /const image = post\?\.image \?\?/.test(route);
if (!ogImageWiring) {
  fail("blog.$slug.tsx og:image no longer sourced from post.image (crawler-safe JPG). AVIF/WebP must NOT be used for og:image.");
}

// --- report ---
const label = (arr, kind) => arr.length ? `\n${kind}:\n  - ${arr.join("\n  - ")}` : "";
if (errors.length) {
  console.error(`✗ Manifesto discoverability FAILED${label(errors, "Errors")}${label(warns, "Warnings")}`);
  process.exit(1);
}
console.log(`✓ Manifesto discoverability OK (sitemap + robots + hero budget + og:image)${label(warns, "Warnings")}`);
