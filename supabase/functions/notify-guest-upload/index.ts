// supabase/functions/notify-guest-upload/index.ts
//
// Triggered by a Database Webhook on UPDATE to public.guest_uploads,
// specifically the transition into status='pending' (see README.md for
// exact webhook setup). Every submission lands as 'pending_screening'
// first and gets resolved by the moderate-guest-upload function — this
// only fires once something has actually cleared moderation and is
// waiting on the planner's review. Firing on the raw insert would mean a
// push notification for something that might get auto-rejected a moment
// later.

import webpush from "npm:web-push@3.6.7";
import { createClient } from "npm:@supabase/supabase-js@2";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Same pattern as moderate-guest-upload: without this, anyone who finds
// this function's URL can POST a fabricated payload and spam an event
// owner's phone with fake "new submission" notifications, or use spoofed
// uploader_name/couple_name text to mislead them. See that function's
// README for how this and MODERATION_WEBHOOK_SECRET are set up — they
// should be two different secret values, not shared between functions.
const WEBHOOK_SECRET = Deno.env.get("PUSH_WEBHOOK_SECRET")!;

webpush.setVapidDetails("mailto:support@weddings.io", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  try {
    const secretHeader = req.headers.get("x-webhook-secret");
    if (!WEBHOOK_SECRET || secretHeader !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    // Database Webhook payload shape for UPDATE: { type: "UPDATE", table, record, old_record, ... }
    const recordId = payload.record?.id as string | undefined;
    const claimedStatus = payload.record?.status as string | undefined;
    const oldStatus = payload.old_record?.status as string | undefined;
    if (!recordId) return new Response("No record id", { status: 400 });

    // Only notify on the specific transition into 'pending' — not every
    // update to the row (e.g. a planner's own approve/reject action would
    // also be an UPDATE, and shouldn't trigger a notification back to them).
    // old_record only exists in the webhook payload itself (Postgres doesn't
    // keep row history), so it's the only source for "what changed" — but
    // everything actually shown to the user below comes from a fresh DB
    // read, not from this payload.
    if (claimedStatus !== "pending" || oldStatus === "pending") {
      return new Response("Not a relevant transition", { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Re-fetch the row ourselves rather than trusting event_id/
    // uploader_name/media_type from the webhook payload, which could be
    // forged by anyone who has (or guesses) the webhook secret.
    const { data: record, error: fetchError } = await supabase
      .from("guest_uploads")
      .select("event_id, uploader_name, media_type, status")
      .eq("id", recordId)
      .maybeSingle();
    if (fetchError || !record || record.status !== "pending") {
      return new Response("Record not found or no longer pending", { status: 200 });
    }

    const { data: event } = await supabase
      .from("wedding_events")
      .select("owner_id, couple_name")
      .eq("id", record.event_id)
      .maybeSingle();
    if (!event) return new Response("Event not found", { status: 404 });

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", event.owner_id);
    if (!subs || subs.length === 0) return new Response("No subscriptions", { status: 200 });

    const who = record.uploader_name || "A guest";
    const kind = record.media_type === "video" ? "video" : "photo";
    const notificationPayload = JSON.stringify({
      title: "New Photo Wall submission",
      body: `${who} just shared a ${kind} for ${event.couple_name}`,
      url: "/portal/photo-wall",
    });

    const results = await Promise.allSettled(
      subs.map((s) =>
        webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          notificationPayload,
        ),
      ),
    );

    // A 404/410 from the push service means that subscription is dead
    // (browser data cleared, extension uninstalled, etc.) — clean it up so
    // we stop trying to send to it.
    const deadIds = results
      .map((r, i) => ({ r, id: subs[i].id }))
      .filter(
        ({ r }) =>
          r.status === "rejected" &&
          typeof r.reason === "object" &&
          [404, 410].includes((r.reason as { statusCode?: number })?.statusCode ?? 0),
      )
      .map(({ id }) => id);
    if (deadIds.length) {
      await supabase.from("push_subscriptions").delete().in("id", deadIds);
    }

    return new Response(
      JSON.stringify({ sent: results.filter((r) => r.status === "fulfilled").length }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
});
