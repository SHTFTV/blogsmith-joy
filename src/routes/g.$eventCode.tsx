import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getEventByCode, submitGuestUpload } from "@/lib/photo-wall.functions";
import { uploadGuestMedia, validateGuestFile } from "@/lib/guest-photo-upload";

export const Route = createFileRoute("/g/$eventCode")({
  loader: async ({ params }) => {
    const result = await getEventByCode({ data: { eventCode: params.eventCode } });
    return result;
  },
  head: ({ loaderData, params }) => {
    const couple = loaderData?.event?.couple_name ?? params.eventCode;
    return {
      meta: [
        { title: `Share Your Photos — ${couple} | Weddings.io` },
        { name: "robots", content: "noindex,nofollow" },
      ],
    };
  },
  component: GuestUploadPage,
});

function GuestUploadPage() {
  const { event } = Route.useLoaderData();
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  if (!event) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
        <div className="text-center">
          <h1 className="font-serif text-3xl">Code not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Double-check the code from your invite, or ask the couple for the right link.
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

    // Validate everything up front so a guest sees all problems at once,
    // rather than failing halfway through a batch upload.
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
          <span>🪔</span>
          <h1 className="mt-3 font-serif text-3xl">{event.couple_name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Share a photo or short video from today. The couple approves everything before it
            appears on the gallery wall.
          </p>
        </div>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-1 text-sm">
            <span className="font-bold uppercase tracking-wider text-muted-foreground">
              Your name (optional)
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jamie"
              className="rounded-md border border-border bg-secondary px-3 py-2"
            />
          </label>

          <label className="cursor-pointer rounded-lg border-2 border-dashed border-border bg-secondary p-10 text-center hover:border-primary">
            {uploading ? (
              <span className="text-sm text-muted-foreground">Uploading…</span>
            ) : (
              <span className="text-sm font-bold text-primary">📸 Tap to add photos or video</span>
            )}
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              capture="environment"
              onChange={onFiles}
              disabled={uploading}
              className="hidden"
            />
          </label>
          <p className="text-center text-[11px] text-muted-foreground">
            Photos up to 15MB · videos up to 100MB
            <br />
            Videos may keep your phone's location data — turn off location
            tagging in your camera app first if that matters to you.
          </p>

          {done > 0 && (
            <p className="rounded-md border border-primary bg-primary/5 p-3 text-center text-sm text-primary">
              ✓ {done} item{done > 1 ? "s" : ""} sent — waiting on approval
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
