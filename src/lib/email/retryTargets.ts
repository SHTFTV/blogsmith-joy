/**
 * Pure helpers for the launch-broadcast retry-failed flow.
 * Kept isolated so they can be unit tested without a live Supabase.
 */

export type LogRow = {
  message_id: string | null;
  recipient_email: string | null;
  status: string | null;
  error_message?: string | null;
  created_at: string | null;
};

export type LatestByMessage = {
  email: string;
  status: string;
  error_message: string | null;
  created_at: string | null;
};

/**
 * Deduplicate log rows by `message_id`, keeping the most recent status
 * per email. `rows` is expected to be sorted `created_at DESC` — first row
 * per message_id wins.
 */
export function latestStatusPerMessage(rows: LogRow[]): Map<string, LatestByMessage> {
  const out = new Map<string, LatestByMessage>();
  for (const r of rows) {
    if (!r.message_id || !r.recipient_email) continue;
    if (out.has(r.message_id)) continue;
    out.set(r.message_id, {
      email: r.recipient_email,
      status: r.status ?? "",
      error_message: r.error_message ?? null,
      created_at: r.created_at ?? null,
    });
  }
  return out;
}

/**
 * Return the distinct set of recipient emails (lowercased) whose latest
 * send attempt is `failed` or `dlq`. Recipients that later succeeded on
 * any message_id are excluded, so a retry only targets outstanding failures.
 */
export function selectRetryRecipients(rows: LogRow[]): string[] {
  const latest = latestStatusPerMessage(rows);

  // Any recipient with a successful latest attempt is "resolved" and must
  // not be retried, even if a sibling message_id is still marked failed.
  const resolved = new Set<string>();
  for (const v of latest.values()) {
    if (v.status === "sent") resolved.add(v.email.toLowerCase());
  }

  const failed = new Set<string>();
  for (const v of latest.values()) {
    const email = v.email.toLowerCase();
    if (resolved.has(email)) continue;
    if (v.status === "failed" || v.status === "dlq") failed.add(email);
  }
  return Array.from(failed);
}

/**
 * Latest failure error message per recipient (lowercased email → error text).
 * Used for CSV export and admin UI enrichment.
 */
export function latestErrorPerRecipient(rows: LogRow[]): Map<string, string> {
  const latestPerEmail = new Map<string, LogRow>();
  for (const r of rows) {
    if (!r.recipient_email) continue;
    const email = r.recipient_email.toLowerCase();
    const prev = latestPerEmail.get(email);
    if (!prev) {
      latestPerEmail.set(email, r);
      continue;
    }
    const prevAt = prev.created_at ? Date.parse(prev.created_at) : 0;
    const curAt = r.created_at ? Date.parse(r.created_at) : 0;
    if (curAt > prevAt) latestPerEmail.set(email, r);
  }
  const out = new Map<string, string>();
  for (const [email, row] of latestPerEmail) {
    if ((row.status === "failed" || row.status === "dlq") && row.error_message) {
      out.set(email, row.error_message);
    }
  }
  return out;
}
