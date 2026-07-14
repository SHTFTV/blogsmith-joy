import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  source: z.string().trim().min(1).max(64).optional(),
  ip_hash: z.string().trim().max(128).optional().nullable(),
  user_agent: z.string().max(500).optional().nullable(),
});

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export const Route = createFileRoute("/api/public/launch-notify/signup")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseUrl || !serviceKey) {
          return Response.json({ error: "server_misconfigured" }, { status: 500, headers: CORS });
        }

        let parsed;
        try {
          parsed = bodySchema.parse(await request.json());
        } catch {
          return Response.json({ ok: false, error: "invalid_request" }, { status: 400, headers: CORS });
        }

        const supabase = createClient(supabaseUrl, serviceKey);
        const { data, error } = await supabase.rpc("launch_notify_subscribe", {
          p_email: parsed.email,
          p_source: parsed.source ?? "ppp-launch",
          p_ip_hash: parsed.ip_hash ?? null,
          p_user_agent: parsed.user_agent ?? null,
        });
        if (error) {
          console.error("launch_notify_subscribe rpc error", error);
          return Response.json({ ok: false, error: "server_error" }, { status: 500, headers: CORS });
        }
        const result = (data ?? {}) as {
          ok: boolean;
          error?: string;
          status?: string;
          confirmation_token?: string;
          email?: string;
        };
        if (!result.ok) {
          return Response.json(result, { status: 200, headers: CORS });
        }

        if (result.status === "already_confirmed") {
          return Response.json({ ok: true, status: "already_confirmed" }, { headers: CORS });
        }

        if (result.confirmation_token && result.email) {
          const origin = new URL(request.url).origin;
          const confirmUrl = `${origin}/launch/confirm?token=${encodeURIComponent(result.confirmation_token)}`;
          const { enqueueTemplateEmail } = await import("@/lib/email/enqueueTemplate.server");
          const send = await enqueueTemplateEmail({
            supabase,
            templateName: "launch-confirm",
            recipientEmail: result.email,
            templateData: { confirmUrl, email: result.email },
            idempotencyKey: `launch-confirm-${result.confirmation_token}`,
          });
          if (!send.success && send.reason === "email_suppressed") {
            return Response.json({ ok: true, status: "suppressed" }, { headers: CORS });
          }
          if (!send.success) {
            console.error("Failed to enqueue launch confirmation email", send);
            // Row is created; user can request resend. Surface a soft error.
            return Response.json({ ok: true, status: "confirmation_pending" }, { headers: CORS });
          }
        }

        return Response.json({ ok: true, status: "confirmation_sent" }, { headers: CORS });
      },
    },
  },
});
