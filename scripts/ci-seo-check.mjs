#!/usr/bin/env node
/**
 * CI SEO gate.
 *
 * Runs the full SEO consistency chain in a fixed order and fails on any
 * drift. Intended to run in prebuild + a GitHub Actions job.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const steps = [
  ["Regenerate homepage JSON-LD snapshot", "scripts/seo-snapshot.mjs"],
  ["Validate all JSON-LD blocks", "scripts/validate-schema.mjs"],
  ["Diff schema IDs across pages", "scripts/diff-schema-ids.mjs"],
  ["Audit og:image / twitter:image fallbacks", "scripts/audit-og-images.mjs"],
  ["Lint sitemap", "scripts/lint-sitemap.mjs"],
];

let failed = 0;
for (const [label, script] of steps) {
  process.stdout.write(`\n▶ ${label}\n`);
  const r = spawnSync("node", [join(ROOT, script)], { stdio: "inherit" });
  if (r.status !== 0) failed++;
}

if (failed > 0) {
  console.error(`\n✗ CI SEO gate failed (${failed} step${failed === 1 ? "" : "s"})`);
  process.exit(1);
}
console.log("\n✓ CI SEO gate passed");
