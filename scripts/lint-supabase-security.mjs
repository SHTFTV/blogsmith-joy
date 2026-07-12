#!/usr/bin/env node
// Static security lint for Supabase migration SQL.
// Catches the patterns behind the three findings fixed on 2026-07-12:
//   1. SECURITY DEFINER functions without SET search_path
//   2. SECURITY DEFINER functions granted to anon/PUBLIC without an explicit
//      "-- allow-anon: <reason>" comment on the same or previous line
//   3. USING (true) SELECT policies on non-public tables (must be tagged
//      "-- public-read: <reason>" if intentional)
//
// Exits 1 when new violations are found so CI blocks the merge/publish.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS = "supabase/migrations";
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p);
    else if (p.endsWith(".sql")) scan(p);
  }
}

function scan(file) {
  const sql = readFileSync(file, "utf8");
  const lines = sql.split("\n");

  // 1. SECURITY DEFINER without SET search_path in the same function body.
  const fnRegex =
    /CREATE\s+(OR\s+REPLACE\s+)?FUNCTION[\s\S]*?SECURITY\s+DEFINER[\s\S]*?(\$\$|\$function\$|LANGUAGE\s+\w+\s*;)/gi;
  for (const m of sql.matchAll(fnRegex)) {
    const body = m[0];
    if (!/SET\s+search_path\s*=/i.test(body)) {
      const name =
        body.match(/FUNCTION\s+([\w.]+)/i)?.[1] ?? "(anonymous)";
      problems.push(
        `${file}: SECURITY DEFINER function ${name} missing "SET search_path = ..."`,
      );
    }
  }

  // 2. GRANT EXECUTE ... TO anon/PUBLIC without allow-anon annotation.
  lines.forEach((line, i) => {
    if (/GRANT\s+EXECUTE[\s\S]*?TO[^;]*\b(anon|PUBLIC)\b/i.test(line)) {
      const prev = lines[i - 1] ?? "";
      if (!/allow-anon:/i.test(line) && !/allow-anon:/i.test(prev)) {
        problems.push(
          `${file}:${i + 1}: GRANT EXECUTE to anon/PUBLIC without "-- allow-anon: <reason>"`,
        );
      }
    }
  });

  // 3. USING (true) SELECT policies without public-read annotation.
  lines.forEach((line, i) => {
    if (/USING\s*\(\s*true\s*\)/i.test(line)) {
      const window = lines.slice(Math.max(0, i - 3), i + 1).join("\n");
      if (
        /CREATE\s+POLICY/i.test(window) &&
        !/public-read:/i.test(window)
      ) {
        problems.push(
          `${file}:${i + 1}: USING (true) policy without "-- public-read: <reason>"`,
        );
      }
    }
  });
}

try {
  walk(MIGRATIONS);
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

// Suppress historical violations captured in .security-lint-baseline.
let baseline = new Set();
try {
  baseline = new Set(
    readFileSync(".security-lint-baseline", "utf8")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  );
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}

const fresh = problems.filter((p) => !baseline.has(p));
if (fresh.length) {
  console.error("Supabase security lint failed on new findings:\n");
  for (const p of fresh) console.error("  - " + p);
  console.error(
    "\nFix the SQL, or add '-- allow-anon: <reason>' / '-- public-read: <reason>' / 'SET search_path' as appropriate.",
  );
  process.exit(1);
}
console.log(
  `Supabase security lint passed (${baseline.size} pre-existing findings ignored via baseline).`,
);
