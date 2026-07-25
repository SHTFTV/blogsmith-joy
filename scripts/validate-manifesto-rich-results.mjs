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
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const REPORT_DIR = join(ROOT, ".artifacts");
const REPORT_PATH = join(REPORT_DIR, "manifesto-rich-results-report.json");
const SLUG = "ai-weddings-who-wins-when-every-app-looks-the-same";
const route = readFileSync(join(ROOT, "src/routes/blog.$slug.tsx"), "utf8");
const posts = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");

const failures = []; // { field, expected, snippet, docs }
const warn = [];
const fail = (field, expected, snippet, docs) =>
  failures.push({ field, expected, snippet: (snippet || "").slice(0, 400), docs: docs || "" });

// Extract a small context window around a pattern match (or the file head if no match)
const ctx = (source, re, span = 240) => {
  const m = source.match(re);
  if (!m) return source.slice(0, span);
  const i = source.indexOf(m[0]);
  return source.slice(Math.max(0, i - 60), i + m[0].length + span);
};

// ── 1. Post exists and carries all fields the JSON-LD reads from ──────────
const start = posts.indexOf(`slug: "${SLUG}"`);
if (start === -1) fail("post.slug", `post "${SLUG}" present in blogPosts.ts`, "", "https://schema.org/BlogPosting");
const nextSlug = posts.indexOf(`slug: "`, start + 10);
const block = start === -1 ? "" : posts.slice(start, nextSlug > 0 ? nextSlug : start + 60000);

const requiredFields = [
  ["title:", "BlogPosting.headline"],
  ["excerpt:", "BlogPosting.description"],
  ["image:", "BlogPosting.image"],
  ["date:", "BlogPosting.datePublished"],
  ["category:", "BlogPosting.articleSection"],
  ["faq:", "FAQPage.mainEntity"],
];
for (const [needle, label] of requiredFields) {
  if (!block.includes(needle)) fail(label, `field "${needle}" present on post`, block.slice(0, 240), "https://developers.google.com/search/docs/appearance/structured-data/article");
}

const faqStart = block.indexOf("faq: [");
if (faqStart === -1) {
  fail("FAQPage.faq", "faq: [ ... ] on post", block.slice(0, 240), "https://developers.google.com/search/docs/appearance/structured-data/faqpage");
} else {
  const faqSlice = block.slice(faqStart, block.indexOf("],", faqStart));
  const qCount = (faqSlice.match(/question:/g) || []).length;
  const aCount = (faqSlice.match(/answer:/g) || []).length;
  if (qCount < 2) fail("FAQPage.mainEntity", "≥2 Q&A entries", faqSlice.slice(0, 400), "https://developers.google.com/search/docs/appearance/structured-data/faqpage");
  if (qCount !== aCount) fail("FAQPage.mainEntity", `equal question/answer counts (got ${qCount}/${aCount})`, faqSlice.slice(0, 400));
}

// ── 2. Route emits BlogPosting with Google-required fields ────────────────
const bpChecks = [
  { field: "BlogPosting.@type", expected: '"@type": "BlogPosting"', re: /"@type":\s*"BlogPosting"/ },
  { field: "BlogPosting.headline", expected: "headline: post.title", re: /headline:\s*post\.title/ },
  { field: "BlogPosting.image", expected: 'image: { "@type": "ImageObject", ... }', re: /image:\s*\{[^}]*"@type":\s*"ImageObject"/ },
  { field: "BlogPosting.datePublished", expected: "datePublished: post.date", re: /datePublished:\s*post\.date/ },
  { field: "BlogPosting.author", expected: "author: [ ... ]", re: /author:\s*\[/ },
  { field: "BlogPosting.publisher", expected: "publisher: { ... }", re: /publisher:\s*\{/ },
  { field: "publisher.@type", expected: '"@type": "Organization"', re: /publisher:\s*\{[\s\S]{0,400}"@type":\s*"Organization"/ },
  { field: "publisher.name", expected: 'name: "Weddings.io Technologies"', re: /publisher:[\s\S]{0,400}name:\s*"Weddings\.io Technologies"/ },
  { field: "publisher.logo", expected: 'logo: { "@type": "ImageObject", url: ... }', re: /logo:\s*\{\s*"@type":\s*"ImageObject",\s*url:/ },
  { field: "BlogPosting.mainEntityOfPage", expected: "mainEntityOfPage: { ... }", re: /mainEntityOfPage:\s*\{/ },
];
for (const c of bpChecks) if (!c.re.test(route)) fail(c.field, c.expected, ctx(route, /jsonLd[\s\S]{0,20}=|BlogPosting/, 300), "https://developers.google.com/search/docs/appearance/structured-data/article");

// ── 3. FAQPage schema block wired to post.faq ─────────────────────────────
const faqChecks = [
  { field: "FAQPage.@type", expected: '"@type": "FAQPage"', re: /"@type":\s*"FAQPage"/ },
  { field: "FAQPage.mainEntity", expected: "mainEntity: post.faq.map(...)", re: /mainEntity:\s*post\.faq\.map/ },
  { field: "Question.@type", expected: '"@type": "Question"', re: /"@type":\s*"Question"/ },
  { field: "Question.name", expected: "name: f.question", re: /name:\s*f\.question/ },
  { field: "acceptedAnswer.@type", expected: '"@type": "Answer"', re: /acceptedAnswer:\s*\{\s*"@type":\s*"Answer"/ },
  { field: "Answer.text", expected: "text: f.answer", re: /text:\s*f\.answer/ },
];
for (const c of faqChecks) if (!c.re.test(route)) fail(c.field, c.expected, ctx(route, /FAQPage/, 300), "https://developers.google.com/search/docs/appearance/structured-data/faqpage");

// ── 4. Organization / publisher richness — Google logo guidelines ─────────
const orgChecks = [
  { field: "publisher.url", expected: 'url: "https://weddings.io"', re: /publisher:[\s\S]{0,400}url:\s*"https:\/\/weddings\.io"/ },
  { field: "publisher.logo.url", expected: 'url: "https://weddings.io/..."', re: /logo:\s*\{[\s\S]{0,200}url:\s*"https:\/\/weddings\.io\// },
  { field: "publisher.sameAs", expected: "sameAs: [ ... ]", re: /publisher:[\s\S]{0,600}sameAs:\s*\[/ },
];
for (const c of orgChecks) if (!c.re.test(route)) fail(c.field, c.expected, ctx(route, /publisher:\s*\{/, 500), "https://developers.google.com/search/docs/appearance/structured-data/logo");

if (!/author:\s*\[[\s\S]{0,800}"@type":\s*"Person"/.test(route)) {
  fail("author[].Person", '"@type": "Person" entry inside author[]', ctx(route, /author:\s*\[/, 400), "https://developers.google.com/search/docs/appearance/structured-data/article");
}

// ── 5. BreadcrumbList sanity ──────────────────────────────────────────────
if (!/"@type":\s*"BreadcrumbList"/.test(route)) {
  fail("BreadcrumbList.@type", '"@type": "BreadcrumbList"', ctx(route, /Breadcrumb/, 300), "https://developers.google.com/search/docs/appearance/structured-data/breadcrumb");
}
if (!/position:\s*3,\s*name:\s*post\.title/.test(route)) {
  fail("BreadcrumbList.itemListElement[3].name", "position: 3, name: post.title", ctx(route, /BreadcrumbList/, 500));
}

// ── 6. google-site-verification meta tag lives in __root.tsx ──────────────
const root = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
if (!/name:\s*"google-site-verification",\s*content:\s*"[A-Za-z0-9_-]{20,}"/.test(root)) {
  warn.push("google-site-verification meta tag missing in __root.tsx (GSC verification will fail)");
}

// ── Report (JSON artifact + stdout) ───────────────────────────────────────
mkdirSync(REPORT_DIR, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  slug: SLUG,
  ok: failures.length === 0,
  failureCount: failures.length,
  warningCount: warn.length,
  failures,
  warnings: warn,
};
writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

if (warn.length) {
  console.warn(`\n⚠ warnings (${warn.length}):`);
  for (const w of warn) console.warn(`  - ${w}`);
}
if (failures.length) {
  console.error(`\n✗ manifesto rich-results validation failed (${failures.length}):`);
  for (const f of failures) {
    console.error(`\n  ✗ ${f.field}`);
    console.error(`      expected : ${f.expected}`);
    if (f.docs) console.error(`      docs     : ${f.docs}`);
    if (f.snippet) {
      const preview = f.snippet.split("\n").slice(0, 6).map((l) => `        │ ${l}`).join("\n");
      console.error(`      snippet  :\n${preview}`);
    }
  }
  console.error(`\n  ↳ full JSON report: ${REPORT_PATH.replace(ROOT + "/", "")}`);
  process.exit(1);
}
console.log(`✓ Manifesto rich-results eligible: BlogPosting + FAQPage + Organization publisher + BreadcrumbList all valid.`);
console.log(`  ↳ report: ${REPORT_PATH.replace(ROOT + "/", "")}`);

