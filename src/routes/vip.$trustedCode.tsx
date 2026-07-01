// Fast-track upload page for the photographer, videographer, and immediate
// family — shared only via a private link, never printed on a public QR
// code. Uploads through here skip the approval queue (auto-approved) and
// get a much higher rate limit than the general guest link.
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getEventByTrustedCode, submitGuestUpload } from "@/lib/photo-wall.functions";
import { uploadGuestMedia, validateGuestFile } from "@/lib/guest-photo-upload";

export const Route = createFileRoute("/vip/$trustedCode")({
  loader: async ({ params }) => {
    const result = await getEventByTrustedCode({ data: { trustedCode: params.trustedCode } });
    return result;
  },
  head: ({ loaderData, params }) => {
    const couple = loaderData?.event?.couple_name ?? params.trustedCode;
    return {
      meta: [
        { title: `Trusted Upload — ${couple} | Weddings.io` },
        { name: "robots", content: "noindex,nofollow" },
      ],
    };
  },
  component: TrustedUploadPage,
});

function TrustedUploadPage() {
  const { event } = Route.useLoaderData();
  const { trustedCode } = Route.useParams();
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  if (!event) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
        <div className="text-center">
          <h1 className="font-serif text-3xl">Link not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Double-check the link with the couple or their planner.
          </p>
        </div>
      </main>
    );
  }

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length || !event) return;
    setErrors([]);
    setUploading(true);

    const toUpload: File[] = [];
    const fileErrors: string[] = [];
    for (const file of files) {
      const problem = validateGuestFile(file);
      if (problem) fileErrors.push(problem);
      else toUpload.push(file);
    }
    if (fileErrors.length) setErrors(fileErrors);

    for (const file of toUpload) {
      try {
        const { url, mediaType, path } = await uploadGuestMedia(file, event.id);
        await submitGuestUpload({
          data: {
            eventId: event.id,
            photoUrl: url,
            mediaType,
            storagePath: path,
            uploaderName: name || undefined,
            trustedCode: trustedCode,
          },
        });
        setDone((d) => d + 1);
      } catch (err) {
        setErrors((prev) => [
          ...prev,
          `"${file.name}" failed to upload: ${err instanceof Error ? err.message : "unknown error"}`,
        ]);
      }
    }

    setUploading(false);
    e.target.value = "";
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="text-center">
          <span className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
            ✓ Trusted Uploader
          </span>
          <h1 className="mt-3 font-serif text-3xl">{event.couple_name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            No planner approval wait — your uploads go live moments after a quick automatic safety
            check. Batch-upload as many as you need.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Your name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Raj Kapoor Photography"
              className="rounded-md border border-border bg-secondary px-3 py-2"
            />
          </label>

          <label className="cursor-pointer rounded-lg border-2 border-dashed border-primary bg-primary/5 p-10 text-center hover:bg-primary/10">
            {uploading ? (
              <span className="text-sm text-muted-foreground">Uploading…</span>
            ) : (
              <span className="text-sm font-bold text-primary">📸 Tap to add photos or video</span>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={onFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-center text-[11px] text-muted-foreground">
            Photos up to 15MB · videos up to 100MB · no batch limit
            <br />
            Videos may keep your phone's location data — turn off location
            tagging in your camera app first if that matters to you.
          </p>

          {done > 0 && (
            <p className="rounded-md border border-primary bg-primary/5 p-3 text-center text-sm text-primary">
              ✓ {done} item{done > 1 ? "s" : ""} uploaded — live on the gallery wall in a moment
            </p>
          )}
          {errors.length > 0 && (
            <div className="rounded-md border border-destructive bg-destructive/5 p-3">
              {errors.map((err, i) => (
                <p key={i} className="text-xs text-destructive">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
