import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import {
  getEvidenceAuditReceipt,
  getEvidenceReceiptReport,
  type EvidenceAuditRow,
} from "@/lib/evidenceAudit.functions";

export const Route = createFileRoute("/evidence/receipt/$receiptId")({
  head: () => ({
    meta: [
      { title: "Evidence Receipt Detail — Weddings.io™" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: ReceiptDetailPage,
});

function ReceiptDetailPage() {
  const { receiptId } = Route.useParams();
  const fetchReceipt = useServerFn(getEvidenceAuditReceipt);
  const fetchReport = useServerFn(getEvidenceReceiptReport);
  const [rows, setRows] = useState<EvidenceAuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState<"json" | "pdf" | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchReceipt({ data: { receiptId } });
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
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receiptId]);

  const primary = rows[0];

  async function downloadJson() {
    setDownloadBusy("json");
    try {
      const report = await fetchReport({ data: { receiptId } });
      const blob = new Blob([JSON.stringify(report, null, 2)], {
        type: "application/json",
      });
      triggerDownload(blob, `evidence-receipt-${safeId(receiptId)}.json`);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setDownloadBusy(null);
    }
  }

  async function downloadPdf() {
    setDownloadBusy("pdf");
    try {
      const report = await fetchReport({ data: { receiptId } });
      const doc = new jsPDF({ unit: "pt", format: "letter" });
      const M = 48;
      let y = M;
      const line = (s: string, size = 10, bold = false) => {
        doc.setFont("helvetica", bold ? "bold" : "normal");
        doc.setFontSize(size);
        const wrapped = doc.splitTextToSize(s, 612 - M * 2);
        for (const w of wrapped) {
          if (y > 780) {
            doc.addPage();
            y = M;
          }
          doc.text(w, M, y);
          y += size + 4;
        }
      };
      line("Evidence Verification Receipt", 16, true);
      line(`Receipt ID: ${report.receipt_id}`, 10);
      line(`Generated: ${report.generated_at}`, 9);
      line(`Issuer: ${report.issuer}`, 9);
      y += 8;
      line("Summary", 12, true);
      if (report.summary) {
        const s = report.summary;
        line(`Outcome: ${s.outcome}`);
        line(
          `Manifest signature: ${s.manifest_signature_valid ? "valid" : "INVALID"}`,
        );
        line(
          `PDF signature: ${s.pdf_signature_valid ? "valid" : "INVALID"}`,
        );
        line(`Manifest expired: ${s.manifest_expired ? "YES" : "no"}`);
        line(`Claim count: ${s.claim_count}`);
        line(`Mismatched claims: ${s.mismatched_claim_count}`);
        line(`All claims matched: ${s.all_matched ? "yes" : "no"}`);
        line(
          `Mismatch reason codes: ${(s.mismatch_reason_codes ?? []).join(", ") || "—"}`,
        );
        line(`Requester IP hash: ${s.requester_ip_hash ?? "—"}`);
        line(`User agent: ${s.user_agent ?? "—"}`, 8);
        line(`Created: ${s.created_at}`);
      } else {
        line("No audit entry found for this receipt.");
      }
      y += 8;
      line(`Audit entries (${report.audit_entries.length})`, 12, true);
      for (const r of report.audit_entries) {
        line(
          `• ${r.created_at} — outcome=${r.outcome} sigM=${r.manifest_signature_valid} sigP=${r.pdf_signature_valid} claims=${r.claim_count} mismatch=${r.mismatched_claim_count} expired=${r.manifest_expired}`,
          9,
        );
        if (r.requester_ip_hash) line(`   ip=${r.requester_ip_hash}`, 8);
        if ((r.mismatch_reason_codes ?? []).length > 0)
          line(`   reasons=${r.mismatch_reason_codes.join(", ")}`, 8);
      }
      doc.save(`evidence-receipt-${safeId(receiptId)}.pdf`);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setDownloadBusy(null);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link to="/evidence/audit" className="text-blue-700 underline text-sm">
          ← Back to audit
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={downloadJson}
            disabled={loading || !primary || downloadBusy !== null}
            className="rounded border border-neutral-400 px-3 py-1 text-xs disabled:opacity-60"
          >
            {downloadBusy === "json" ? "…" : "Download JSON report"}
          </button>
          <button
            type="button"
            onClick={downloadPdf}
            disabled={loading || !primary || downloadBusy !== null}
            className="rounded border border-neutral-400 px-3 py-1 text-xs disabled:opacity-60"
          >
            {downloadBusy === "pdf" ? "…" : "Download PDF report"}
          </button>
        </div>
      </div>

        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-2">Receipt detail</h1>
      <p className="text-xs font-mono text-neutral-600 mb-6 break-all">
        {receiptId}
      </p>

      {loading && <p className="text-sm text-neutral-500">Loading…</p>}
      {error && (
        <p role="alert" className="text-red-700 text-sm">
          {error}
        </p>
      )}

      {!loading && !error && rows.length === 0 && (
        <p className="text-sm text-neutral-600">
          No audit entries found for this receipt ID.
        </p>
      )}

      {primary && (
        <>
          <section className="border rounded p-4 mb-6 bg-neutral-50">
            <h2 className="text-lg font-semibold mb-3">Verification result</h2>
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <Row label="Outcome" value={primary.outcome} />
              <Row
                label="Manifest signature"
                value={primary.manifest_signature_valid ? "valid ✓" : "invalid ✗"}
                bad={!primary.manifest_signature_valid}
              />
              <Row
                label="PDF signature"
                value={primary.pdf_signature_valid ? "valid ✓" : "invalid ✗"}
                bad={!primary.pdf_signature_valid}
              />
              <Row
                label="Manifest expired"
                value={primary.manifest_expired ? "expired ⚠︎" : "current"}
                bad={primary.manifest_expired}
              />
              <Row label="Claim count" value={String(primary.claim_count)} />
              <Row
                label="Mismatched claims"
                value={String(primary.mismatched_claim_count)}
                bad={primary.mismatched_claim_count > 0}
              />
              <Row
                label="All claims matched"
                value={primary.all_matched ? "yes" : "no"}
                bad={
                  !primary.all_matched && primary.claim_count > 0
                }
              />
              <Row
                label="Created"
                value={new Date(primary.created_at).toLocaleString()}
              />
              <Row
                label="Requester IP hash"
                value={primary.requester_ip_hash ?? "—"}
                mono
              />
              <Row
                label="User agent"
                value={primary.user_agent ?? "—"}
                mono
              />
            </div>
          </section>

          <section className="border rounded p-4 mb-6">
            <h2 className="text-lg font-semibold mb-2">
              Claim-mismatch reason codes
            </h2>
            {primary.mismatch_reason_codes &&
            primary.mismatch_reason_codes.length > 0 ? (
              <ul className="list-disc pl-5 text-sm">
                {primary.mismatch_reason_codes.map((c) => (
                  <li key={c} className="font-mono">
                    {c}{" "}
                    <span className="font-sans text-neutral-600">
                      — {reasonDescription(c)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">
                No claim mismatches recorded for this receipt.
              </p>
            )}
            <p className="mt-3 text-xs text-neutral-500">
              Raw claimed hashes are intentionally not stored; only aggregate
              reason codes are logged.
            </p>
          </section>

          {rows.length > 1 && (
            <section className="border rounded p-4">
              <h2 className="text-lg font-semibold mb-2">
                Other audit entries with this receipt ID ({rows.length - 1})
              </h2>
              <table className="min-w-full text-xs">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="text-left p-2">Created</th>
                    <th className="text-left p-2">Outcome</th>
                    <th className="text-left p-2">IP hash</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(1).map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2 whitespace-nowrap">
                        {new Date(r.created_at).toLocaleString()}
                      </td>
                      <td className="p-2">{r.outcome}</td>
                      <td className="p-2 font-mono break-all">
                        {r.requester_ip_hash ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function reasonDescription(code: string): string {
  switch (code) {
    case "not_in_registry":
      return "Submitted SHA-256 was well-formed but does not appear in the published evidence hash registry.";
    case "malformed_hash":
      return "Submitted value was not a valid 64-character lowercase SHA-256 hex string.";
    default:
      return "Unknown reason code.";
  }
}

function Row({
  label,
  value,
  bad,
  mono,
}: {
  label: string;
  value: string;
  bad?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="border rounded p-2 bg-white">
      <div className="text-[10px] uppercase tracking-wide text-neutral-500">
        {label}
      </div>
      <div
        className={`${mono ? "font-mono text-xs break-all" : "text-sm"} ${
          bad ? "text-red-700" : "text-neutral-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
