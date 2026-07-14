// Public webhook invoked by the guest_upload_alerts_notify() database
// trigger whenever a new anomaly alert row is inserted. It looks up the
// alert row server-side (never trusting the caller's payload beyond an
// id) and fans out to Slack + email.
//
// Auth model: the POST body only carries the alert id. The handler
// re-reads the row from the database using the service role, so a
// malicious caller cannot forge alert content — the worst they can do
// is force a lookup for a non-existent id (which is a cheap no-op).
import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import * as React from "react";
import { render } from "@react-email/render";

const ADMIN_EMAIL = "partnerships@industryarmymarketing.com";
const SENDER_DOMAIN = "notify.weddings.io";
const FROM_DOMAIN = "weddings.io";

type AlertRow = {
  id: string;
  alert_type: string;
  uploader_ip_hash: string;
  event_id: string | null;
  event_count: number;
  window_start: string;
  window_end: string;
  details: Record<string, unknown>;
  created_at: string;
};

function alertHeadline(a: AlertRow): string {
  const label =
    a.alert_type === "upload_burst"
      ? "Upload burst"
      : a.alert_type === "rejection_spike"
        ? "Rejection spike"
        : a.alert_type === "cross_event_spray"
          ? "Cross-event spraying"
          : a.alert_type;
  return `[weddings.io] Guest upload alert — ${label} (${a.event_count})`;
}

function summaryLines(a: AlertRow): string[] {
  return [
    `Alert type: ${a.alert_type}`,
    `IP hash: ${a.uploader_ip_hash}`,
    `Event count: ${a.event_count}`,
    `Window: ${a.window_start} → ${a.window_end}`,
    `Details: ${JSON.stringify(a.details)}`,
    `Alert id: ${a.id}`,
  ];
}

async function postSlack(webhookUrl: string, a: AlertRow) {
  const text = [`*${alertHeadline(a)}*`, "```", ...summaryLines(a), "```"].join(
    "\n",
  );
  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch (err) {
    console.error("guest-upload-alert: slack post failed", err);
  }
}

async function enqueueEmail(
  supabase: ReturnType<typeof createClient<Database>>,
  a: AlertRow,
) {
  const subject = alertHeadline(a);
  const bodyText = summaryLines(a).join("\n");
  const html = await render(
    React.createElement(
      "div",
      { style: { fontFamily: "Arial, sans-serif", padding: "20px" } },
      React.createElement("h2", null, subject),
      React.createElement(
        "pre",
        {
          style: {
            background: "#f6f6f6",
            padding: "12px",
            border: "1px solid #e5e5e5",
            borderRadius: "6px",
            whiteSpace: "pre-wrap",
          },
        },
        bodyText,
      ),
      React.createElement(
        "p",
        null,
        React.createElement(
          "a",
          { href: "https://weddings.io/admin/guest-upload-alerts" },
          "Review alerts",
        ),
      ),
    ),
  );

  const messageId = `guest-upload-alert-${a.id}`;
  await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      to: ADMIN_EMAIL,
      from: `alerts@${SENDER_DOMAIN}`,
      from_display_domain: FROM_DOMAIN,
      subject,
      html,
      text: bodyText,
      message_id: messageId,
      idempotency_key: messageId,
      template_name: "guest-upload-alert",
      metadata: { alert_id: a.id, alert_type: a.alert_type },
    },
  });
}

export const Route = createFileRoute("/api/public/hooks/guest-upload-alert")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = process.env.SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "server_misconfigured" }, { status: 500 });
        }

        let body: { id?: string };
        try {
          body = await request.json();
        } catch {
          return Response.json({ error: "invalid_json" }, { status: 400 });
        }
        if (!body.id || typeof body.id !== "string") {
          return Response.json({ error: "missing_id" }, { status: 400 });
        }

        const supabase = createClient(supabaseUrl, serviceKey);
        const { data, error } = await supabase
          .from("guest_upload_alerts")
          .select(
            "id, alert_type, uploader_ip_hash, event_id, event_count, window_start, window_end, details, created_at",
          )
          .eq("id", body.id)
          .maybeSingle();

        if (error || !data) {
          return Response.json({ error: "not_found" }, { status: 404 });
        }
        const alert = data as AlertRow;

        const slackUrl = process.env.SLACK_ALERTS_WEBHOOK_URL;
        const sent: string[] = [];
        if (slackUrl) {
          await postSlack(slackUrl, alert);
          sent.push("slack");
        }

        try {
          await enqueueEmail(supabase, alert);
          sent.push("email");
        } catch (err) {
          console.error("guest-upload-alert: email enqueue failed", err);
        }

        return Response.json({ ok: true, channels: sent });
      },
    },
  },
});
