#!/usr/bin/env node
/**
 * Structured-data diff.
 *
 * Extracts every JSON-LD block from src/routes/**.tsx and public/**\/*.html,
 * indexes @id / url values, and reports:
 *   - IDs referenced (isPartOf, publisher, about, parentOrganization) but
 *     never defined anywhere in the project.
 *   - Same @id defined with conflicting @type or url values across pages.
 *   - Homepage-declared IDs (Corporation/WebSite/WebPage/agency) that don't
 *     match how child pages reference them.
 *
 * Non-zero exit on any drift.
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

const walk = (dir, exts, out = []) => {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
};

const files = [
  ...walk(join(ROOT, "src/routes"), [".tsx", ".ts"]),
  ...walk(join(ROOT, "public"), [".html"]),
];

const extractFromSource = (src) => {
  const blocks = [];
  const re = /JSON\.stringify\(\s*(\{[\s\S]*?\})\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const raw = m[1];
    if (!raw.includes("schema.org")) continue;
    try {
      // eslint-disable-next-line no-new-func
      blocks.push(new Function(`return (${raw});`)());
    } catch {
      /* dynamic — skip */
    }
  }
  return blocks;
};

const extractFromHtml = (src) => {
  const blocks = [];
  const re = /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g;
  let m;
  while ((m = re.exec(src))) {
    try {
      blocks.push(JSON.parse(m[1].trim()));
    } catch {
      /* skip */
    }
  }
  return blocks;
};

/** Map of @id → { type, url, sources: Set<file> } */
const defined = new Map();
/** Map of @id → Set<file that references it> */
const referenced = new Map();

const record = (file, node) => {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) return node.forEach((n) => record(file, n));
  if (Array.isArray(node["@graph"])) return node["@graph"].forEach((n) => record(file, n));

  const id = node["@id"];
  if (typeof id === "string") {
    const t = Array.isArray(node["@type"]) ? node["@type"][0] : node["@type"];
    const prev = defined.get(id);
    if (prev) {
      const equivalent = (a, b) => {
        if (a === b) return true;
        const articleFamily = new Set(["Article", "BlogPosting", "NewsArticle", "TechArticle"]);
        return articleFamily.has(a) && articleFamily.has(b);
      };
      if (t && prev.type && !equivalent(prev.type, t)) {
        prev.conflicts.push(`type mismatch (${prev.type} vs ${t}) in ${relative(ROOT, file)}`);
      }
      if (node.url && prev.url && node.url !== prev.url) {
        prev.conflicts.push(`url mismatch (${prev.url} vs ${node.url}) in ${relative(ROOT, file)}`);
      }

      prev.sources.add(relative(ROOT, file));
    } else {
      defined.set(id, {
        type: t,
        url: node.url,
        sources: new Set([relative(ROOT, file)]),
        conflicts: [],
      });
    }
  }
  // Collect references
  for (const [k, v] of Object.entries(node)) {
    if (k === "@id" || k === "@type" || k === "@context") continue;
    if (v && typeof v === "object" && !Array.isArray(v) && typeof v["@id"] === "string" && !v["@type"]) {
      if (!referenced.has(v["@id"])) referenced.set(v["@id"], new Set());
      referenced.get(v["@id"]).add(relative(ROOT, file));
    }
    if (v && typeof v === "object") record(file, v);
  }
};

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const blocks = extname(file) === ".html" ? extractFromHtml(src) : extractFromSource(src);
  for (const b of blocks) record(file, b);
}

const problems = [];

for (const [id, meta] of defined) {
  problems.push(...meta.conflicts.map((c) => `${id}: ${c}`));
}

for (const [id, srcs] of referenced) {
  if (!defined.has(id) && id.startsWith("https://weddings.io/#")) {
    problems.push(`Reference to undefined @id ${id} (used by ${[...srcs].join(", ")})`);
  }
}

// Homepage anchor check.
const homepageRel = "src/routes/index.tsx";
const homepageIds = [...defined.entries()]
  .filter(([, m]) => m.sources.has(homepageRel))
  .map(([id]) => id);
const expected = [
  "https://weddings.io/#website",
  "https://weddings.io/#organization",
  "https://industryarmy.com/#organization",
];
for (const id of expected) {
  if (!homepageIds.includes(id)) {
    problems.push(`Homepage missing expected @id ${id}`);
  }
}

if (problems.length) {
  console.error(`\n✗ Structured-data diff failed (${problems.length}):`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

console.log(
  `✓ Structured-data diff passed — ${defined.size} unique @id definitions, ${referenced.size} reference targets, all resolve`,
);
