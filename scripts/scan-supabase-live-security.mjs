#!/usr/bin/env node
/**
 * Post-deploy Supabase security scan.
 *
 * Runs after a successful deploy and blocks the next publish when new
 * linter warnings appear beyond the accepted allowlist. Uses the
 * Supabase Management API:
 *   GET /v1/projects/{ref}/database/lints
 *
 * Env (both required in CI):
 *   SUPABASE_ACCESS_TOKEN — personal access token with lint read
 *   SUPABASE_PROJECT_REF  — project ref (e.g. abcxyz)
 *
 * Optional: ACCEPTED_LINT_COUNT overrides the default (8) if the
 * allowlist changes intentionally.
 */
const token = process.env.SUPABASE_ACCESS_TOKEN;
const ref = process.env.SUPABASE_PROJECT_REF;

if (!token || !ref) {
  console.error("✗ SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF required.");
  process.exit(1);
}

const ACCEPTED = Number(process.env.ACCEPTED_LINT_COUNT ?? 8);

// The 8 accepted findings, each keyed by (lint_name, function_name).
// Anything outside this set is a new warning and MUST fail the job.
const ACCEPTED_KEYS = new Set([
  // 3× 0028_anon_security_definer_function_executable
  "0028_anon_security_definer_function_executable::public.get_event_by_code",
  "0028_anon_security_definer_function_executable::public.get_event_by_trusted_code",
  "0028_anon_security_definer_function_executable::public.submit_guest_upload",
  // 5× 0029_authenticated_security_definer_function_executable
  "0029_authenticated_security_definer_function_executable::public.get_event_by_code",
  "0029_authenticated_security_definer_function_executable::public.get_event_by_trusted_code",
  "0029_authenticated_security_definer_function_executable::public.submit_guest_upload",
  "0029_authenticated_security_definer_function_executable::public.get_my_event_trusted_code",
  "0029_authenticated_security_definer_function_executable::public.has_role",
]);

const res = await fetch(
  `https://api.supabase.com/v1/projects/${ref}/database/lints`,
  { headers: { Authorization: `Bearer ${token}` } },
);
if (!res.ok) {
  console.error(`✗ Supabase Management API failed [${res.status}]: ${await res.text()}`);
  process.exit(1);
}
const lints = await res.json();

const warns = (Array.isArray(lints) ? lints : [])
  .filter((l) => (l.level ?? "").toUpperCase() === "WARN");

const unexpected = [];
for (const w of warns) {
  const name = w.name ?? w.rule ?? "";
  const meta = w.metadata ?? {};
  const fn = meta.name ? `${meta.schema ?? "public"}.${meta.name}` : "";
  const key = `${name}::${fn}`;
  if (!ACCEPTED_KEYS.has(key)) {
    unexpected.push({ key, cache_key: w.cache_key, meta });
  }
}

console.log(`Scanned ${warns.length} WARN findings; ${ACCEPTED_KEYS.size} on allowlist.`);

if (unexpected.length) {
  console.error(`\n✗ ${unexpected.length} NEW Supabase linter warning(s) — publish blocked:\n`);
  for (const u of unexpected) console.error("  •", u.key || u.cache_key, JSON.stringify(u.meta));
  console.error("\nEither fix the finding or add it to ACCEPTED_KEYS with justification in @security-memory.");
  process.exit(1);
}

if (warns.length > ACCEPTED) {
  console.error(`✗ Total WARN count ${warns.length} exceeds accepted ${ACCEPTED}.`);
  process.exit(1);
}

console.log("✓ Post-deploy scan clean.");
