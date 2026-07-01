// supabase/functions/moderate-guest-upload/index.ts
//
// Triggered by a Database Webhook on INSERT to public.guest_uploads (see
// README.md in this folder for exact setup). Every new submission lands as
// 'pending_screening' — invisible everywhere — until this function decides
// its real status:
//   - flagged as explicit  -> 'rejected', storage file deleted
//   - safe + trusted upload -> 'approved' (live on the wall immediately)
//   - safe + regular guest  -> 'pending' (goes to the planner's review queue)
//
// Uses Sightengine (sightengine.com) — a paid API, not the free client-side
// nsfwjs screening that still runs first in the browser. That client-side
// pass is a fast UX nicety (rejects obvious cases before a guest even
// uploads); this is the real, authoritative, server-side check — it also
// covers video, which the free client-side approach never could.

import { createClient } from "npm:@supabase/supabase-js@2";

const SIGHTENGINE_API_USER = Deno.env.get("SIGHTENGINE_API_USER")!;
const SIGHTENGINE_API_SECRET = Deno.env.get("SIGHTENGINE_API_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Shared secret configured on both sides: as a custom header on the
// Database Webhook (Supabase dashboard -> Database -> Webhooks -> this
// webhook -> HTTP Headers), and as this function's env var. Without this,
// anyone who finds this function's URL can POST a fabricated payload
// directly and force any upload's status — see README for setup.
const WEBHOOK_SECRET = Deno.env.get("MODERATION_WEBHOOK_SECRET")!;

// Models: nudity-2.1 covers the "porn blocker" ask directly. gore-2.0 is
// included too since "keep the wedding gallery safe" reasonably extends to
// graphic violence, not just nudity — easy to trim back to nudity-2.1 alone
// if you'd rather keep it narrowly scoped.
const MODELS = "nudity-2.1,gore-2.0";

// How confident Sightengine must be before we block. Sightengine's nudity
// model returns several sub-scores (sexual_activity, sexual_display,
// erotica, etc.) rather than one single number — we block if any of the
// clearly-explicit categories crosses this threshold. "suggestive" (bikini
// photos, cleavage, etc.) is deliberately NOT included — that's normal
// wedding photography, not something to block.
const BLOCK_THRESHOLD = 0.7;
const EXPLICIT_NUDITY_FIELDS = ["sexual_activity", "sexual_display", "erotica", "sextoy"];

type NudityScores = Record<string, number>;

function isFlagged(nudity: NudityScores | undefined, gore: { prob?: number } | undefined): boolean {
  if (nudity) {
    for (const field of EXPLICIT_NUDITY_FIELDS) {
      if ((nudity[field] ?? 0) > BLOCK_THRESHOLD) return true;
    }
  }
  if (gore?.prob !== undefined && gore.prob > BLOCK_THRESHOLD) return true;
  return false;
}

async function checkImage(url: string) {
  const params = new URLSearchParams({
    url,
    models: MODELS,
    api_user: SIGHTENGINE_API_USER,
    api_secret: SIGHTENGINE_API_SECRET,
  });
  const res = await fetch(`https://api.sightengine.com/1.0/check.json?${params}`);
  const json = await res.json();
  return isFlagged(json.nudity, json.gore);
}

async function checkVideo(url: string) {
  const params = new URLSearchParams({
    stream_url: url,
    models: MODELS,
    api_user: SIGHTENGINE_API_USER,
    api_secret: SIGHTENGINE_API_SECRET,
  });
  // video/check-sync.json processes the whole video before responding —
  // this is a real synchronous HTTP call, not a webhook/polling job, which
  // is exactly why Sightengine was the pick over AWS/Google for video.
  const res = await fetch(`https://api.sightengine.com/1.0/video/check-sync.json?${params}`);
  const json = await res.json();
  const frames = json.data?.frames ?? [];
  // Flag the whole video if ANY sampled frame is flagged.
  return frames.some((f: { nudity?: NudityScores; gore?: { prob?: number } }) =>
    isFlagged(f.nudity, f.gore),
  );
}

Deno.serve(async (req) => {
  try {
    const secretHeader = req.headers.get("x-webhook-secret");
    if (!WEBHOOK_SECRET || secretHeader !== WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const payload = await req.json();
    const recordId = payload.record?.id as string | undefined;
    if (!recordId) {
      return new Response("Missing record id", { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Re-fetch the row ourselves rather than trusting photo_url/media_type/
    // auto_approved from the webhook payload. A payload can be forged by
    // anyone who has (or guesses) the webhook secret's absence — re-reading
    // from the DB means the only thing that could ever be scanned or acted
    // on is what's actually stored, not whatever a caller claims it is.
    const { data: record, error: fetchError } = await supabase
      .from("guest_uploads")
      .select("id, photo_url, media_type, storage_path, auto_approved, status")
      .eq("id", recordId)
      .maybeSingle();

    if (fetchError || !record) {
      return new Response("Record not found", { status: 404 });
    }

    if (record.status !== "pending_screening") {
      // Only act on fresh submissions — ignore webhook re-fires on updates.
      return new Response("Nothing to do", { status: 200 });
    }

    let flagged = false;
    try {
      flagged =
        record.media_type === "video"
          ? await checkVideo(record.photo_url)
          : await checkImage(record.photo_url);
    } catch (err) {
      // If Sightengine itself is unreachable/erroring, fail OPEN — same
      // philosophy as the client-side screening. A missed automated check
      // is better than every upload silently getting stuck in
      // 'pending_screening' forever because of an API outage. The planner's
      // manual review is still the backstop for non-trusted uploads either
      // way.
      console.error("Sightengine check failed, allowing through:", err);
    }

    const newStatus = flagged ? "rejected" : record.auto_approved ? "approved" : "pending";

    await supabase
      .from("guest_uploads")
      .update({ status: newStatus, reviewed_at: new Date().toISOString() })
      .eq("id", record.id);

    if (flagged && record.storage_path) {
      const { error: removeError } = await supabase.storage
        .from("guest-photos")
        .remove([record.storage_path]);
      if (removeError) {
        console.error("Could not delete flagged file from storage:", removeError.message);
      }
    }

    return new Response(JSON.stringify({ status: newStatus, flagged }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(String(err), { status: 500 });
  }
});
