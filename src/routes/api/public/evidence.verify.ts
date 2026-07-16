import { createFileRoute } from "@tanstack/react-router";
import { createHash, createPrivateKey, createPublicKey, sign, verify } from "node:crypto";

const ORIGIN_HEADERS = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type ClaimedHash = { name: string; sha256: string };
type HashEntry = { file: string; sha256: string; bytes: number };

async function fetchSameOrigin(request: Request, path: string): Promise<Response> {
  const url = new URL(path, request.url);
  return fetch(url.toString(), { cf: { cacheTtl: 0 } as any });
}

async function verifyEd25519(pubPem: string, data: Uint8Array, sigB64: string): Promise<boolean> {
  try {
    const key = createPublicKey(pubPem);
    return verify(null, Buffer.from(data), key, Buffer.from(sigB64.trim(), "base64"));
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/public/evidence/verify")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: ORIGIN_HEADERS }),
      POST: async ({ request }) => {
        const privPem = process.env.EVIDENCE_ED25519_PRIVATE_KEY;
        if (!privPem) {
          return new Response(
            JSON.stringify({ ok: false, error: "signing_key_unavailable" }),
            { status: 500, headers: ORIGIN_HEADERS },
          );
        }

        let body: { hashes?: ClaimedHash[] } = {};
        try {
          body = (await request.json()) as any;
        } catch {
          // allow empty body — receipt still validates published artifacts
        }
        const claimed: ClaimedHash[] = Array.isArray(body?.hashes) ? body.hashes : [];

        // Load published artifacts (same origin)
        const [hashesRes, pubRes, manifestRes, manifestSigRes, pdfRes, pdfSigRes] =
          await Promise.all([
            fetchSameOrigin(request, "/evidence/hashes.json"),
            fetchSameOrigin(request, "/evidence/pubkey.pem"),
            fetchSameOrigin(request, "/evidence/exhibit-a-manifest.json"),
            fetchSameOrigin(request, "/evidence/exhibit-a-manifest.json.sig"),
            fetchSameOrigin(request, "/evidence/weddings-io-evidence-pack.pdf"),
            fetchSameOrigin(request, "/evidence/weddings-io-evidence-pack.pdf.sig"),
          ]);

        const hashes = (await hashesRes.json()) as Record<string, HashEntry>;
        const pubPem = await pubRes.text();
        const manifestBytes = new Uint8Array(await manifestRes.arrayBuffer());
        const manifestSig = await manifestSigRes.text();
        const pdfBytes = new Uint8Array(await pdfRes.arrayBuffer());
        const pdfSig = await pdfSigRes.text();

        // Recompute published artifact hashes server-side.
        const sha = (b: Uint8Array) => createHash("sha256").update(b).digest("hex");
        const manifestSha = sha(manifestBytes);
        const pdfSha = sha(pdfBytes);

        const [manifestSignatureValid, pdfSignatureValid] = await Promise.all([
          verifyEd25519(pubPem, manifestBytes, manifestSig),
          verifyEd25519(pubPem, pdfBytes, pdfSig),
        ]);

        // Match claimed hashes against published registry.
        const entries = Object.entries(hashes);
        const claimResults = claimed.map((c) => {
          const normalized = (c.sha256 || "").toLowerCase().trim();
          const hit = entries.find(([, e]) => e.sha256.toLowerCase() === normalized);
          return {
            name: c.name,
            claimed_sha256: normalized,
            match: !!hit,
            evidence_id: hit?.[0] ?? null,
            expected_sha256: hit?.[1].sha256 ?? null,
          };
        });

        const receipt = {
          receipt_version: 1,
          issued_at: new Date().toISOString(),
          issuer: "https://weddings.io",
          artifacts: {
            manifest: {
              path: "/evidence/exhibit-a-manifest.json",
              sha256: manifestSha,
              signature_valid: manifestSignatureValid,
            },
            pdf: {
              path: "/evidence/weddings-io-evidence-pack.pdf",
              sha256: pdfSha,
              signature_valid: pdfSignatureValid,
            },
          },
          registry: entries.map(([id, e]) => ({ id, ...e })),
          claims: claimResults,
          all_claims_matched:
            claimResults.length > 0 && claimResults.every((r) => r.match),
        };

        // Sign the receipt with the stable Ed25519 key from runtime secret.
        const receiptJson = JSON.stringify(receipt);
        const signature = sign(
          null,
          Buffer.from(receiptJson),
          createPrivateKey(privPem),
        ).toString("base64");

        return new Response(
          JSON.stringify({ ok: true, receipt, signature, algorithm: "Ed25519" }, null, 2),
          { status: 200, headers: ORIGIN_HEADERS },
        );
      },
    },
  },
});
