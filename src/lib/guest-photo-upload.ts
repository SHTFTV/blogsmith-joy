// Browser-only helper: validate and upload a guest's photo or video to the
// guest-photos bucket. Mirrors src/lib/vendor-photo.ts's resize approach for
// images; videos are uploaded as-is (no client-side transcoding) but capped
// at a sane size so one guest can't eat the whole event's storage budget.
import { supabase } from "@/integrations/supabase/client";
import { resizeImage } from "@/lib/vendor-photo";
import { screenImageFile } from "@/lib/content-safety";

const BUCKET = "guest-photos";
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB — plenty for a raw phone photo
const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB — a minute or two of phone video

export type MediaType = "image" | "video";

export function detectMediaType(file: File): MediaType | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  return null;
}

// Check size/type before ever touching the network. Returns a short, guest-
// facing message if the file should be rejected, or null if it's fine.
export function validateGuestFile(file: File): string | null {
  const type = detectMediaType(file);
  if (!type) return `"${file.name}" isn't a photo or video — skipped.`;
  if (type === "image" && file.size > MAX_IMAGE_BYTES) {
    return `"${file.name}" is too large (max 15MB for photos).`;
  }
  if (type === "video" && file.size > MAX_VIDEO_BYTES) {
    return `"${file.name}" is too large (max 100MB for video — try a shorter clip).`;
  }
  return null;
}

export type GuestUploadResult = {
  url: string;
  path: string;
  mediaType: MediaType;
};

export async function uploadGuestMedia(file: File, eventId: string): Promise<GuestUploadResult> {
  const validationError = validateGuestFile(file);
  if (validationError) throw new Error(validationError);

  const mediaType = detectMediaType(file)!;
  const random = Math.random().toString(36).slice(2, 8);

  if (mediaType === "image") {
    const safety = await screenImageFile(file);
    if (!safety.safe) throw new Error(safety.reason);

    const blob = await resizeImage(file);
    const path = `${eventId}/${Date.now()}-${random}.jpg`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error) throw error;
    const url = await signUrl(path);
    return { url, path, mediaType };
  }

  // Video: upload the raw file, no client-side resizing/transcoding.
  const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${eventId}/${Date.now()}-${random}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "video/mp4", upsert: false });
  if (error) throw error;
  const url = await signUrl(path);
  return { url, path, mediaType };
}

async function signUrl(path: string): Promise<string> {
  // Bucket is private; mint a long-lived signed URL so the media can still be
  // displayed (approval queue, then the public wall) without exposing the
  // whole bucket.
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
  if (error || !data) throw error ?? new Error("Could not sign URL");
  return data.signedUrl;
}
