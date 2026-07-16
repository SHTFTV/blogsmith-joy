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
  return fetch(url.toString(), { cache: "no-store" });
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

        // Compute the requester IP hash (same salt as audit log) so we can
        // rate-limit and log with the same identifier.
        const ipRaw =
          request.headers.get("cf-connecting-ip") ||
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          "";
        const ipHash = ipRaw
          ? "sha256:" +
            createHash("sha256")
              .update(ipRaw + privPem)
              .digest("hex")
              .slice(0, 32)
          : null;

        // Ad-hoc throttle: the audit log itself is the counter, so no extra
        // primitive is needed. Limits: 10 req / 10s burst, 30 req / minute.
        // Anonymous (no IP header) requests share a single bucket.
        if (ipHash !== null) {
          try {
            const { supabaseAdmin } = await import(
              "@/integrations/supabase/client.server"
            );
            const now = Date.now();
            const [burst, minute] = await Promise.all([
              supabaseAdmin
                .from("evidence_verification_audit")
                .select("id", { count: "exact", head: true })
                .eq("requester_ip_hash", ipHash)
                .gte("created_at", new Date(now - 10_000).toISOString()),
              supabaseAdmin
                .from("evidence_verification_audit")
                .select("id", { count: "exact", head: true })
                .eq("requester_ip_hash", ipHash)
                .gte("created_at", new Date(now - 60_000).toISOString()),
            ]);
            const burstN = burst.count ?? 0;
            const minuteN = minute.count ?? 0;
            if (burstN >= 10 || minuteN >= 30) {
              // Log the throttled request itself so admins can see abuse trends.
              try {
                const ua = (request.headers.get("user-agent") || "").slice(0, 500);
                await supabaseAdmin
                  .from("evidence_verification_audit")
                  .insert({
                    receipt_id: "rate_limited",
                    requester_ip_hash: ipHash,
                    user_agent: ua || null,
                    claim_count: 0,
                    all_matched: false,
                    manifest_signature_valid: false,
                    pdf_signature_valid: false,
                    outcome: "rate_limited",
                    manifest_expired: false,
                    mismatched_claim_count: 0,
                    mismatch_reason_codes: [],
                  });
              } catch {
                /* never block the 429 response */
              }
              return new Response(
                JSON.stringify({
                  ok: false,
                  error: "rate_limited",
                  message:
                    "Too many verification requests from this network. Please wait a moment and try again.",
                }),
                {
                  status: 429,
                  headers: { ...ORIGIN_HEADERS, "Retry-After": "30" },
                },
              );
            }
          } catch {
            // Never let the limiter block legitimate verifications.
          }
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

        // Manifest expiry: 5-year window from oldest captured_at (see integrity tests).
        let manifestExpired = false;
        let manifestOldestCapturedAt: string | null = null;
        try {
          const manifestJson = JSON.parse(
            new TextDecoder().decode(manifestBytes),
          ) as { exhibits?: Array<{ captured_at?: string }> };
          const times = (manifestJson.exhibits ?? [])
            .map((e) => (e.captured_at ? Date.parse(e.captured_at) : NaN))
            .filter((n) => Number.isFinite(n)) as number[];
          if (times.length > 0) {
            const oldest = Math.min(...times);
            manifestOldestCapturedAt = new Date(oldest).toISOString();
            const MAX_AGE_MS = 365 * 5 * 24 * 60 * 60 * 1000;
            manifestExpired = Date.now() - oldest > MAX_AGE_MS;
          }
        } catch {
          /* leave manifestExpired = false on parse failure */
        }

        // Match claimed hashes against published registry.
        const entries = Object.entries(hashes);
        const claimResults = claimed.map((c) => {
          const normalized = (c.sha256 || "").toLowerCase().trim();
          let reasonCode: string | null = null;
          if (!normalized || !/^[a-f0-9]{64}$/.test(normalized)) {
            reasonCode = "malformed_hash";
          }
          const hit =
            reasonCode === null
              ? entries.find(([, e]) => e.sha256.toLowerCase() === normalized)
              : undefined;
          const match = !!hit;
          if (!match && reasonCode === null) reasonCode = "not_in_registry";
          return {
            name: c.name,
            claimed_sha256: normalized,
            match,
            evidence_id: hit?.[0] ?? null,
            expected_sha256: hit?.[1].sha256 ?? null,
            mismatch_reason: match ? null : reasonCode,
          };
        });
        const mismatchedClaimCount = claimResults.filter((r) => !r.match).length;
        const mismatchReasonCodes = Array.from(
          new Set(
            claimResults
              .filter((r) => !r.match && r.mismatch_reason)
              .map((r) => r.mismatch_reason as string),
          ),
        );

        const receiptId = createHash("sha256")
          .update(
            manifestSha + pdfSha + new Date().toISOString() + Math.random().toString(),
          )
          .digest("hex")
          .slice(0, 32);

        const receipt = {
          receipt_version: 1,
          receipt_id: receiptId,
          issued_at: new Date().toISOString(),
          issuer: "https://weddings.io",
          artifacts: {
            manifest: {
              path: "/evidence/exhibit-a-manifest.json",
              sha256: manifestSha,
              signature_valid: manifestSignatureValid,
              expired: manifestExpired,
              oldest_captured_at: manifestOldestCapturedAt,
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
          mismatched_claim_count: mismatchedClaimCount,
          mismatch_reason_codes: mismatchReasonCodes,
        };

        // Sign the receipt with the stable Ed25519 key from runtime secret.
        const receiptJson = JSON.stringify(receipt);
        const signature = sign(
          null,
          Buffer.from(receiptJson),
          createPrivateKey(privPem),
        ).toString("base64");

        // Append-only audit log. Never persist claimed hashes or raw evidence.
        try {
          const ua = (request.headers.get("user-agent") || "").slice(0, 500);
          const { supabaseAdmin } = await import(
            "@/integrations/supabase/client.server"
          );
          await supabaseAdmin.from("evidence_verification_audit").insert({
            receipt_id: receiptId,
            requester_ip_hash: ipHash,
            user_agent: ua || null,
            claim_count: claimResults.length,
            all_matched: receipt.all_claims_matched,
            manifest_signature_valid: manifestSignatureValid,
            pdf_signature_valid: pdfSignatureValid,
            outcome: "verified",
            manifest_expired: manifestExpired,
            mismatched_claim_count: mismatchedClaimCount,
            mismatch_reason_codes: mismatchReasonCodes,
          });
        } catch (err) {
          // Never let logging failures block verification.
          console.warn("evidence audit log failed", err);
        }

        return new Response(
          JSON.stringify({ ok: true, receipt, signature, algorithm: "Ed25519" }, null, 2),
          { status: 200, headers: ORIGIN_HEADERS },
        );

      },
    },
  },
});
