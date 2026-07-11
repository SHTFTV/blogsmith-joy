/**
 * Backfill focusKeywords for any blog post missing them.
 *
 * Strategy (deterministic, no LLM):
 *   1. Start with the post's category (single string).
 *   2. Extract keyword-worthy n-grams (1-3 words) from title + subtitle + excerpt + body,
 *      dropping a curated stopword list and requiring word chars only.
 *   3. Rank by frequency; keep the top 5 unique multi-word phrases.
 *   4. Merge with the category and any manually-set focusKeywords.
 *
 * Edits src/lib/blogPosts.ts in place. Dry-run by default; pass --write to apply.
 *
 * Run:
 *   bun run scripts/backfill-focus-keywords.ts           # dry run
 *   bun run scripts/backfill-focus-keywords.ts --write   # apply changes
 */
import { readFileSync, writeFileSync } from "node:fs";
import { blogPosts, type BlogPost } from "../src/lib/blogPosts";

const write = process.argv.includes("--write");
const FILE = "src/lib/blogPosts.ts";

const STOPWORDS = new Set([
  "the","a","an","and","or","but","for","to","of","in","on","at","by","with","from","as","is","are","was","were","be","been","being","this","that","these","those","it","its","if","then","than","so","not","no","yes","you","your","we","our","us","i","me","my","they","them","their","he","she","his","her","how","what","when","where","why","who","which","will","can","should","would","could","may","might","do","does","did","done","just","also","more","most","some","any","all","one","two","three","first","second","third","new","old","up","down","out","over","under","about","into","before","after","between","without","within","across","per","via","vs","use","using","used","get","got","make","made","makes","see","seen","seeing","every","each","many","much","few","other","another","same","only","own","because","while","until","during","against","among","around","above","below","among","include","including","includes","included","content","article","post","blog","weddings","wedding","io","com","tv","2024","2025","2026","complete","guide","full","top","best","essential","key","real","true","great","big","small","early","late","yet","still","already","between","across"
]);

const WORD = /[a-z][a-z0-9-]*/gi;

function tokens(str: string): string[] {
  return (str.toLowerCase().match(WORD) ?? []).filter((w) => w.length >= 3 && !STOPWORDS.has(w));
}

function ngrams(words: string[], n: number): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= words.length; i++) out.push(words.slice(i, i + n).join(" "));
  return out;
}

function deriveKeywords(post: BlogPost): string[] {
  const text = [
    post.title,
    post.subtitle,
    post.excerpt,
    ...(post.body ?? []),
  ].filter(Boolean).join("  ");

  const words = tokens(text);
  const grams = [...ngrams(words, 3), ...ngrams(words, 2), ...words];

  const freq = new Map<string, number>();
  for (const g of grams) {
    // Skip n-grams whose first or last token is a stopword-ish tail
    const parts = g.split(" ");
    if (parts.every((p) => STOPWORDS.has(p))) continue;
    freq.set(g, (freq.get(g) ?? 0) + (parts.length === 3 ? 3 : parts.length === 2 ? 2 : 1));
  }

  // Prefer 2-3 word phrases over single tokens
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .map(([g]) => g);

  const picked: string[] = [];
  const seenRoot = new Set<string>();
  for (const g of ranked) {
    // dedupe: skip if a longer phrase we already picked contains this one
    if (picked.some((p) => p.includes(g))) continue;
    // titlecase for meta keywords
    const title = g.replace(/\b[a-z]/g, (c) => c.toUpperCase());
    const key = title.toLowerCase();
    if (seenRoot.has(key)) continue;
    seenRoot.add(key);
    picked.push(title);
    if (picked.length >= 5) break;
  }

  const withCategory = post.category ? [post.category, ...picked.filter((k) => k.toLowerCase() !== post.category.toLowerCase())] : picked;
  return withCategory.slice(0, 6);
}

// ─── Report ────────────────────────────────────────────────────────
const missing = blogPosts.filter((p) => !p.focusKeywords || p.focusKeywords.length === 0);

console.log(`Posts total: ${blogPosts.length}`);
console.log(`Missing focusKeywords: ${missing.length}${missing.length === 0 ? "  ✓" : ""}`);

if (missing.length === 0) process.exit(0);

const suggestions = missing.map((p) => ({ slug: p.slug, keywords: deriveKeywords(p) }));
for (const s of suggestions) console.log(`  • ${s.slug}\n      → ${s.keywords.join(", ")}`);

if (!write) {
  console.log(`\nDry run. Re-run with --write to patch ${FILE}.`);
  process.exit(0);
}

// ─── Write patches ─────────────────────────────────────────────────
let src = readFileSync(FILE, "utf8");
let patched = 0;

for (const { slug, keywords } of suggestions) {
  // Find the object literal for this slug and insert focusKeywords as the last property.
  // Match: `slug: "<slug>"` ... up to the closing `  },` at 2-space indent (end of object).
  const slugRe = new RegExp(
    `(slug:\\s*"${slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[\\s\\S]*?)(\\n(\\s+)[^\\n]+\\n)(  \\},)`,
    "m",
  );
  const match = src.match(slugRe);
  if (!match) {
    console.warn(`  ! could not locate insertion point for ${slug} — skipping`);
    continue;
  }
  const lastPropBlock = match[2]; // "\n    prop: value\n" or "\n    prop: value,\n"
  const indent = match[3];
  // Ensure the previous last property ends with a comma before we append focusKeywords
  const withComma = /,\s*\n$/.test(lastPropBlock)
    ? lastPropBlock
    : lastPropBlock.replace(/(\n)$/, ",\n");
  const kwLine = `${indent}focusKeywords: ${JSON.stringify(keywords)},\n`;
  src = src.replace(slugRe, `$1${withComma}${kwLine}  },`);
  patched += 1;
}

writeFileSync(FILE, src, "utf8");
console.log(`\nPatched ${patched} post(s) in ${FILE}.`);
