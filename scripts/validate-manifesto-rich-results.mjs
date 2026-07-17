#!/usr/bin/env node
/**
 * Rich-results eligibility check for the "AI weddings: who wins" manifesto post.
 * Verifies the JSON-LD graph the route emits keeps FAQPage + Organization/Publisher
 * eligible for Google rich results and the BlogPosting Article schema stays valid.
 *
 * Runs offline against src/routes/blog.$slug.tsx + src/lib/blogPosts.ts — no network.
 * Exits non-zero on any missing required field per schema.org / Google rich-results docs:
 *   https://developers.google.com/search/docs/appearance/structured-data/faqpage
 *   https://developers.google.com/search/docs/appearance/structured-data/article
 *   https://developers.google.com/search/docs/appearance/structured-data/logo
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");
const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");

const errors = [];
const warn = [];
const fail = (m) => errors.push(m);

// ── 1. Post exists and carries all fields the JSON-LD reads from ──────────
const start = posts.indexOf(`slug: "${SLUG}"`);
if (start === -1) fail(`post "${SLUG}" not found in blogPosts.ts`);
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);

const requiredFields = [
  ["title:", "BlogPosting.headline"],
  ["excerpt:", "BlogPosting.description"],
  ["image:", "BlogPosting.image"],
  ["date:", "BlogPosting.datePublished"],
  ["category:", "BlogPosting.articleSection"],
  ["faq:", "FAQPage.mainEntity"],
];
for (const [needle, label] of requiredFields) {
  if (!block.includes(needle)) fail(`${SLUG} missing ${needle} (feeds ${label})`);
}

// FAQ must have >= 2 questions, each with question + answer strings.
const faqStart = block.indexOf("faq: [");
if (faqStart === -1) fail(`${SLUG} FAQPage: no faq array`);
else {
  const faqSlice = block.slice(faqStart, block.indexOf("],", faqStart));
  const qCount = (faqSlice.match(/question:/g) || []).length;
  const aCount = (faqSlice.match(/answer:/g) || []).length;
  if (qCount < 2) fail(`FAQPage requires ≥2 Q&A entries (found ${qCount})`);
  if (qCount !== aCount) fail(`FAQPage: ${qCount} questions vs ${aCount} answers`);
}

// ── 2. Route emits BlogPosting with Google-required fields ────────────────
const bpChecks = [
  { name: 'BlogPosting @type', re: /"@type":\s*"BlogPosting"/ },
  { name: "BlogPosting.headline", re: /headline:\s*post\.title/ },
  { name: "BlogPosting.image (ImageObject)", re: /image:\s*\{[^}]*"@type":\s*"ImageObject"/ },
  { name: "BlogPosting.datePublished", re: /datePublished:\s*post\.date/ },
  { name: "BlogPosting.author", re: /author:\s*\[/ },
  { name: "BlogPosting.publisher", re: /publisher:\s*\{/ },
  { name: "publisher Organization @type", re: /publisher:\s*\{[\s\S]{0,400}"@type":\s*"Organization"/ },
  { name: "publisher.name", re: /publisher:[\s\S]{0,400}name:\s*"Weddings\.io Technologies"/ },
  { name: "publisher.logo ImageObject", re: /logo:\s*\{\s*"@type":\s*"ImageObject",\s*url:/ },
  { name: "mainEntityOfPage", re: /mainEntityOfPage:\s*\{/ },
];
for (const c of bpChecks) if (!c.re.test(route)) fail(`route missing ${c.name}`);

// ── 3. FAQPage schema block wired to post.faq ─────────────────────────────
const faqChecks = [
  { name: "FAQPage @type", re: /"@type":\s*"FAQPage"/ },
  { name: "FAQPage mainEntity map", re: /mainEntity:\s*post\.faq\.map/ },
  { name: "Question @type", re: /"@type":\s*"Question"/ },
  { name: "Question.name from FAQ question", re: /name:\s*f\.question/ },
  { name: "acceptedAnswer Answer @type", re: /acceptedAnswer:\s*\{\s*"@type":\s*"Answer"/ },
  { name: "Answer.text from FAQ answer", re: /text:\s*f\.answer/ },
];
for (const c of faqChecks) if (!c.re.test(route)) fail(`FAQPage missing ${c.name}`);

// ── 4. Organization / publisher richness — Google logo guidelines ─────────
const orgChecks = [
  { name: "publisher.url absolute", re: /publisher:[\s\S]{0,400}url:\s*"https:\/\/weddings\.io"/ },
  { name: "publisher.logo absolute https URL", re: /logo:\s*\{[\s\S]{0,200}url:\s*"https:\/\/weddings\.io\// },
  { name: "publisher.sameAs (E-E-A-T)", re: /publisher:[\s\S]{0,600}sameAs:\s*\[/ },
];
for (const c of orgChecks) if (!c.re.test(route)) fail(`Organization/publisher missing ${c.name}`);

// author[] should include Person (E-E-A-T) plus Organization
if (!/author:\s*\[[\s\S]{0,800}"@type":\s*"Person"/.test(route)) {
  fail("author[] missing Person entry (weakens E-E-A-T)");
}

// ── 5. BreadcrumbList sanity ──────────────────────────────────────────────
if (!/"@type":\s*"BreadcrumbList"/.test(route)) fail("BreadcrumbList schema missing");
if (!/position:\s*3,\s*name:\s*post\.title/.test(route)) {
  fail("BreadcrumbList last item does not use post.title");
}

// ── 6. google-site-verification meta tag lives in __root.tsx ──────────────
const root = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
if (!/name:\s*"google-site-verification",\s*content:\s*"[A-Za-z0-9_-]{20,}"/.test(root)) {
  warn.push("google-site-verification meta tag missing in __root.tsx (GSC verification will fail)");
}

// ── Report ────────────────────────────────────────────────────────────────
if (warn.length) {
  console.warn(`\n⚠ warnings (${warn.length}):`);
  for (const w of warn) console.warn(`  - ${w}`);
}
if (errors.length) {
  console.error(`\n✗ manifesto rich-results validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ Manifesto rich-results eligible: BlogPosting + FAQPage + Organization publisher + BreadcrumbList all valid.`);
