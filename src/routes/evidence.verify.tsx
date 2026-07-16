import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";

type HashEntry = { file: string; sha256: string; bytes: number };
type HashMap = Record<string, HashEntry>;

const CANONICAL = "https://weddings.io/evidence/verify";

export const Route = createFileRoute("/evidence/verify")({
  head: () => ({
    meta: [
      { title: "Verify Evidence — Weddings.io™" },
      {
        name: "description",
        content:
          "Verify a copy of a Weddings.io evidence screenshot against the published SHA-256 hash. Client-side only — files never leave your browser.",
      },
      { property: "og:title", content: "Verify Evidence — Weddings.io™" },
      { property: "og:url", content: CANONICAL },
      { property: "og:type", content: "website" },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: VerifyPage,
});

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type Result = {
  name: string;
  bytes: number;
  hash: string;
  match?: { id: string; entry: HashEntry };
};

type ServerReceipt = {
  ok: boolean;
  receipt: {
    issued_at: string;
    issuer: string;
    artifacts: {
      manifest: { path: string; sha256: string; signature_valid: boolean };
      pdf: { path: string; sha256: string; signature_valid: boolean };
    };
    claims: Array<{
      name: string;
      claimed_sha256: string;
      match: boolean;
      evidence_id: string | null;
      expected_sha256: string | null;
    }>;
    all_claims_matched: boolean;
  };
  signature: string;
  algorithm: string;
};

function VerifyPage() {
  const [hashes, setHashes] = useState<HashMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<ServerReceipt | null>(null);
  const [receiptBusy, setReceiptBusy] = useState(false);

  useEffect(() => {
    fetch("/evidence/hashes.json")
      .then((r) => r.json())
      .then(setHashes)
      .catch((e) => setError(String(e)));
  }, []);

  async function onFiles(files: FileList | null) {
    if (!files || !hashes) return;
    setBusy(true);
    setError(null);
    try {
      const out: Result[] = [];
      for (const f of Array.from(files)) {
        const buf = await f.arrayBuffer();
        const hash = await sha256Hex(buf);
        let match: Result["match"];
        for (const [id, entry] of Object.entries(hashes)) {
          if (entry.sha256 === hash) {
            match = { id, entry };
            break;
          }
        }
        out.push({ name: f.name, bytes: f.size, hash, match });
      }
      setResults(out);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }

  async function fetchServerReceipt() {
    if (results.length === 0) return;
    setReceiptBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/public/evidence/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hashes: results.map((r) => ({ name: r.name, sha256: r.hash })),
        }),
      });
      const json = (await res.json()) as ServerReceipt;
      setReceipt(json);
    } catch (e) {
      setError(String(e));
    } finally {
      setReceiptBusy(false);
    }
  }

  function downloadReceipt() {
    if (!receipt) return;
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "weddings-io-verification-receipt.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadReport() {
    if (results.length === 0) return;
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 48;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    let y = margin;

    const write = (text: string, size = 10, bold = false, color = "#111") => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(color);
      const lines = doc.splitTextToSize(text, pageW - margin * 2);
      for (const line of lines) {
        if (y > pageH - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, margin, y);
        y += size + 4;
      }
    };

    write("Weddings.io — Evidence Verification Report", 18, true);
    write(`Generated: ${new Date().toISOString()}`, 9, false, "#555");
    write(`Source: ${CANONICAL}`, 9, false, "#555");
    y += 8;

    write("File verification results", 13, true);
    results.forEach((r, i) => {
      y += 4;
      const status = r.match ? `MATCH — ${r.match.id}` : "NO MATCH";
      write(`${i + 1}. ${r.name}  [${status}]`, 11, true,
        r.match ? "#0a6b2c" : "#a01414");
      write(`Bytes: ${r.bytes.toLocaleString()}`, 9);
      write(`Computed SHA-256: ${r.hash}`, 9);
      if (r.match) {
        write(`Expected SHA-256: ${r.match.entry.sha256}`, 9);
        write(`Registered file: ${r.match.entry.file}`, 9);
      }
    });

    if (receipt) {
      y += 12;
      write("Server verification receipt (Ed25519)", 13, true);
      write(`Issued: ${receipt.receipt.issued_at}`, 9);
      write(`Issuer: ${receipt.receipt.issuer}`, 9);
      write(
        `Manifest signature: ${receipt.receipt.artifacts.manifest.signature_valid ? "VALID" : "INVALID"} — sha256 ${receipt.receipt.artifacts.manifest.sha256}`,
        9,
        false,
        receipt.receipt.artifacts.manifest.signature_valid ? "#0a6b2c" : "#a01414",
      );
      write(
        `PDF signature: ${receipt.receipt.artifacts.pdf.signature_valid ? "VALID" : "INVALID"} — sha256 ${receipt.receipt.artifacts.pdf.sha256}`,
        9,
        false,
        receipt.receipt.artifacts.pdf.signature_valid ? "#0a6b2c" : "#a01414",
      );
      write(
        `All submitted claims matched: ${receipt.receipt.all_claims_matched ? "YES" : "NO"}`,
        10,
        true,
      );
      y += 4;
      write("Receipt signature (base64, Ed25519):", 9, true);
      write(receipt.signature, 8, false, "#333");
      write(
        "Verify with the public key at /evidence/pubkey.pem over the exact JSON receipt body.",
        8,
        false,
        "#555",
      );
    } else {
      y += 8;
      write(
        "Server signature validation not requested. Click 'Get signed server receipt' before exporting to include manifest/PDF signature checks.",
        9,
        false,
        "#555",
      );
    }

    doc.save("weddings-io-verification-report.pdf");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold mb-3">Verify Evidence</h1>
      <p className="mb-4">
        Drop a copy of any Weddings.io evidence image below. Your browser
        computes its SHA-256 locally and compares it to the hashes published
        with the{" "}
        <a
          href="/manifesto/record-record-domain-provenance-vs-generative-conflation"
          className="underline"
        >
          Record Record manifesto
        </a>
        . <strong>Files never leave your device</strong> unless you request a
        signed server receipt (which sends only the SHA-256 hashes, never the
        images themselves).
      </p>
      <ul className="text-sm text-neutral-700 list-disc pl-5 mb-6">
        <li>
          <a href="/evidence/weddings-io-evidence-pack.pdf" className="underline">
            Evidence pack (PDF)
          </a>{" "}
          &middot;{" "}
          <a href="/evidence/weddings-io-evidence-pack.pdf.sig" className="underline">
            PDF signature
          </a>
        </li>
        <li>
          <a href="/evidence/exhibit-a-manifest.json" className="underline">
            Signed manifest
          </a>{" "}
          &middot;{" "}
          <a href="/evidence/exhibit-a-manifest.json.sig" className="underline">
            manifest signature
          </a>
        </li>
        <li>
          <a href="/evidence/pubkey.pem" className="underline">
            Ed25519 public key (PEM)
          </a>{" "}
          &middot;{" "}
          <a href="/evidence/hashes.json" className="underline">
            hashes.json
          </a>
        </li>
      </ul>

      <label
        htmlFor="verify-file"
        className="block border-2 border-dashed border-neutral-400 rounded p-8 text-center cursor-pointer hover:bg-neutral-50"
      >
        <input
          id="verify-file"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => onFiles(e.currentTarget.files)}
        />
        <span className="block text-sm text-neutral-700">
          {busy
            ? "Hashing…"
            : "Click to choose one or more image files to verify"}
        </span>
      </label>

      {error && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      {results.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={fetchServerReceipt}
            disabled={receiptBusy}
            className="rounded bg-neutral-900 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {receiptBusy ? "Requesting receipt…" : "Get signed server receipt"}
          </button>
          <button
            type="button"
            onClick={downloadReport}
            className="rounded border border-neutral-400 px-4 py-2 text-sm hover:bg-neutral-50"
          >
            Download verification report (PDF)
          </button>
          {receipt && (
            <button
              type="button"
              onClick={downloadReceipt}
              className="rounded border border-neutral-400 px-4 py-2 text-sm hover:bg-neutral-50"
            >
              Download receipt JSON
            </button>
          )}
        </div>
      )}

      {hashes && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Published hashes</h2>
          <ul className="text-xs font-mono break-all bg-neutral-50 border border-neutral-200 rounded p-3">
            {Object.entries(hashes).map(([id, e]) => (
              <li key={id} className="mb-1">
                <strong>{id}</strong> — {e.file} — {e.sha256}
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Results</h2>
          <ul className="space-y-3">
            {results.map((r, i) => (
              <li
                key={i}
                className={`rounded border p-4 ${
                  r.match
                    ? "border-green-600 bg-green-50"
                    : "border-red-600 bg-red-50"
                }`}
              >
                <p className="font-semibold">
                  {r.match
                    ? `✓ MATCH — ${r.match.id}`
                    : "✗ NO MATCH — this file does not correspond to any published Weddings.io evidence hash"}
                </p>
                <p className="text-sm">
                  File: <code>{r.name}</code> ({r.bytes.toLocaleString()} bytes)
                </p>
                <p className="text-xs font-mono break-all mt-1">
                  Computed SHA-256: {r.hash}
                </p>
                {r.match && (
                  <p className="text-xs font-mono break-all">
                    Expected:        {r.match.entry.sha256}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {receipt && (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Server verification receipt</h2>
          <div className="text-sm bg-neutral-50 border border-neutral-200 rounded p-4 space-y-1">
            <p>
              <strong>Issued:</strong> {receipt.receipt.issued_at}
            </p>
            <p>
              <strong>Manifest signature:</strong>{" "}
              <span
                className={
                  receipt.receipt.artifacts.manifest.signature_valid
                    ? "text-green-700"
                    : "text-red-700"
                }
              >
                {receipt.receipt.artifacts.manifest.signature_valid ? "VALID" : "INVALID"}
              </span>
            </p>
            <p>
              <strong>PDF signature:</strong>{" "}
              <span
                className={
                  receipt.receipt.artifacts.pdf.signature_valid
                    ? "text-green-700"
                    : "text-red-700"
                }
              >
                {receipt.receipt.artifacts.pdf.signature_valid ? "VALID" : "INVALID"}
              </span>
            </p>
            <p className="text-xs font-mono break-all pt-2">
              <strong>Ed25519 receipt signature:</strong> {receipt.signature}
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
