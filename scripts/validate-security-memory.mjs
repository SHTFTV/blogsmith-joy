#!/usr/bin/env node
/**
 * Validate docs/security-memory.md — every accepted guest-facing
 * SECURITY DEFINER function must carry the required four labelled fields.
 * Also enforces that the exact allowlist matches the DB reality
 * we last verified on 2026-07-12.
 */
import { readFileSync } from "node:fs";

const MEMO = readFileSync("docs/security-memory.md", "utf8");

// The five accepted anon-callable / authenticated-callable definer functions.
// Keep this in sync with the DB. Adding/removing an entry requires a
// security review — this is intentionally rigid.
const REQUIRED_FUNCTIONS = [
  "public.get_event_by_code(text)",
  "public.get_event_by_trusted_code(text)",
  "public.submit_guest_upload(uuid, text, text, text, text, text, text)",
  "public.get_my_event_trusted_code(uuid)",
  "public.has_role(uuid, app_role)",
];

const REQUIRED_FIELDS = ["Callers:", "Why definer:", "Data returned:", "Abuse control:"];

const problems = [];

for (const fn of REQUIRED_FUNCTIONS) {
  const heading = "### ";
  const idx = MEMO.indexOf("`" + fn + "`");
  if (idx === -1) {
    problems.push(`missing entry for ${fn}`);
    continue;
  }
  // Grab the block from this heading to the next "### " or "## ".
  const after = MEMO.slice(idx);
  const nextHeading = after.slice(1).search(/\n#{2,3}\s/);
  const block = nextHeading === -1 ? after : after.slice(0, nextHeading + 1);
  for (const field of REQUIRED_FIELDS) {
    if (!block.includes(field)) {
      problems.push(`${fn}: missing "${field}" field`);
    }
  }
}

// Ensure the "Never allow" section mentions the email queue helpers so no
// one silently deletes that guardrail.
const MUST_MENTION = [
  "enqueue_email",
  "read_email_batch",
  "delete_email",
  "move_to_dlq",
  "email_queue_dispatch",
  "email_queue_wake",
  "SET search_path",
];
for (const token of MUST_MENTION) {
  if (!MEMO.includes(token)) {
    problems.push(`"Never allow" section must mention ${token}`);
  }
}

if (problems.length) {
  console.error(`\n✗ Security memory validation failed (${problems.length}):\n`);
  for (const p of problems) console.error("  - " + p);
  console.error(
    "\nEdit docs/security-memory.md and re-run: node scripts/validate-security-memory.mjs",
  );
  process.exit(1);
}

console.log(
  `✓ docs/security-memory.md valid: ${REQUIRED_FUNCTIONS.length} functions have all required fields.`,
);
