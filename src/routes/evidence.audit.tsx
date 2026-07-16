import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import {
  listEvidenceAudit,
  type EvidenceAuditRow,
} from "@/lib/evidenceAudit.functions";

export const Route = createFileRoute("/evidence/audit")({
  head: () => ({
    meta: [
      { title: "Evidence Verification Audit — Weddings.io™" },
      {
        name: "description",
        content:
          "Admin-only view of evidence verification requests filtered by receipt ID and date range.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: EvidenceAuditPage,
});

function toIsoOrUndefined(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function toCsv(rows: EvidenceAuditRow[]): string {
  const headers = [
    "id",
    "receipt_id",
    "created_at",
    "requester_ip_hash",
    "user_agent",
    "claim_count",
    "all_matched",
    "manifest_signature_valid",
    "pdf_signature_valid",
  ];
  const esc = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.join(",")];
  for (const r of rows) {
    lines.push(
      [
        r.id,
        r.receipt_id,
        r.created_at,
        r.requester_ip_hash ?? "",
        r.user_agent ?? "",
        r.claim_count,
        r.all_matched,
        r.manifest_signature_valid,
        r.pdf_signature_valid,
      ]
        .map(esc)
        .join(","),
    );
  }
  return lines.join("\n");
}

function EvidenceAuditPage() {
  const fetchAudit = useServerFn(listEvidenceAudit);
  const [receiptId, setReceiptId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<EvidenceAuditRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAudit({
        data: {
          receiptId: receiptId.trim() || undefined,
          fromIso: toIsoOrUndefined(from),
          toIso: toIsoOrUndefined(to),
          limit: 1000,
        },
      });
      setRows(res.rows);
    } catch (e: any) {
      setError(
        String(e?.message ?? e).includes("Forbidden")
          ? "You need admin access to view this page."
          : String(e?.message ?? e),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filename = useMemo(() => {
    const suffix = receiptId.trim()
      ? `-${receiptId.trim().replace(/[^a-z0-9]/gi, "").slice(0, 16)}`
      : "";
    const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    return `evidence-audit${suffix}-${stamp}.csv`;
  }, [receiptId]);

  function downloadCsv() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-semibold mb-2">
        Evidence Verification Audit
      </h1>
      <p className="text-sm text-neutral-600 mb-6">
        Append-only log of every{" "}
        <code>POST /api/public/evidence/verify</code> request. No raw evidence
        or claimed hashes are stored — only receipt IDs, hashed requester IPs,
        user agent, claim counts, and signature validity flags.
      </p>

      <div className="grid gap-3 md:grid-cols-4 mb-4">
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">Receipt ID</span>
          <input
            className="w-full border rounded px-2 py-1"
            value={receiptId}
            onChange={(e) => setReceiptId(e.target.value)}
            placeholder="partial or full"
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">From</span>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="block mb-1 text-neutral-700">To</span>
          <input
            type="datetime-local"
            className="w-full border rounded px-2 py-1"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={run}
            disabled={loading}
            className="rounded bg-neutral-900 text-white px-4 py-2 text-sm disabled:opacity-60"
          >
            {loading ? "Loading…" : "Search"}
          </button>
          <button
            type="button"
            onClick={downloadCsv}
            disabled={rows.length === 0}
            className="rounded border border-neutral-400 px-4 py-2 text-sm disabled:opacity-60"
          >
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-700 text-sm mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="text-xs text-neutral-600 mb-2">
        {rows.length.toLocaleString()} row{rows.length === 1 ? "" : "s"}
      </div>

      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-xs">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-2">Created</th>
              <th className="text-left p-2">Receipt ID</th>
              <th className="text-left p-2">IP hash</th>
              <th className="text-left p-2">Claims</th>
              <th className="text-left p-2">Matched</th>
              <th className="text-left p-2">Manifest sig</th>
              <th className="text-left p-2">PDF sig</th>
              <th className="text-left p-2">User agent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2 whitespace-nowrap">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="p-2 font-mono">{r.receipt_id}</td>
                <td className="p-2 font-mono break-all">
                  {r.requester_ip_hash ?? "—"}
                </td>
                <td className="p-2">{r.claim_count}</td>
                <td className="p-2">{r.all_matched ? "✓" : "—"}</td>
                <td className="p-2">
                  {r.manifest_signature_valid ? "✓" : "✗"}
                </td>
                <td className="p-2">{r.pdf_signature_valid ? "✓" : "✗"}</td>
                <td className="p-2 max-w-xs truncate" title={r.user_agent ?? ""}>
                  {r.user_agent ?? "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td colSpan={8} className="p-4 text-center text-neutral-500">
                  No audit entries match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
