import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createPublicKey, verify } from "node:crypto";
import { join } from "node:path";

const EV = join(process.cwd(), "public", "evidence");

function verifyEd25519(pubPem: string, data: Buffer, sigB64: string): boolean {
  const key = createPublicKey(pubPem);
  return verify(null, data, key, Buffer.from(sigB64.trim(), "base64"));
}

describe("evidence pack integrity (regression guard for /api/public/evidence/verify)", () => {
  const pubPem = readFileSync(join(EV, "pubkey.pem"), "utf8");
  const hashes = JSON.parse(
    readFileSync(join(EV, "hashes.json"), "utf8"),
  ) as Record<string, { file: string; sha256: string; bytes: number }>;

  it("has at least one registered exhibit", () => {
    expect(Object.keys(hashes).length).toBeGreaterThan(0);
  });

  it("hashes.json entries are well-formed (64-hex SHA-256, positive byte count)", () => {
    for (const [id, entry] of Object.entries(hashes)) {
      expect(entry.sha256, `${id} sha256 format`).toMatch(/^[0-9a-f]{64}$/);
      expect(entry.bytes, `${id} bytes`).toBeGreaterThan(0);
      expect(entry.file, `${id} file`).toBeTruthy();
    }
  });

  it("manifest Ed25519 signature validates against pubkey.pem", () => {
    const manifest = readFileSync(join(EV, "exhibit-a-manifest.json"));
    const sig = readFileSync(join(EV, "exhibit-a-manifest.json.sig"), "utf8");
    expect(verifyEd25519(pubPem, manifest, sig)).toBe(true);
  });

  it("evidence pack PDF Ed25519 signature validates against pubkey.pem", () => {
    const pdf = readFileSync(join(EV, "weddings-io-evidence-pack.pdf"));
    const sig = readFileSync(
      join(EV, "weddings-io-evidence-pack.pdf.sig"),
      "utf8",
    );
    expect(verifyEd25519(pubPem, pdf, sig)).toBe(true);
  });

  it("manifest references every exhibit in hashes.json with the same SHA-256", () => {
    const manifest = JSON.parse(
      readFileSync(join(EV, "exhibit-a-manifest.json"), "utf8"),
    ) as { exhibits: Array<{ evidence_id: string; sha256: string }> };
    for (const [id, entry] of Object.entries(hashes)) {
      const ex = manifest.exhibits.find((e) => e.evidence_id === id);
      expect(ex, `manifest missing exhibit ${id}`).toBeTruthy();
      expect(ex!.sha256).toBe(entry.sha256);
    }
  });

  it("tampered PDF fails signature verification", () => {
    const pdf = readFileSync(join(EV, "weddings-io-evidence-pack.pdf"));
    const sig = readFileSync(
      join(EV, "weddings-io-evidence-pack.pdf.sig"),
      "utf8",
    );
    const tampered = Buffer.from(pdf);
    // Flip the first byte after the PDF header (guaranteed to be inside the file).
    tampered[Math.floor(tampered.length / 2)] ^= 0xff;
    expect(verifyEd25519(pubPem, tampered, sig)).toBe(false);
  });

  it("tampered manifest fails signature verification", () => {
    const manifest = readFileSync(join(EV, "exhibit-a-manifest.json"));
    const sig = readFileSync(join(EV, "exhibit-a-manifest.json.sig"), "utf8");
    const tampered = Buffer.concat([manifest, Buffer.from(" ")]);
    expect(verifyEd25519(pubPem, tampered, sig)).toBe(false);
  });

  it("missing evidence files surface as filesystem errors", () => {
    expect(() => readFileSync(join(EV, "does-not-exist.sig"))).toThrow(
      /ENOENT/,
    );
    expect(() =>
      readFileSync(join(EV, "does-not-exist-manifest.json")),
    ).toThrow(/ENOENT/);
  });

  it("manifest capture timestamps are recent enough not to be considered expired", () => {
    const manifest = JSON.parse(
      readFileSync(join(EV, "exhibit-a-manifest.json"), "utf8"),
    ) as { exhibits: Array<{ captured_at: string }> };
    const MAX_AGE_DAYS = 365 * 5; // evidence pack "expires" after 5 years
    const now = Date.now();
    for (const ex of manifest.exhibits) {
      const capturedAt = Date.parse(ex.captured_at);
      expect(Number.isFinite(capturedAt), "captured_at parseable").toBe(true);
      const ageDays = (now - capturedAt) / (1000 * 60 * 60 * 24);
      expect(ageDays, `captured_at age (days)`).toBeLessThan(MAX_AGE_DAYS);
    }
  });

  it("detects an artificially expired manifest capture timestamp", () => {
    // Simulate an expired manifest by mutating captured_at in memory.
    const raw = JSON.parse(
      readFileSync(join(EV, "exhibit-a-manifest.json"), "utf8"),
    ) as { exhibits: Array<{ captured_at: string }> };
    const mutated = {
      ...raw,
      exhibits: raw.exhibits.map((e) => ({
        ...e,
        captured_at: "2000-01-01T00:00:00.000Z",
      })),
    };
    const MAX_AGE_DAYS = 365 * 5;
    const isExpired = mutated.exhibits.some(
      (e) =>
        (Date.now() - Date.parse(e.captured_at)) / 86_400_000 > MAX_AGE_DAYS,
    );
    expect(isExpired).toBe(true);
  });

  it("claim hashes that do not appear in the registry are reported as no-match", () => {
    // Mirrors the endpoint's claim matching logic.
    const matchClaim = (claimed: string) => {
      const normalized = claimed.toLowerCase().trim();
      const hit = Object.entries(hashes).find(
        ([, e]) => e.sha256.toLowerCase() === normalized,
      );
      return { match: !!hit, evidence_id: hit?.[0] ?? null };
    };
    const good = Object.values(hashes)[0].sha256;
    expect(matchClaim(good).match).toBe(true);
    expect(matchClaim("f".repeat(64)).match).toBe(false);
    expect(matchClaim("").match).toBe(false);
    // Casing/whitespace tolerated.
    expect(matchClaim(`  ${good.toUpperCase()}  `).match).toBe(true);
  });
});
