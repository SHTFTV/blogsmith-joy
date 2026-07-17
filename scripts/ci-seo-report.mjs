#!/usr/bin/env node
/**
 * Aggregates every SEO / schema / metadata validator into one CI step.
 * Writes per-check logs and a machine-readable JSON report + human summary
 * under ci-artifacts/seo/, and exits non-zero with a readable summary when
 * any check fails. Uploaded by the schema-validate.yml workflow so history
 * is trackable across builds.
 *
 * Skip individual network-bound checks with:
 *   SKIP_MANIFESTO_LINKS=1  (link scanner)
 *   SKIP_BLOG_OG_HTTP=1     (blog og:image HEAD)
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OUT = join(ROOT, "ci-artifacts", "seo");
mkdirSync(OUT, { recursive: true });

const CHECKS = [
  ["schema", "scripts/validate-schema.mjs"],
  ["manifesto-seo", "scripts/validate-manifesto-seo.mjs"],
  ["manifesto-rich-results", "scripts/validate-manifesto-rich-results.mjs"],
  ["manifesto-metadata", "scripts/validate-manifesto-metadata.mjs"],
  ["manifesto-images", "scripts/validate-manifesto-images.mjs"],
  ["manifesto-links", "scripts/validate-manifesto-links.mjs"],
  ["blog-post-seo", "scripts/validate-blog-post-seo.mjs"],
  ["blog-canonicals", "scripts/validate-blog-canonicals.mjs"],
  ["blog-feed-coverage", "scripts/validate-blog-feed-coverage.mjs"],
];

const results = [];
const startedAt = new Date().toISOString();

for (const [name, script] of CHECKS) {
  const t0 = Date.now();
  const r = spawnSync("node", [script], { cwd: ROOT, encoding: "utf8", env: process.env });
  const durationMs = Date.now() - t0;
  const stdout = r.stdout ?? "";
  const stderr = r.stderr ?? "";
  const status = r.status === 0 ? "pass" : "fail";
  writeFileSync(join(OUT, `${name}.log`), `# ${script}\n\n## stdout\n${stdout}\n## stderr\n${stderr}\n`);
  results.push({ name, script, status, exitCode: r.status, durationMs, stderrTail: stderr.trim().split("\n").slice(-8).join("\n") });
  const badge = status === "pass" ? "✓" : "✗";
  process.stdout.write(`${badge} ${name.padEnd(24)} ${status.padEnd(4)} ${durationMs}ms\n`);
}

const failed = results.filter((r) => r.status === "fail");
const report = {
  generatedAt: startedAt,
  base: process.env.BASE_URL || "https://weddings.io",
  totalChecks: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  results,
};
writeFileSync(join(OUT, "report.json"), JSON.stringify(report, null, 2));

const summaryLines = [
  `# SEO validation report — ${startedAt}`,
  ``,
  `**Total:** ${results.length}  **Pass:** ${report.passed}  **Fail:** ${report.failed}`,
  ``,
  `| Check | Status | Duration |`,
  `| ----- | ------ | -------- |`,
  ...results.map((r) => `| ${r.name} | ${r.status === "pass" ? "✅ pass" : "❌ fail"} | ${r.durationMs}ms |`),
];
if (failed.length) {
  summaryLines.push(``, `## Failures`);
  for (const f of failed) {
    summaryLines.push(``, `### ${f.name} (\`${f.script}\`)`, ``, "```", f.stderrTail || "(no stderr — see log)", "```");
  }
}
writeFileSync(join(OUT, "summary.md"), summaryLines.join("\n") + "\n");

// GitHub Actions job summary integration.
if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, summaryLines.join("\n") + "\n", { flag: "a" });
}

if (failed.length) {
  console.error(`\n✗ ${failed.length} of ${results.length} SEO checks failed:`);
  for (const f of failed) console.error(`  - ${f.name}: exit ${f.exitCode}`);
  console.error(`\nSee ci-artifacts/seo/summary.md for details and ci-artifacts/seo/*.log for full output.`);
  process.exit(1);
}
console.log(`\n✓ All ${results.length} SEO checks passed. Report: ci-artifacts/seo/report.json`);
