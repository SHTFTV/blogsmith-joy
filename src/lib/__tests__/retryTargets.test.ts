import { describe, it, expect } from "vitest";
import {
  latestStatusPerMessage,
  selectRetryRecipients,
  latestErrorPerRecipient,
  type LogRow,
} from "@/lib/email/retryTargets";

// Rows are provided in created_at DESC order — matches the route query.
function rows(...items: Partial<LogRow>[]): LogRow[] {
  return items.map((i) => ({
    message_id: i.message_id ?? null,
    recipient_email: i.recipient_email ?? null,
    status: i.status ?? null,
    error_message: i.error_message ?? null,
    created_at: i.created_at ?? null,
  }));
}

describe("latestStatusPerMessage", () => {
  it("keeps the newest row per message_id (input already sorted DESC)", () => {
    const input = rows(
      { message_id: "m1", recipient_email: "a@x.com", status: "dlq", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m1", recipient_email: "a@x.com", status: "failed", created_at: "2026-07-14T11:00:00Z" },
      { message_id: "m1", recipient_email: "a@x.com", status: "pending", created_at: "2026-07-14T10:00:00Z" },
    );
    const out = latestStatusPerMessage(input);
    expect(out.size).toBe(1);
    expect(out.get("m1")?.status).toBe("dlq");
  });

  it("skips rows missing message_id or recipient_email", () => {
    const out = latestStatusPerMessage(
      rows(
        { message_id: null, recipient_email: "a@x.com", status: "sent" },
        { message_id: "m1", recipient_email: null, status: "sent" },
        { message_id: "m2", recipient_email: "b@x.com", status: "sent" },
      ),
    );
    expect(Array.from(out.keys())).toEqual(["m2"]);
  });
});

describe("selectRetryRecipients", () => {
  it("returns only recipients whose latest status is failed or dlq", () => {
    const input = rows(
      { message_id: "m1", recipient_email: "sent@x.com", status: "sent", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m2", recipient_email: "failed@x.com", status: "failed", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m3", recipient_email: "dlq@x.com", status: "dlq", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m4", recipient_email: "suppressed@x.com", status: "suppressed", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m5", recipient_email: "pending@x.com", status: "pending", created_at: "2026-07-14T12:00:00Z" },
    );
    const out = selectRetryRecipients(input).sort();
    expect(out).toEqual(["dlq@x.com", "failed@x.com"]);
  });

  it("dedupes recipients across multiple failed message_ids", () => {
    const input = rows(
      { message_id: "m1", recipient_email: "same@x.com", status: "failed", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m2", recipient_email: "SAME@x.com", status: "dlq", created_at: "2026-07-14T11:00:00Z" },
    );
    expect(selectRetryRecipients(input)).toEqual(["same@x.com"]);
  });

  it("excludes a recipient who later succeeded on another attempt", () => {
    // Prior retry succeeded on m2, even though original m1 is still marked failed.
    const input = rows(
      { message_id: "m2", recipient_email: "retry@x.com", status: "sent", created_at: "2026-07-14T13:00:00Z" },
      { message_id: "m1", recipient_email: "retry@x.com", status: "failed", created_at: "2026-07-14T12:00:00Z" },
    );
    expect(selectRetryRecipients(input)).toEqual([]);
  });

  it("uses the LATEST status per message_id (pending -> failed still retries)", () => {
    const input = rows(
      { message_id: "m1", recipient_email: "user@x.com", status: "failed", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m1", recipient_email: "user@x.com", status: "pending", created_at: "2026-07-14T11:00:00Z" },
    );
    expect(selectRetryRecipients(input)).toEqual(["user@x.com"]);
  });

  it("does not retry if latest status per message_id is pending", () => {
    // Still in-flight; must not double-enqueue.
    const input = rows(
      { message_id: "m1", recipient_email: "inflight@x.com", status: "pending", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m1", recipient_email: "inflight@x.com", status: "failed", created_at: "2026-07-14T11:00:00Z" },
    );
    expect(selectRetryRecipients(input)).toEqual([]);
  });

  it("returns empty for empty input", () => {
    expect(selectRetryRecipients([])).toEqual([]);
  });
});

describe("latestErrorPerRecipient", () => {
  it("returns the latest error message when the latest attempt failed", () => {
    const input = rows(
      { message_id: "m1", recipient_email: "u@x.com", status: "dlq", error_message: "smtp 550", created_at: "2026-07-14T12:00:00Z" },
      { message_id: "m1", recipient_email: "u@x.com", status: "failed", error_message: "smtp 421", created_at: "2026-07-14T11:00:00Z" },
    );
    const out = latestErrorPerRecipient(input);
    expect(out.get("u@x.com")).toBe("smtp 550");
  });

  it("omits recipients whose latest attempt succeeded", () => {
    const input = rows(
      { message_id: "m2", recipient_email: "u@x.com", status: "sent", created_at: "2026-07-14T13:00:00Z" },
      { message_id: "m1", recipient_email: "u@x.com", status: "failed", error_message: "smtp 421", created_at: "2026-07-14T12:00:00Z" },
    );
    expect(latestErrorPerRecipient(input).size).toBe(0);
  });
});
