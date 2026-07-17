#!/usr/bin/env node
/**
 * Compare a security scan output against .security-scan-baseline.json.
 * Fails (exit 1) when a finding key appears that is NOT in the accepted
 * allowlist, OR when the per-key count exceeds the baseline.
 *
 * Usage:
 *   node scripts/check-security-baseline.mjs <scan.json>
 *
 * The scan JSON shape matches Lovable's security--run_security_scan output:
 *   { "count": N, "findings": [ { "id": "...", "level": "warn" }, ... ] }
 *
 * In CI, upstream steps write the current scan to /tmp/security-scan.json
 * (see .github/workflows/security-baseline.yml).
 */
import { readFileSync, existsSync } from "node:fs";

const baselinePath = ".security-scan-baseline.json";
const scanPath = process.argv[2] ?? "/tmp/security-scan.json";

if (!existsSync(baselinePath)) {
  console.error(`✗ Missing baseline file ${baselinePath}`);
  process.exit(1);
}
if (!existsSync(scanPath)) {
  console.error(`✗ Missing scan file ${scanPath}`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const scan = JSON.parse(readFileSync(scanPath, "utf8"));

const acceptedCounts = baseline.accepted_counts ?? {};
const currentCounts = {};
for (const f of scan.findings ?? []) {
  const id = f.id ?? f.internal_id ?? "unknown";
  currentCounts[id] = (currentCounts[id] ?? 0) + 1;
}

const problems = [];
for (const [id, count] of Object.entries(currentCounts)) {
  const allowed = acceptedCounts[id];
  if (allowed === undefined) {
    problems.push(`✗ NEW finding key "${id}" (${count} occurrence(s)) — not in baseline`);
  } else if (count > allowed) {
    problems.push(`✗ REGRESSION "${id}": ${count} > baseline ${allowed}`);
  }
}

for (const id of Object.keys(acceptedCounts)) {
  if (!(id in currentCounts)) {
    console.log(`ℹ resolved-in-scan: "${id}" no longer present — consider tightening baseline`);
  }
}

if (problems.length) {
  console.error(`\n${problems.length} security finding regression(s) — merge blocked:\n`);
  for (const p of problems) console.error("  " + p);
  console.error(`\nEither fix the finding or (if intentional) update .security-scan-baseline.json with justification in docs/security-memory.md.`);
  process.exit(1);
}

console.log(`✓ Security scan matches baseline (${scan.count ?? 0} findings, all accepted).`);
