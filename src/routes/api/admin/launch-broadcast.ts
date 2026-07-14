import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("send").default("send"),
    source: z.string().trim().min(1).max(64).default("ppp-launch"),
    template: z.string().trim().min(1).max(64).default("launch-live"),
    dryRun: z.boolean().optional().default(false),
    ctaUrl: z.string().url().optional(),
    broadcastKey: z.string().trim().min(1).max(128).optional(),
  }),
  z.object({
    mode: z.literal("retry_failed"),
    broadcastId: z.string().uuid(),
    ctaUrl: z.string().url().optional(),
  }),
]);

export const Route = createFileRoute("/api/admin/launch-broadcast")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ ok: false, error: "server_misconfigured" }, { status: 500 });
        }

        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice(7).trim();
        const supabase = createClient(supabaseUrl, serviceKey);
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser(token);
        if (authError || !user) {
          return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
        }
        const { data: isAdmin } = await supabase.rpc("has_role", {
          _user_id: user.id,
          _role: "admin",
        });
        if (!isAdmin) {
          return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
        }
        // Default mode = "send" for backwards compat.
        if (raw && typeof raw === "object" && !("mode" in raw)) {
          (raw as Record<string, unknown>).mode = "send";
        }
        let input;
        try {
          input = bodySchema.parse(raw);
        } catch {
          return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
        }

        const { enqueueTemplateEmail } = await import(
          "@/lib/email/enqueueTemplate.server"
        );

        // ------------ RETRY MODE ------------
        if (input.mode === "retry_failed") {
          const { data: broadcast, error: bErr } = await supabase
            .from("launch_broadcasts")
            .select("*")
            .eq("id", input.broadcastId)
            .maybeSingle();
          if (bErr || !broadcast) {
            return Response.json({ ok: false, error: "broadcast_not_found" }, { status: 404 });
          }

          // Latest status per message_id for this broadcast
          const { data: logRows, error: lErr } = await supabase
            .from("email_send_log")
            .select("message_id, recipient_email, status, error_message, created_at")
            .contains("metadata", { broadcast_id: broadcast.id })
            .order("created_at", { ascending: false })
            .limit(5000);
          if (lErr) {
            return Response.json(
              { ok: false, error: `log_load_failed: ${lErr.message}` },
              { status: 500 },
            );
          }

          const { selectRetryRecipients } = await import("@/lib/email/retryTargets");
          const failedEmails = selectRetryRecipients((logRows ?? []) as any);


          const retryKey = `${broadcast.broadcast_key ?? broadcast.id}:retry-${Date.now()}`;
          const templateData = { ctaUrl: input.ctaUrl ?? "https://weddings.io/" };

          let enqueued = 0;
          let skipped = 0;
          let failed = 0;
          for (const email of failedEmails) {
            const res = await enqueueTemplateEmail({
              supabase,
              templateName: broadcast.template_name,
              recipientEmail: email,
              templateData,
              idempotencyKey: `${retryKey}:${email}`,
              labelOverride: broadcast.template_name,
              metadata: {
                broadcast_id: broadcast.id,
                broadcast_key: broadcast.broadcast_key ?? null,
                retry_of: broadcast.id,
                retry_key: retryKey,
              },
            });
            if (res.success) enqueued++;
            else if (res.reason === "email_suppressed") skipped++;
            else failed++;
          }

          // Update aggregate counters
          await supabase
            .from("launch_broadcasts")
            .update({
              enqueued: (broadcast.enqueued ?? 0) + enqueued,
              skipped: (broadcast.skipped ?? 0) + skipped,
              failed: Math.max(0, (broadcast.failed ?? 0) - enqueued - skipped) + failed,
              notes:
                (broadcast.notes ?? "") +
                `\nretry@${new Date().toISOString()} attempted=${failedEmails.length} enqueued=${enqueued} skipped=${skipped} failed=${failed}`,
            })
            .eq("id", broadcast.id);

          return Response.json({
            ok: true,
            mode: "retry_failed",
            attempted: failedEmails.length,
            enqueued,
            skipped,
            failed,
            retryKey,
          });
        }

        // ------------ SEND MODE ------------
        // Load active subscribers, paged.
        const PAGE = 500;
        let offset = 0;
        const recipients: string[] = [];
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { data: rows, error } = await supabase
            .from("launch_notify_subscribers")
            .select("email")
            .eq("source", input.source)
            .eq("confirmed", true)
            .is("unsubscribed_at", null)
            .order("created_at", { ascending: true })
            .range(offset, offset + PAGE - 1);
          if (error) {
            return Response.json(
              { ok: false, error: `load_failed: ${error.message}` },
              { status: 500 },
            );
          }
          if (!rows || rows.length === 0) break;
          for (const r of rows) if (r.email) recipients.push(r.email);
          if (rows.length < PAGE) break;
          offset += PAGE;
        }

        if (input.dryRun) {
          return Response.json({
            ok: true,
            dryRun: true,
            totalRecipients: recipients.length,
          });
        }

        const broadcastKey =
          input.broadcastKey ??
          `launch-${input.template}-${new Date().toISOString().slice(0, 10)}`;
        const templateData = { ctaUrl: input.ctaUrl ?? "https://weddings.io/" };

        // Create broadcast row first so we can tag every log with broadcast_id.
        const { data: broadcastRow, error: insErr } = await supabase
          .from("launch_broadcasts")
          .insert({
            source: input.source,
            template_name: input.template,
            triggered_by: user.id,
            total_recipients: recipients.length,
            enqueued: 0,
            skipped: 0,
            failed: 0,
            broadcast_key: broadcastKey,
            notes: `broadcastKey=${broadcastKey}`,
          })
          .select()
          .single();
        if (insErr || !broadcastRow) {
          return Response.json(
            { ok: false, error: `broadcast_insert_failed: ${insErr?.message ?? "unknown"}` },
            { status: 500 },
          );
        }

        let enqueued = 0;
        let skipped = 0;
        let failed = 0;

        for (const email of recipients) {
          const res = await enqueueTemplateEmail({
            supabase,
            templateName: input.template,
            recipientEmail: email,
            templateData,
            idempotencyKey: `${broadcastKey}:${email.toLowerCase()}`,
            labelOverride: input.template,
            metadata: {
              broadcast_id: broadcastRow.id,
              broadcast_key: broadcastKey,
            },
          });
          if (res.success) enqueued++;
          else if (res.reason === "email_suppressed") skipped++;
          else failed++;
        }

        await supabase
          .from("launch_broadcasts")
          .update({ enqueued, skipped, failed })
          .eq("id", broadcastRow.id);

        return Response.json({
          ok: true,
          dryRun: false,
          broadcastId: broadcastRow.id,
          broadcastKey,
          totalRecipients: recipients.length,
          enqueued,
          skipped,
          failed,
        });
      },
    },
  },
});
