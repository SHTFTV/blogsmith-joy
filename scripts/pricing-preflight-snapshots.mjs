#!/usr/bin/env node
/**
 * Preflight: verify snapshot baselines exist for the pricing-rows-a11y spec.
 *
 * Snapshot names come from calls to `toHaveScreenshot(name)` in
 * tests/e2e/pricing-rows-a11y.spec.ts:
 *   - row-callout-{theme}-{project}.png
 *   - row-city-{i}-{theme}-{project}.png    (i = 0..CITY_EXAMPLES.length-1)
 *
 * Playwright stores them at:
 *   tests/e2e/pricing-rows-a11y.spec.ts-snapshots/<name>
 *
 * Usage:
 *   node scripts/pricing-preflight-snapshots.mjs               # all cross-browser projects
 *   node scripts/pricing-preflight-snapshots.mjs chromium      # one browser
 *   node scripts/pricing-preflight-snapshots.mjs firefox webkit
 *
 * Exit code: 0 = all baselines present, 1 = at least one missing.
 * Emits `missing=true|false` and a JSON `missing_files` list to $GITHUB_OUTPUT when set.
 */
import { readFileSync, existsSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");
const SNAP_DIR = resolve(
  REPO_ROOT,
  "tests/e2e/pricing-rows-a11y.spec.ts-snapshots"
);

const THEMES = ["light", "dark"];
const PROJECTS_BY_BROWSER = {
  chromium: ["pricing-chromium-desktop", "pricing-chromium-mobile"],
  firefox: ["pricing-firefox-desktop", "pricing-firefox-mobile"],
  webkit: ["pricing-webkit-desktop", "pricing-webkit-mobile"],
};

function readCityCount() {
  const src = readFileSync(
    resolve(REPO_ROOT, "src/lib/territoryPricing.ts"),
    "utf8"
  );
  // Count entries in CITY_EXAMPLES: lines starting with `{ city:`
  const block = src.split("CITY_EXAMPLES")[1] ?? "";
  const end = block.indexOf("] as const");
  const body = end >= 0 ? block.slice(0, end) : block;
  const n = (body.match(/\{\s*city\s*:/g) ?? []).length;
  if (!n) throw new Error("Could not parse CITY_EXAMPLES length");
  return n;
}

function expectedFilesFor(projects, cityCount) {
  const files = [];
  for (const project of projects) {
    for (const theme of THEMES) {
      files.push(`row-callout-${theme}-${project}.png`);
      for (let i = 0; i < cityCount; i++) {
        files.push(`row-city-${i}-${theme}-${project}.png`);
      }
    }
  }
  return files;
}

function main() {
  const browsers = process.argv.slice(2).length
    ? process.argv.slice(2)
    : Object.keys(PROJECTS_BY_BROWSER);
  const projects = browsers.flatMap((b) => {
    const p = PROJECTS_BY_BROWSER[b];
    if (!p) {
      console.error(`Unknown browser: ${b}`);
      process.exit(2);
    }
    return p;
  });

  const cityCount = readCityCount();
  const expected = expectedFilesFor(projects, cityCount);

  const missing = expected.filter((f) => !existsSync(resolve(SNAP_DIR, f)));
  const present = expected.length - missing.length;

  console.log(`Preflight: pricing-rows-a11y baselines`);
  console.log(`  dir:      ${SNAP_DIR}`);
  console.log(`  browsers: ${browsers.join(", ")}`);
  console.log(`  projects: ${projects.join(", ")}`);
  console.log(`  cities:   ${cityCount}`);
  console.log(`  expected: ${expected.length}`);
  console.log(`  present:  ${present}`);
  console.log(`  missing:  ${missing.length}`);
  if (missing.length) {
    console.log("");
    console.log("Missing baseline files:");
    for (const f of missing) console.log(`  - ${f}`);
  }

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(
      process.env.GITHUB_OUTPUT,
      `missing=${missing.length > 0}\n` +
        `missing_count=${missing.length}\n` +
        `missing_files<<EOF\n${missing.join("\n")}\nEOF\n`
    );
  }

  process.exit(missing.length > 0 ? 1 : 0);
}

main();
