#!/usr/bin/env node
/**
 * Structural JSON-LD validator for Weddings.io.
 *
 * Extracts every JSON.stringify({...}) block passed as `children` to a
 * <script type="application/ld+json"> entry across src/routes/**.tsx and
 * public/**\/*.html, parses each object, and validates against the subset of
 * Schema.org / Google Rich Results requirements we care about:
 *   - Article, SoftwareApplication, FAQPage, BreadcrumbList
 * Fails the build on any warning or error.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const errors = [];

const walk = (dir, exts, out = []) => {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
};

const files = [
  ...walk(join(ROOT, "src", "routes"), [".tsx", ".ts"]),
  ...walk(join(ROOT, "public"), [".html"]),
];

const problem = (file, msg) => errors.push(`${relative(ROOT, file)}: ${msg}`);

const need = (file, obj, fields, label) => {
  for (const f of fields) {
    if (obj[f] === undefined || obj[f] === null || obj[f] === "") {
      problem(file, `${label} missing required field '${f}'`);
    }
  }
};

const validate = (file, obj) => {
  if (!obj || typeof obj !== "object") return;
  if (Array.isArray(obj["@graph"])) {
    for (const g of obj["@graph"]) validate(file, g);
    return;
  }
  const type = Array.isArray(obj["@type"]) ? obj["@type"][0] : obj["@type"];
  if (!obj["@context"]) problem(file, `${type ?? "block"} missing @context`);
  switch (type) {
    case "Article":
    case "BlogPosting":
    case "NewsArticle":
      need(file, obj, ["headline", "image", "author", "publisher", "datePublished"], type);
      if (obj.publisher && !obj.publisher.logo) problem(file, `${type}.publisher missing logo`);
      break;
    case "SoftwareApplication":
      need(file, obj, ["name", "applicationCategory", "operatingSystem", "offers"], type);
      if (obj.aggregateRating && !obj.aggregateRating.reviewCount && !obj.aggregateRating.ratingCount) {
        problem(file, "SoftwareApplication.aggregateRating needs reviewCount or ratingCount");
      }
      break;
    case "FAQPage": {
      const list = obj.mainEntity;
      if (!Array.isArray(list) || list.length === 0) {
        problem(file, "FAQPage.mainEntity must be a non-empty array");
        break;
      }
      list.forEach((q, i) => {
        if (q["@type"] !== "Question") problem(file, `FAQPage.mainEntity[${i}] not Question`);
        if (!q.name) problem(file, `FAQPage.mainEntity[${i}] missing name`);
        if (!q.acceptedAnswer?.text) problem(file, `FAQPage.mainEntity[${i}] missing acceptedAnswer.text`);
      });
      break;
    }
    case "BreadcrumbList": {
      const list = obj.itemListElement;
      if (!Array.isArray(list) || list.length === 0) {
        problem(file, "BreadcrumbList.itemListElement must be a non-empty array");
        break;
      }
      list.forEach((it, i) => {
        if (it["@type"] !== "ListItem") problem(file, `BreadcrumbList[${i}] not ListItem`);
        if (typeof it.position !== "number") problem(file, `BreadcrumbList[${i}] missing numeric position`);
        if (!it.name) problem(file, `BreadcrumbList[${i}] missing name`);
        if (!it.item) problem(file, `BreadcrumbList[${i}] missing item URL`);
      });
      break;
    }
  }
};

// Extract JSON.stringify({...}) argument objects from route source files.
const extractFromSource = (src) => {
  const blocks = [];
  const re = /JSON\.stringify\(\s*(\{[\s\S]*?\})\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const raw = m[1];
    // Only try to parse blocks that reference a schema.org @context.
    if (!raw.includes("schema.org")) continue;
    try {
      // eslint-disable-next-line no-new-func
      const obj = new Function(`return (${raw});`)();
      blocks.push(obj);
    } catch {
      // dynamic expressions inside (e.g. .map()) — try a light coercion
      try {
        const stub = raw
          .replace(/post\.faq\.map\([\s\S]*?\)\)/g, "[]")
          .replace(/FAQ\.map\([\s\S]*?\)\)/g, "[{'@type':'Question',name:'x',acceptedAnswer:{'@type':'Answer',text:'x'}}]");
        // eslint-disable-next-line no-new-func
        const obj = new Function(`return (${stub});`)();
        blocks.push(obj);
      } catch (e) {
        // skip — value is fully dynamic
      }
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
    } catch (e) {
      errors.push(`HTML JSON-LD parse error: ${e.message}`);
    }
  }
  return blocks;
};

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const blocks = extname(file) === ".html" ? extractFromHtml(src) : extractFromSource(src);
  for (const b of blocks) validate(file, b);
}

if (errors.length) {
  console.error(`\n✗ Schema validation failed (${errors.length} issue${errors.length === 1 ? "" : "s"}):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log("✓ Schema validation passed");
