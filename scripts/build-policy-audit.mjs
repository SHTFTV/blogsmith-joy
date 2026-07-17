#!/usr/bin/env node
/**
 * Build public/policy-audit.json from the git history of
 * supabase/migrations/*.sql.
 *
 * For each migration file we look at, we run:
 *   git log --format='%H|%aI|%s' -- <file>
 * to capture every commit that touched it, then scan the file for
 * RLS / storage-policy changes (CREATE / DROP / ALTER POLICY, GRANT/REVOKE
 * on public.* or storage.objects, ALTER TABLE ... ROW LEVEL SECURITY).
 *
 * Output shape:
 *   { generated_at, entries: [ { migration, commit, committed_at, subject, changes: [...] } ] }
 *
 * The admin.policy-audit page reads the static JSON — no DB round-trip.
 */
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const MIG_DIR = "supabase/migrations";
const OUT = "public/policy-audit.json";

function git(args) {
  try {
    return execSync(`git ${args}`, { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

const patterns = [
  { re: /\bCREATE\s+POLICY\s+"?([^"\s]+)"?\s+ON\s+([\w.]+)/gi, kind: "CREATE POLICY" },
  { re: /\bDROP\s+POLICY\s+(?:IF\s+EXISTS\s+)?"?([^"\s]+)"?\s+ON\s+([\w.]+)/gi, kind: "DROP POLICY" },
  { re: /\bALTER\s+POLICY\s+"?([^"\s]+)"?\s+ON\s+([\w.]+)/gi, kind: "ALTER POLICY" },
  { re: /\bALTER\s+TABLE\s+([\w.]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/gi, kind: "ENABLE RLS", nameIndex: -1 },
  { re: /\bALTER\s+TABLE\s+([\w.]+)\s+DISABLE\s+ROW\s+LEVEL\s+SECURITY/gi, kind: "DISABLE RLS", nameIndex: -1 },
  { re: /\b(GRANT|REVOKE)\s+[^;]+\s+ON\s+(?:TABLE\s+)?((?:public|storage)\.[\w]+)/gi, kind: "GRANT/REVOKE" },
];

function extractChanges(sql) {
  const out = [];
  for (const p of patterns) {
    for (const m of sql.matchAll(p.re)) {
      if (p.kind === "GRANT/REVOKE") {
        out.push({ kind: `${m[1].toUpperCase()} on ${m[2]}`, target: m[2] });
      } else if (p.kind === "ENABLE RLS" || p.kind === "DISABLE RLS") {
        out.push({ kind: p.kind, target: m[1] });
      } else {
        out.push({ kind: p.kind, policy: m[1], target: m[2] });
      }
    }
  }
  return out;
}

const files = readdirSync(MIG_DIR).filter((f) => f.endsWith(".sql")).sort();
const entries = [];

for (const f of files) {
  const path = join(MIG_DIR, f);
  const sql = readFileSync(path, "utf8");
  const changes = extractChanges(sql);
  if (changes.length === 0) continue;

  const log = git(`log '--format=%H|%aI|%s' -- "${path}"`);
  const commits = log
    ? log.split("\n").map((line) => {
        const [commit, committed_at, ...rest] = line.split("|");
        return { commit, committed_at, subject: rest.join("|") };
      })
    : [{ commit: "unknown", committed_at: null, subject: "(uncommitted)" }];

  const latest = commits[0];
  entries.push({
    migration: f,
    commit: latest.commit,
    committed_at: latest.committed_at,
    subject: latest.subject,
    change_count: changes.length,
    changes,
    history: commits,
  });
}

entries.sort((a, b) => (b.committed_at ?? "").localeCompare(a.committed_at ?? ""));

mkdirSync("public", { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({ generated_at: new Date().toISOString(), total: entries.length, entries }, null, 2),
);
console.log(`✓ Wrote ${OUT} with ${entries.length} policy-changing migration(s).`);
