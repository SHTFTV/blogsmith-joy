import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getEventByCode, listApprovedUploads } from "@/lib/photo-wall.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/wall/$eventCode")({
  loader: async ({ params }) => {
    const { event } = await getEventByCode({ data: { eventCode: params.eventCode } });
    if (!event) return { event: null, uploads: [] };
    const { uploads } = await listApprovedUploads({ data: { eventId: event.id } });
    return { event, uploads };
  },
  head: ({ loaderData, params }) => ({
    meta: [
      { title: `${loaderData?.event?.couple_name ?? params.eventCode} — Photo Wall` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PublicPhotoWall,
});

type WallUpload = { id: string; photo_url: string; media_type: string; uploader_name: string | null };

function PublicPhotoWall() {
  const { event, uploads: initialUploads } = Route.useLoaderData();
  const [uploads, setUploads] = useState<WallUpload[]>(initialUploads as WallUpload[]);
  const [justArrived, setJustArrived] = useState<string | null>(null);

  // Live updates: re-pull approved photos whenever a guest photo is approved
  // (or newly submitted, in case it's auto-approved) for this event. This is
  // what makes the reception TV/projector actually update in real time
  // instead of needing a manual refresh.
  useEffect(() => {
    if (!event) return;
    const channel = supabase
      .channel(`wall:${event.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "guest_uploads",
          filter: `event_id=eq.${event.id}`,
        },
        async () => {
          const { uploads: fresh } = await listApprovedUploads({ data: { eventId: event.id } });
          setUploads((prev) => {
            const newest = fresh.find((f) => !prev.some((p) => p.id === f.id));
            if (newest) {
              setJustArrived(newest.id);
              setTimeout(() => setJustArrived(null), 3000);
            }
            return fresh;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [event]);

  if (!event) {
    return (
      <main className="grid min-h-screen place-items-center bg-black text-white">
        <p className="text-lg text-white/60">This gallery isn't live.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="px-8 py-10 text-center">
        <span className="text-3xl">🪔</span>
        <h1 className="mt-2 font-serif text-4xl">{event.couple_name}</h1>
        <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/40">
          {uploads.length} photo{uploads.length === 1 ? "" : "s"} shared by guests
        </p>
      </header>

      {uploads.length === 0 ? (
        <p className="px-8 text-center text-white/50">
          No photos yet — be the first to share one at weddings.io/g/{event.event_code}
        </p>
      ) : (
        <section className="columns-2 gap-3 px-4 pb-10 sm:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-3">
          {uploads.map((u) => (
            <figure
              key={u.id}
              className={`break-inside-avoid overflow-hidden rounded-lg transition-all duration-700 ${
                justArrived === u.id ? "ring-4 ring-primary" : ""
              }`}
            >
              {u.media_type === "video" ? (
                <video src={u.photo_url} controls muted className="w-full" />
              ) : (
                <img src={u.photo_url} alt={u.uploader_name ?? "Guest photo"} className="w-full" />
              )}
              {u.uploader_name && (
                <figcaption className="bg-white/5 px-2 py-1 text-[10px] text-white/60">
                  {u.uploader_name}
                </figcaption>
              )}
            </figure>
          ))}
        </section>
      )}
    </main>
  );
}
