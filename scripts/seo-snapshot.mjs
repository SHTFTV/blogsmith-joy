#!/usr/bin/env node
/**
 * SEO snapshot generator + local validator.
 *
 * Extracts the homepage JSON-LD blocks from src/routes/index.tsx, writes them
 * to seo-snapshots/homepage.jsonld (Rich Results Test–ready — paste into
 * https://search.google.com/test/rich-results), and structurally validates
 * the @graph nodes we care about (Corporation, WebSite, WebPage).
 *
 * Track regressions by committing seo-snapshots/ and diffing across changes.
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT_DIR = join(ROOT, "seo-snapshots");
const HOMEPAGE = join(ROOT, "src/routes/index.tsx");

const src = readFileSync(HOMEPAGE, "utf8");

// Extract JSON.stringify({...}) payloads from head().scripts entries.
const blocks = [];
const re = /JSON\.stringify\(\s*(\{[\s\S]*?\})\s*\)/g;
let m;
while ((m = re.exec(src))) {
  const raw = m[1];
  if (!raw.includes("schema.org")) continue;
  try {
    // eslint-disable-next-line no-new-func
    blocks.push(new Function(`return (${raw});`)());
  } catch (e) {
    console.error(`✗ Failed to parse JSON-LD block near offset ${m.index}: ${e.message}`);
    process.exit(1);
  }
}

if (blocks.length === 0) {
  console.error("✗ No JSON-LD blocks found in src/routes/index.tsx");
  process.exit(1);
}

// Flatten into a single Rich-Results-friendly document.
const document = { blocks };
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(join(OUT_DIR, "homepage.jsonld"), JSON.stringify(document, null, 2) + "\n");

// Validate the @graph nodes on the homepage: Corporation, WebSite, WebPage.
const errors = [];
const graphBlock = blocks.find((b) => Array.isArray(b["@graph"]));
if (!graphBlock) {
  errors.push("Homepage is missing a @graph JSON-LD block");
} else {
  const byType = new Map();
  for (const node of graphBlock["@graph"]) {
    const t = Array.isArray(node["@type"]) ? node["@type"][0] : node["@type"];
    byType.set(t, node);
  }
  const need = (type, id, fields) => {
    const node = graphBlock["@graph"].find(
      (n) => (Array.isArray(n["@type"]) ? n["@type"][0] : n["@type"]) === type && n["@id"] === id,
    );
    if (!node) {
      errors.push(`Missing @graph node @type=${type} @id=${id}`);
      return;
    }
    if (!node.url) errors.push(`${type} (${id}) missing url`);
    for (const f of fields) {
      if (node[f] === undefined) errors.push(`${type} (${id}) missing ${f}`);
    }
  };
  need("WebSite", "https://weddings.io/#website", ["name", "publisher"]);
  need("Organization", "https://weddings.io/#organization", ["name", "foundingDate"]);
  need("Organization", "https://industryarmy.com/#organization", ["name", "foundingDate"]);
}

// Snapshot the ItemList block if present.
const itemList = blocks.find((b) => b["@type"] === "ItemList");
if (itemList) {
  writeFileSync(join(OUT_DIR, "homepage.itemlist.json"), JSON.stringify(itemList, null, 2) + "\n");
}

if (errors.length) {
  console.error(`\n✗ SEO snapshot validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`✓ SEO snapshot written to seo-snapshots/homepage.jsonld (${blocks.length} blocks)`);
