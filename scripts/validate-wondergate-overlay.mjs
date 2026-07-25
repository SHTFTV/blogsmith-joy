#!/usr/bin/env node
/**
 * Validate the WonderGate featured-image overlay for every blog post that
 * references the WonderGate branded hero.
 *
 * Checks (offline, deterministic):
 *   1. Post exists at the expected slug.
 *   2. post.image points at the branded WonderGate asset pointer.
 *   3. The asset pointer JSON exists and its original_filename matches the
 *      expected branded hero filename (so a plain/unbranded image can't slip
 *      back in without failing the build).
 *   4. imageAlt mentions payments/cross-border/gold constellation cues so
 *      the overlay's semantics are described for AT users.
 *   5. Post body links out to wondergate.io (the overlay must be linked,
 *      not decorative-only).
 *
 * Extend BRANDED_POSTS as more posts adopt the WonderGate overlay.
 */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BRANDED_POSTS = [
  {
    slug: "we-will-be-digging-deeper-wondergate-payment-infrastructure",
    assetPointer: "src/assets/wondergate-payment-infrastructure-hero.jpg.asset.json",
    expectedFilename: "wondergate-payment-infrastructure-hero.jpg",
    altKeywords: ["payment", "cross-border", "wondergate", "gold"],
    outboundHost: "wondergate.io",
  },
];

const src = readFileSync(join(ROOT, "src/lib/blogPosts.ts"), "utf8");
const errors = [];

for (const p of BRANDED_POSTS) {
  const start = src.indexOf(`slug: "${p.slug}"`);
  if (start === -1) { errors.push(`${p.slug}: post not found in blogPosts.ts`); continue; }
  const nextSlug = src.indexOf(`slug: "`, start + 10);
  const block = src.slice(start, nextSlug > 0 ? nextSlug : start + 80000);

  // (2) image points at the branded WonderGate asset pointer
  if (!/image:\s*wondergateHero\.url/.test(block)) {
    errors.push(`${p.slug}: image does not reference wondergateHero.url (overlay hero not wired)`);
  }

  // (3) asset pointer exists with expected filename
  const pointerPath = join(ROOT, p.assetPointer);
  if (!existsSync(pointerPath)) {
    errors.push(`${p.slug}: asset pointer missing at ${p.assetPointer}`);
  } else {
    const pointer = JSON.parse(readFileSync(pointerPath, "utf8"));
    if (pointer.original_filename !== p.expectedFilename) {
      errors.push(`${p.slug}: asset pointer original_filename "${pointer.original_filename}" ≠ expected "${p.expectedFilename}" (unbranded image likely swapped in)`);
    }
    if (!/\.jpg$/i.test(pointer.url)) {
      errors.push(`${p.slug}: overlay hero must be JPG for crawler-safe og:image (got ${pointer.url})`);
    }
    if ((pointer.size ?? 0) < 20000) {
      errors.push(`${p.slug}: hero file suspiciously small (${pointer.size} bytes) — overlay likely stripped`);
    }
  }

  // (4) alt text mentions overlay semantics
  const altMatch = block.match(/imageAlt:\s*"([^"]+)"/);
  const alt = (altMatch?.[1] ?? "").toLowerCase();
  const missingAlt = p.altKeywords.filter((k) => !alt.includes(k.toLowerCase()));
  if (!altMatch) errors.push(`${p.slug}: imageAlt missing`);
  else if (missingAlt.length > 1) {
    errors.push(`${p.slug}: imageAlt should describe overlay (missing cues: ${missingAlt.join(", ")})`);
  }

  // (5) outbound link to wondergate host
  const linkRe = new RegExp(`https?:\\/\\/(?:www\\.)?${p.outboundHost.replace(/\./g, "\\.")}`, "i");
  if (!linkRe.test(block)) {
    errors.push(`${p.slug}: body missing outbound link to ${p.outboundHost} (overlay must be linked)`);
  }
}

if (errors.length) {
  console.error(`\n✗ WonderGate overlay validation failed (${errors.length}):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(`✓ WonderGate overlay valid for ${BRANDED_POSTS.length} post(s).`);
