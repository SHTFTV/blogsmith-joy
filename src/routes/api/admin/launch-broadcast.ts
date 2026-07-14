import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  source: z.string().trim().min(1).max(64).default("ppp-launch"),
  template: z.string().trim().min(1).max(64).default("launch-live"),
  dryRun: z.boolean().optional().default(false),
  ctaUrl: z.string().url().optional(),
  broadcastKey: z.string().trim().min(1).max(128).optional(),
});

export const Route = createFileRoute("/api/admin/launch-broadcast")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ ok: false, error: "server_misconfigured" }, { status: 500 });
        }

        // Verify admin caller via bearer JWT (same pattern as
        // /lovable/email/transactional/send)
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

        let input;
        try {
          input = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
        }

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

        const { enqueueTemplateEmail } = await import(
          "@/lib/email/enqueueTemplate.server"
        );
        const broadcastKey =
          input.broadcastKey ??
          `launch-${input.template}-${new Date().toISOString().slice(0, 10)}`;
        const templateData = { ctaUrl: input.ctaUrl ?? "https://weddings.io/" };

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
          });
          if (res.success) enqueued++;
          else if (res.reason === "email_suppressed") skipped++;
          else failed++;
        }

        await supabase.from("launch_broadcasts").insert({
          source: input.source,
          template_name: input.template,
          triggered_by: user.id,
          total_recipients: recipients.length,
          enqueued,
          skipped,
          failed,
          notes: `broadcastKey=${broadcastKey}`,
        });

        return Response.json({
          ok: true,
          dryRun: false,
          totalRecipients: recipients.length,
          enqueued,
          skipped,
          failed,
          broadcastKey,
        });
      },
    },
  },
});
