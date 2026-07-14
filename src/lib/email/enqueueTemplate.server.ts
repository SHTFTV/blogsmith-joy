import * as React from "react";
import { render } from "@react-email/render";
import type { SupabaseClient } from "@supabase/supabase-js";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Weddings.io";
const SENDER_DOMAIN = "notify.weddings.io";
const FROM_DOMAIN = "weddings.io";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type EnqueueTemplateResult =
  | { success: true; queued: true; message_id: string }
  | { success: false; reason: "email_suppressed" | "template_not_found" | "enqueue_failed" | "token_failed"; message_id?: string };

/**
 * Server-only helper: render a registered template, ensure an unsubscribe
 * token, check the suppression list, and enqueue for delivery by the shared
 * queue processor (which handles retries + logging).
 *
 * Callers must be trusted server code (public webhook routes that validate
 * signup intent, or admin-verified broadcast functions). Do NOT call from
 * unauthenticated request handlers without validating the trigger first.
 */
export async function enqueueTemplateEmail(params: {
  supabase: SupabaseClient<any, any>;
  templateName: string;
  recipientEmail: string;
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  labelOverride?: string;
  metadata?: Record<string, unknown>;
}): Promise<EnqueueTemplateResult> {
  const {
    supabase,
    templateName,
    recipientEmail,
    templateData = {},
    idempotencyKey,
    labelOverride,
    metadata,
  } = params;


  const template = TEMPLATES[templateName];
  if (!template) return { success: false, reason: "template_not_found" };

  const to = template.to || recipientEmail;
  const normalized = to.toLowerCase();
  const messageId = crypto.randomUUID();
  const label = labelOverride ?? templateName;

  // Suppression check
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalized)
    .maybeSingle();
  if (suppressed) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: label,
      recipient_email: to,
      status: "suppressed",
      metadata: metadata ?? null,
    });

    return { success: false, reason: "email_suppressed", message_id: messageId };
  }

  // Ensure unsubscribe token
  const { data: existingToken } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();

  let unsubscribeToken: string;
  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    const newToken = generateToken();
    const { error: upsertError } = await supabase
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: newToken, email: normalized },
        { onConflict: "email", ignoreDuplicates: true },
      );
    if (upsertError) {
      return { success: false, reason: "token_failed", message_id: messageId };
    }
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    if (!stored?.token) {
      return { success: false, reason: "token_failed", message_id: messageId };
    }
    unsubscribeToken = stored.token;
  } else {
    // Existing token is used → address should have been suppressed. Treat as suppressed.
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: label,
      recipient_email: to,
      status: "suppressed",
    });
    return { success: false, reason: "email_suppressed", message_id: messageId };
  }

  // Render
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const resolvedSubject =
    typeof template.subject === "function"
      ? template.subject(templateData as Record<string, any>)
      : template.subject;

  // Log pending BEFORE enqueue
  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: label,
    recipient_email: to,
    status: "pending",
  });

  const { error: enqueueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: "transactional",
      label,
      idempotency_key: idempotencyKey ?? messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: label,
      recipient_email: to,
      status: "failed",
      error_message: `enqueue_failed: ${enqueueError.message}`,
    });
    return { success: false, reason: "enqueue_failed", message_id: messageId };
  }

  return { success: true, queued: true, message_id: messageId };
}
