import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

function publicClient() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export type WeddingEvent = {
  id: string;
  event_code: string;
  couple_name: string;
  active: boolean;
};

export type GuestUpload = {
  id: string;
  event_id: string;
  uploader_name: string | null;
  photo_url: string;
  media_type: "image" | "video";
  storage_path: string | null;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
};

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 24);
}

function getClientIp(): string {
  const request = getRequest();
  const forwarded = request?.headers.get("x-forwarded-for");
  // x-forwarded-for can be a comma-separated chain; the first entry is the
  // original client closest to the edge.
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

// Look up an active event by its guest-facing code, e.g. "SINGH2025".
export const getEventByCode = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ eventCode: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    // Goes through a security-definer RPC so the wedding_events table
    // cannot be enumerated via the public REST API — the caller must
    // already know the exact event_code.
    const { data: rows, error } = await supabase.rpc("get_event_by_code", {
      code: data.eventCode.toUpperCase(),
    });
    if (error) throw new Error(error.message);
    const event = rows?.[0] ?? null;
    return { event: event as WeddingEvent | null };
  });

// Look up an active event by its private trusted code, e.g. for the
// photographer/videographer/immediate-family fast-track link. Goes through
// a security-definer database function rather than a direct table select —
// see migration 20260701d for why (prevents the code from being listable
// via the public REST API).
export const getEventByTrustedCode = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ trustedCode: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: rows, error } = await supabase.rpc("get_event_by_trusted_code", {
      code: data.trustedCode,
    });
    if (error) throw new Error(error.message);
    const event = rows?.[0] ?? null;
    return { event: event as { id: string; couple_name: string; active: boolean } | null };
  });

// Insert a guest photo or video row after the file itself has already been
// uploaded to storage. `trustedCode`, if provided, is verified server-side
// against the event's real trusted_code inside submit_guest_upload() —
// see migration 20260701f. We deliberately do NOT accept a plain
// `trusted: boolean` here: a client-supplied flag can't be trusted, since
// this same insert path (the underlying RPC) is reachable directly via the
// public anon key, not just through this server function.
export const submitGuestUpload = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        eventId: z.string().uuid(),
        photoUrl: z.string().url(),
        mediaType: z.enum(["image", "video"]).default("image"),
        storagePath: z.string().optional(),
        uploaderName: z.string().max(100).optional(),
        trustedCode: z.string().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const ip = getClientIp();
    const ipHash = await hashIp(ip);

    // submit_guest_upload() is a SECURITY DEFINER function: it re-verifies
    // the event is active, verifies trustedCode against the real value
    // itself (never trusting a caller's say-so), enforces the rate limit,
    // and unconditionally writes status = 'pending_screening'. All of that
    // happens inside the DB, so it holds even if someone calls the
    // underlying RPC directly instead of going through this server
    // function. See migration 20260701f for the full rationale.
    const supabase = publicClient();
    const { error } = await supabase.rpc("submit_guest_upload", {
      p_event_id: data.eventId,
      p_photo_url: data.photoUrl,
      p_media_type: data.mediaType,
      p_storage_path: data.storagePath ?? null,
      p_uploader_name: data.uploaderName ?? null,
      p_uploader_ip_hash: ipHash,
      p_trusted_code: data.trustedCode ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Approved photos/videos only — public gallery / display wall.
export const listApprovedUploads = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ eventId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: uploads, error } = await supabase
      .from("guest_uploads")
      .select(
        "id, event_id, uploader_name, photo_url, media_type, storage_path, status, submitted_at",
      )
      .eq("event_id", data.eventId)
      .eq("status", "approved")
      .order("submitted_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { uploads: (uploads ?? []) as GuestUpload[] };
  });
