#!/usr/bin/env node
/**
 * Diff the currently generated JSON-LD graph for every visible blog post
 * against the last successful CI baseline. Writes a per-slug diff report
 * and prints a summary. Non-fatal by default (informational); pass --strict
 * to fail the build on any diff.
 *
 * Baseline lives at .artifacts/jsonld-baseline/<slug>.json — committed from
 * the last green CI run. Refresh with `--update` when a schema change is
 * intentional (bumps the baseline in-place).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BASELINE_DIR = join(ROOT, ".artifacts/jsonld-baseline");
const REPORT_PATH = join(ROOT, ".artifacts/jsonld-diff-report.json");
const STRICT = process.argv.includes("--strict");
const UPDATE = process.argv.includes("--update");
mkdirSync(BASELINE_DIR, { recursive: true });

const src = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");

// Extract visible slugs
const visibleMatch = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
const visible = visibleMatch
  ? [...visibleMatch[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map((m) => m[1])
  : [];

// Extract minimal per-post fields (offline, regex-based)
function extractPost(slug) {
  const start = src.indexOf(`slug: "${slug}"`);
  if (start === -1) return null;
  const nextSlug = src.indexOf(`slug: "`, start + 10);
  const block = src.slice(start, nextSlug > 0 ? nextSlug : start + 80000);
  const pick = (k) => {
    const m = block.match(new RegExp(`${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
    return m ? m[1] : undefined;
  };
  const faqStart = block.indexOf("faq: [");
  const faqCount = faqStart === -1 ? 0 : (block.slice(faqStart, block.indexOf("],", faqStart)).match(/question:/g) || []).length;
  return {
    slug,
    title: pick("title"),
    excerpt: pick("excerpt"),
    image: pick("image") ?? "(dynamic)",
    date: pick("date"),
    category: pick("category"),
    faqCount,
  };
}

function buildGraph(p) {
  const url = `https://weddings.io/blog/${p.slug}/`;
  return {
    article: {
      "@type": "BlogPosting",
      "@id": `${url}#blogposting`,
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      articleSection: p.category,
      url,
    },
    faqCount: p.faqCount,
    breadcrumbTail: p.title,
  };
}

// Deep field-level diff (returns array of {path, before, after})
function diff(before, after, path = "") {
  const out = [];
  const keys = new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})]);
  for (const k of keys) {
    const p = path ? `${path}.${k}` : k;
    const b = before?.[k], a = after?.[k];
    if (b && a && typeof b === "object" && typeof a === "object" && !Array.isArray(b)) {
      out.push(...diff(b, a, p));
    } else if (JSON.stringify(b) !== JSON.stringify(a)) {
      out.push({ path: p, before: b ?? null, after: a ?? null });
    }
  }
  return out;
}

const summary = { generatedAt: new Date().toISOString(), slugs: [] };
let totalDiffs = 0, newBaselines = 0;

for (const slug of visible) {
  const post = extractPost(slug);
  if (!post) continue;
  const current = buildGraph(post);
  const baselinePath = join(BASELINE_DIR, `${slug}.json`);
  const hasBaseline = existsSync(baselinePath);
  const baseline = hasBaseline ? JSON.parse(readFileSync(baselinePath, "utf8")) : null;

  if (!hasBaseline || UPDATE) {
    writeFileSync(baselinePath, JSON.stringify(current, null, 2));
    newBaselines++;
    summary.slugs.push({ slug, status: hasBaseline ? "updated" : "seeded", diffs: [] });
    continue;
  }

  const diffs = diff(baseline, current);
  totalDiffs += diffs.length;
  summary.slugs.push({ slug, status: diffs.length ? "changed" : "unchanged", diffs });
}

writeFileSync(REPORT_PATH, JSON.stringify(summary, null, 2));

const changed = summary.slugs.filter((s) => s.status === "changed");
console.log(`\nJSON-LD diff vs baseline:`);
console.log(`  posts checked : ${visible.length}`);
console.log(`  seeded/updated: ${newBaselines}`);
console.log(`  changed       : ${changed.length}`);
console.log(`  total diffs   : ${totalDiffs}`);
console.log(`  ↳ ${REPORT_PATH.replace(ROOT + "/", "")}`);

if (changed.length) {
  console.log(`\nChanged posts:`);
  for (const s of changed.slice(0, 20)) {
    console.log(`  • ${s.slug} (${s.diffs.length} field${s.diffs.length === 1 ? "" : "s"})`);
    for (const d of s.diffs.slice(0, 5)) {
      const b = JSON.stringify(d.before)?.slice(0, 60);
      const a = JSON.stringify(d.after)?.slice(0, 60);
      console.log(`      ${d.path}: ${b} → ${a}`);
    }
  }
}

if (STRICT && changed.length) {
  console.error(`\n✗ JSON-LD drift detected (--strict). Run with --update to accept.`);
  process.exit(1);
}
// Remove stale baselines for deleted posts (info only)
const known = new Set(visible.map((s) => `${s}.json`));
for (const f of readdirSync(BASELINE_DIR)) {
  if (f.endsWith(".json") && !known.has(f)) {
    console.log(`  (stale baseline: ${f})`);
  }
}
