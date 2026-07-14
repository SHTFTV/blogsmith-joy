import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

async function handleConfirm(token: string | null) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return Response.json({ ok: false, error: "server_misconfigured" }, { status: 500, headers: CORS });
  }
  if (!token || token.length < 20) {
    return Response.json({ ok: false, error: "invalid_token" }, { status: 400, headers: CORS });
  }
  const supabase = createClient(supabaseUrl, serviceKey);
  const { data, error } = await supabase.rpc("launch_notify_confirm", { p_token: token });
  if (error) {
    console.error("launch_notify_confirm error", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500, headers: CORS });
  }
  return Response.json(data ?? { ok: false, error: "invalid_token" }, { headers: CORS });
}

export const Route = createFileRoute("/api/public/launch-notify/confirm")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return handleConfirm(url.searchParams.get("token"));
      },
      POST: async ({ request }) => {
        let token: string | null = null;
        try {
          const body = await request.json();
          token = typeof body?.token === "string" ? body.token : null;
        } catch {
          token = new URL(request.url).searchParams.get("token");
        }
        return handleConfirm(token);
      },
    },
  },
});
