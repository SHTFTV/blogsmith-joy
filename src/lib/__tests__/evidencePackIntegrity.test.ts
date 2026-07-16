import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash, createPublicKey, verify } from "node:crypto";
import { join } from "node:path";

const EV = join(process.cwd(), "public", "evidence");

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

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
});
