import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

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

function VerifyPage() {
  const [hashes, setHashes] = useState<HashMap | null>(null);
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [error, setError] = useState<string | null>(null);

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
        . <strong>Files never leave your device.</strong>
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
    </main>
  );
}
