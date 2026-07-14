import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/**
 * Admin-only: enqueue the "launch-live" template to every confirmed,
 * not-yet-unsubscribed subscriber in the given source list.
 *
 * Sends are queued via the shared transactional email queue, which handles
 * per-message retries, TTL, DLQ, and email_send_log recording. This function
 * only enqueues — actual delivery happens asynchronously.
 */
export const broadcastLaunchAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        source: z.string().trim().min(1).max(64).default("ppp-launch"),
        template: z.string().trim().min(1).max(64).default("launch-live"),
        dryRun: z.boolean().optional().default(false),
        ctaUrl: z.string().url().optional(),
        broadcastKey: z.string().trim().min(1).max(128).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (!isAdmin) {
      throw new Response("Forbidden", { status: 403 });
    }

    // Load active subscribers for the source (paged; there won't be huge
    // volume, but stay safe).
    const PAGE = 500;
    let offset = 0;
    const recipients: string[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: rows, error } = await supabase
        .from("launch_notify_subscribers")
        .select("email")
        .eq("source", data.source)
        .eq("confirmed", true)
        .is("unsubscribed_at", null)
        .order("created_at", { ascending: true })
        .range(offset, offset + PAGE - 1);
      if (error) throw new Response(`Failed to load subscribers: ${error.message}`, { status: 500 });
      if (!rows || rows.length === 0) break;
      for (const r of rows) if (r.email) recipients.push(r.email);
      if (rows.length < PAGE) break;
      offset += PAGE;
    }

    if (data.dryRun) {
      return {
        ok: true,
        dryRun: true,
        totalRecipients: recipients.length,
      };
    }

    // Use the admin client for the actual enqueue path (writes to
    // email_send_log and pgmq via SECURITY DEFINER RPCs).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { enqueueTemplateEmail } = await import("@/lib/email/enqueueTemplate.server");

    const broadcastKey =
      data.broadcastKey ?? `launch-${data.template}-${new Date().toISOString().slice(0, 10)}`;
    const templateData = { ctaUrl: data.ctaUrl ?? "https://weddings.io/" };

    let enqueued = 0;
    let skipped = 0;
    let failed = 0;

    for (const email of recipients) {
      const res = await enqueueTemplateEmail({
        supabase: supabaseAdmin,
        templateName: data.template,
        recipientEmail: email,
        templateData,
        // Per-recipient idempotency so a re-run doesn't double-send.
        idempotencyKey: `${broadcastKey}:${email.toLowerCase()}`,
        labelOverride: data.template,
      });
      if (res.success) enqueued++;
      else if (res.reason === "email_suppressed") skipped++;
      else failed++;
    }

    await supabaseAdmin.from("launch_broadcasts").insert({
      source: data.source,
      template_name: data.template,
      triggered_by: userId,
      total_recipients: recipients.length,
      enqueued,
      skipped,
      failed,
      notes: `broadcastKey=${broadcastKey}`,
    });

    return {
      ok: true,
      dryRun: false,
      totalRecipients: recipients.length,
      enqueued,
      skipped,
      failed,
      broadcastKey,
    };
  });
