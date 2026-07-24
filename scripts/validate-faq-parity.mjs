#!/usr/bin/env node
/**
 * validate-faq-parity.mjs
 *
 * Ensures the FAQPage JSON-LD emitted by blog.$slug.tsx renders from
 * the SAME source-of-truth (post.faq) as the visible <dt>/<dd> block,
 * so schema questions/answers cannot drift from what a user sees.
 *
 * Structural check (both consumers must map over `post.faq`):
 *   1. head().scripts contains: post.faq.map((f) => ({ ... question: f.question, ... acceptedAnswer: { ... text: f.answer } }))
 *   2. component JSX contains: post.faq.map((f) => ( <dt>{...f.question} ... <dd>{...f.answer} ))
 *
 * Then loads src/lib/blogPosts.ts, extracts every post's faq[], and
 * asserts each Q/A is a non-empty string (guards against half-authored
 * FAQs that would emit invalid Question nodes).
 */
import fs from "node:fs";

const ROUTE = "src/routes/blog.$slug.tsx";
const POSTS = "src/lib/blogPosts.ts";
const errors = [];

const route = fs.readFileSync(ROUTE, "utf8");

// 1. Schema side maps post.faq -> Question with f.question / f.answer.
const schemaBlock = route.match(
  /"@type":\s*"FAQPage"[\s\S]{0,600}?post\.faq\.map[\s\S]{0,400}?f\.question[\s\S]{0,400}?f\.answer/
);
if (!schemaBlock) {
  errors.push(`${ROUTE}: FAQPage JSON-LD does not map post.faq -> {question, answer}`);
}

// 2. Visible section maps post.faq -> <dt>{f.question}</dt><dd>{f.answer}</dd>.
const visibleBlock = route.match(
  /post\.faq\.map[\s\S]{0,600}?<dt[\s\S]{0,200}?f\.question[\s\S]{0,300}?<dd[\s\S]{0,200}?f\.answer/
);
if (!visibleBlock) {
  errors.push(`${ROUTE}: Visible FAQ section does not render post.faq -> <dt>{f.question}</dt><dd>{f.answer}</dd>`);
}

// 3. Every post's faq[] entries must be non-empty strings.
const posts = fs.readFileSync(POSTS, "utf8");
const postRe = /\{\s*slug:\s*["'`]([^"'`]+)["'`][\s\S]*?\n\s{2}\},/g;
let m;
let audited = 0;
let withFaq = 0;
while ((m = postRe.exec(posts))) {
  const [block, slug] = [m[0], m[1]];
  audited++;
  const faqMatch = block.match(/faq:\s*\[([\s\S]*?)\n\s{4}\],?/);
  if (!faqMatch) continue;
  withFaq++;
  const qRe = /question:\s*(["'`])((?:(?!\1)[^\\]|\\.)+)\1/g;
  const aRe = /answer:\s*(["'`])((?:(?!\1)[^\\]|\\.)+)\1/g;
  const qs = [...faqMatch[1].matchAll(qRe)].map((x) => x[2].trim());
  const as = [...faqMatch[1].matchAll(aRe)].map((x) => x[2].trim());
  if (qs.length !== as.length) {
    errors.push(`${slug}: faq has ${qs.length} question(s) but ${as.length} answer(s)`);
  }
  qs.forEach((q, i) => {
    if (!q) errors.push(`${slug}: faq[${i}].question is empty`);
    if (q.length < 8) errors.push(`${slug}: faq[${i}].question suspiciously short (${q.length} chars)`);
  });
  as.forEach((a, i) => {
    if (!a) errors.push(`${slug}: faq[${i}].answer is empty`);
    if (a.length < 20) errors.push(`${slug}: faq[${i}].answer suspiciously short (${a.length} chars)`);
  });
}

if (errors.length) {
  console.error(`✗ FAQ parity failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ FAQ parity: ${audited} posts scanned, ${withFaq} with FAQ; schema and visible block share post.faq.`);
