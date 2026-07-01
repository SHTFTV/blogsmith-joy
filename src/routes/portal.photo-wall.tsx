import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateGuestQrCode } from "@/lib/guest-qr-code";
import { subscribeToPush, isPushSupported } from "@/lib/push-subscribe";

type EventRow = { id: string; event_code: string; couple_name: string; trusted_code: string | null };
type Upload = {
  id: string;
  uploader_name: string | null;
  photo_url: string;
  media_type: "image" | "video";
  storage_path: string | null;
  status: "pending_screening" | "pending" | "approved" | "rejected";
  submitted_at: string;
};

export const Route = createFileRoute("/portal/photo-wall")({
  head: () => ({
    meta: [{ title: "Photo Wall | Weddings.io" }, { name: "robots", content: "noindex,nofollow" }],
  }),
  component: PhotoWallDashboard,
});

// Short synthesized beep via the Web Audio API — no sound file to host.
function playBeep() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Best-effort only — a failed beep should never break the upload flow.
  }
}

let originalTitle: string | null = null;

function notifyNewUpload(coupleName: string, upload: { uploader_name: string | null }) {
  const who = upload.uploader_name || "A guest";
  const body = `${who} just shared a photo for ${coupleName}`;

  if (typeof Notification !== "undefined" && Notification.permission === "granted") {
    new Notification("New Photo Wall submission", { body, icon: "/favicon.svg" });
  }

  playBeep();

  // Flash the tab title so it's noticeable even without OS notification
  // permission (e.g. permission denied, or Notification API unsupported).
  if (typeof document !== "undefined") {
    if (originalTitle === null) originalTitle = document.title;
    document.title = "📸 New photo! — " + originalTitle;
    setTimeout(() => {
      if (originalTitle !== null) document.title = originalTitle;
    }, 4000);
  }
}

function PhotoWallDashboard() {
  const [status, setStatus] = useState<"loading" | "signed-out" | "ok">("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [activeEvent, setActiveEvent] = useState<EventRow | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [filter, setFilter] = useState<
    "pending" | "pending_screening" | "approved" | "rejected" | "all"
  >("pending");
  const [busy, setBusy] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newCoupleName, setNewCoupleName] = useState("");
  const [newEventCode, setNewEventCode] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setStatus("signed-out");
        return;
      }
      setUserId(u.user.id);
      await loadEvents(u.user.id);
      setStatus("ok");
    })();
  }, []);

  async function loadEvents(ownerId: string) {
    const { data, error } = await supabase
      .from("wedding_events")
      .select("id, event_code, couple_name, trusted_code")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });
    if (!error && data) {
      setEvents(data);
      setActiveEvent((prev) => prev ?? data[0] ?? null);
    }
  }

  useEffect(() => {
    if (!activeEvent) return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvent, filter]);

  // Live updates: when a guest submits a new photo for the active event,
  // refresh the queue automatically instead of waiting for a manual reload.
  // Also fires a browser notification (+ a short beep) so the planner
  // notices even if this tab isn't in focus during the reception.
  //
  // Notification fires on the UPDATE that moves something OUT of
  // 'pending_screening' into 'pending' — not on the raw INSERT — because
  // every submission now lands as pending_screening first (see migration
  // 20260701e) and isn't actually actionable by the planner until Sightengine
  // has cleared it. Notifying on the raw insert would mean a beep for
  // something that might get auto-rejected a second later.
  useEffect(() => {
    if (!activeEvent) return;
    const channel = supabase
      .channel(`guest_uploads:${activeEvent.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "guest_uploads",
          filter: `event_id=eq.${activeEvent.id}`,
        },
        () => refresh(),
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "guest_uploads",
          filter: `event_id=eq.${activeEvent.id}`,
        },
        (payload) => {
          const row = payload.new as { status: string; uploader_name: string | null };
          if (row.status === "pending") {
            notifyNewUpload(activeEvent.couple_name, row);
          }
          refresh();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvent, filter]);

  // Ask for notification permission once, the first time there's an active
  // event to manage — not on page load, so it's tied to an actual reason.
  useEffect(() => {
    if (!activeEvent) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [activeEvent]);

  const [qrCode, setQrCode] = useState<string | null>(null);
  useEffect(() => {
    if (!activeEvent) {
      setQrCode(null);
      return;
    }
    generateGuestQrCode(activeEvent.event_code).then(setQrCode);
  }, [activeEvent]);

  async function refresh() {
    if (!activeEvent) return;
    let q = supabase
      .from("guest_uploads")
      .select("id, uploader_name, photo_url, media_type, storage_path, status, submitted_at")
      .eq("event_id", activeEvent.id)
      .order("submitted_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      console.error(error);
      return;
    }
    setUploads((data ?? []) as Upload[]);
  }

  async function review(u: Upload, decision: "approved" | "rejected") {
    setBusy(u.id);
    const { data: session } = await supabase.auth.getUser();
    await supabase
      .from("guest_uploads")
      .update({
        status: decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user?.id,
      })
      .eq("id", u.id);

    // Rejected media doesn't need to sit in storage forever — clean it up
    // now instead of leaving it as a silent, growing cost. Approved/pending
    // files are left alone (approved ones are in use; pending ones might
    // still be approved later).
    if (decision === "rejected" && u.storage_path) {
      const { error: removeError } = await supabase.storage
        .from("guest-photos")
        .remove([u.storage_path]);
      if (removeError) {
        // Non-fatal: the row is already marked rejected either way, this
        // just means the file lingers in storage until cleaned up manually.
        console.error("Could not delete rejected file from storage:", removeError.message);
      }
    }

    setBusy(null);
    refresh();
  }

  const [sweeping, setSweeping] = useState(false);
  const [sweepResult, setSweepResult] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<"idle" | "subscribing" | "on" | "unsupported">(
    "idle",
  );
  const [pushError, setPushError] = useState<string | null>(null);

  useEffect(() => {
    isPushSupported().then((supported) => {
      if (!supported) setPushStatus("unsupported");
    });
  }, []);

  async function enablePush() {
    if (!userId) return;
    setPushStatus("subscribing");
    setPushError(null);
    const result = await subscribeToPush(userId);
    if (result.ok) {
      setPushStatus("on");
    } else {
      setPushStatus("idle");
      setPushError(result.error ?? "Couldn't enable push notifications.");
    }
  }

  // Find storage files that never got a matching guest_uploads row — this
  // happens if a guest's upload succeeded but the database insert failed
  // right after (dropped connection, closed tab mid-submission). Those files
  // are invisible to the review queue but still cost storage forever unless
  // something removes them.
  async function sweepOrphanedFiles() {
    if (!activeEvent) return;
    setSweeping(true);
    setSweepResult(null);
    try {
      const { data: files, error: listError } = await supabase.storage
        .from("guest-photos")
        .list(activeEvent.id, { limit: 1000 });
      if (listError) throw listError;

      const { data: rows, error: rowsError } = await supabase
        .from("guest_uploads")
        .select("storage_path")
        .eq("event_id", activeEvent.id);
      if (rowsError) throw rowsError;

      const knownPaths = new Set((rows ?? []).map((r) => r.storage_path).filter(Boolean));
      const orphans = (files ?? [])
        .map((f) => `${activeEvent.id}/${f.name}`)
        .filter((path) => !knownPaths.has(path));

      if (orphans.length === 0) {
        setSweepResult("No orphaned files found — storage matches the review queue.");
      } else {
        const { error: removeError } = await supabase.storage.from("guest-photos").remove(orphans);
        if (removeError) throw removeError;
        setSweepResult(`Removed ${orphans.length} orphaned file${orphans.length > 1 ? "s" : ""}.`);
      }
    } catch (err) {
      setSweepResult(err instanceof Error ? `Sweep failed: ${err.message}` : "Sweep failed.");
    } finally {
      setSweeping(false);
    }
  }

  function suggestEventCode(coupleName: string) {
    const cleaned = coupleName
      .replace(/&/g, "and")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .split(/\s+/)
      .filter(Boolean)
      .join("")
      .toUpperCase();
    return `${cleaned.slice(0, 12)}${new Date().getFullYear()}`;
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    const coupleName = newCoupleName.trim();
    const code = (newEventCode.trim() || suggestEventCode(coupleName)).toUpperCase();
    if (!coupleName) {
      setCreateError("Enter the couple's name.");
      return;
    }
    if (!/^[A-Z0-9]{3,20}$/.test(code)) {
      setCreateError("Event code should be 3–20 letters/numbers, no spaces or symbols.");
      return;
    }
    setCreating(true);
    setCreateError(null);
    const { data, error } = await supabase
      .from("wedding_events")
      .insert({ couple_name: coupleName, event_code: code, owner_id: userId })
      .select("id, event_code, couple_name, trusted_code")
      .single();
    setCreating(false);
    if (error) {
      setCreateError(
        error.message.includes("duplicate")
          ? `The code "${code}" is already taken — try another.`
          : error.message,
      );
      return;
    }
    setEvents((prev) => [data as EventRow, ...prev]);
    setActiveEvent(data as EventRow);
    setNewCoupleName("");
    setNewEventCode("");
    setShowCreateForm(false);
  }

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </main>
    );
  }

  if (status === "signed-out") {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="font-serif text-3xl">Sign in to manage your Photo Wall</h1>
          <a href="/auth" className="mt-6 inline-block text-primary underline">
            Sign in →
          </a>
        </div>
      </main>
    );
  }

  if (!events.length) {
    return (
      <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
        <div className="w-full max-w-md">
          <h1 className="text-center font-serif text-3xl">Set up your Photo Wall</h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            One event, one guest link, one gallery wall. Takes a few seconds.
          </p>
          <CreateEventForm
            coupleName={newCoupleName}
            setCoupleName={setNewCoupleName}
            eventCode={newEventCode}
            setEventCode={setNewEventCode}
            error={createError}
            creating={creating}
            onSubmit={createEvent}
            suggestEventCode={suggestEventCode}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-5 py-6 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {events.length > 1 ? (
                <select
                  value={activeEvent?.id}
                  onChange={(e) =>
                    setActiveEvent(events.find((ev) => ev.id === e.target.value) ?? null)
                  }
                  className="rounded-md border border-border bg-secondary px-3 py-2 font-serif text-2xl"
                >
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.couple_name}
                    </option>
                  ))}
                </select>
              ) : (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                    Photo Wall
                  </p>
                  <h1 className="mt-1 font-serif text-3xl">{activeEvent?.couple_name}</h1>
                </div>
              )}
              <button
                onClick={() => setShowCreateForm((v) => !v)}
                className="rounded-md border border-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary"
              >
                + New Event
              </button>
            </div>
            <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
              {(["pending", "pending_screening", "approved", "rejected", "all"] as const).map(
                (f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`rounded-md border px-3 py-1.5 ${
                      filter === f
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                    }`}
                  >
                    {f}
                  </button>
                ),
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-start gap-4">
            <p className="text-xs text-muted-foreground">
              Guest link:{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5">
                weddings.io/g/{activeEvent?.event_code}
              </code>
              {" · "}
              Display wall:{" "}
              <code className="rounded bg-secondary px-1.5 py-0.5">
                weddings.io/wall/{activeEvent?.event_code}
              </code>
            </p>
            {qrCode && activeEvent && (
              <div className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
                <img src={qrCode} alt="Guest upload QR code" className="size-14" />
                <a
                  href={qrCode}
                  download={`${activeEvent.event_code}-photo-wall-qr.png`}
                  className="text-[10px] font-bold uppercase tracking-wider text-primary underline"
                >
                  Download QR ↓
                </a>
              </div>
            )}
            <div className="flex flex-col items-start gap-1">
              <button
                onClick={sweepOrphanedFiles}
                disabled={sweeping}
                className="rounded-md border border-border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50"
              >
                {sweeping ? "Sweeping…" : "🧹 Sweep orphaned files"}
              </button>
              {sweepResult && <p className="text-[10px] text-muted-foreground">{sweepResult}</p>}
            </div>
            {pushStatus !== "unsupported" && (
              <div className="flex flex-col items-start gap-1">
                <button
                  onClick={enablePush}
                  disabled={pushStatus === "subscribing" || pushStatus === "on"}
                  className={`rounded-md border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider disabled:opacity-70 ${
                    pushStatus === "on"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {pushStatus === "on"
                    ? "🔔 Push notifications on"
                    : pushStatus === "subscribing"
                      ? "Enabling…"
                      : "🔔 Enable push notifications"}
                </button>
                {pushError && <p className="text-[10px] text-destructive">{pushError}</p>}
              </div>
            )}
          </div>
          {activeEvent?.trusted_code && (
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-bold text-primary">Trusted link</span> (photographer,
              videographer, immediate family — auto-approved, no queue, no rate limit):{" "}
              <code className="rounded bg-primary/10 px-1.5 py-0.5 text-primary">
                weddings.io/vip/{activeEvent.trusted_code}
              </code>
              <span className="ml-1 text-[10px]">
                — share privately, don't put this on the public QR sign
              </span>
            </p>
          )}
          {showCreateForm && (
            <div className="mt-4 max-w-md rounded-lg border border-border bg-card p-4">
              <CreateEventForm
                coupleName={newCoupleName}
                setCoupleName={setNewCoupleName}
                eventCode={newEventCode}
                setEventCode={setNewEventCode}
                error={createError}
                creating={creating}
                onSubmit={createEvent}
                suggestEventCode={suggestEventCode}
              />
            </div>
          )}
        </div>
      </header>

      <section className="px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {uploads.length === 0 && (
            <p className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              No {filter === "all" ? "" : filter} photos yet.
            </p>
          )}
          {uploads.map((u) => (
            <article key={u.id} className="overflow-hidden rounded-lg border border-border bg-card">
              {u.media_type === "video" ? (
                <video
                  src={u.photo_url}
                  controls
                  className="aspect-square w-full bg-black object-cover"
                />
              ) : (
                <img
                  src={u.photo_url}
                  alt={u.uploader_name ?? "Guest photo"}
                  className="aspect-square w-full object-cover"
                />
              )}
              <div className="p-3">
                <p className="truncate text-xs font-bold text-foreground">
                  {u.uploader_name || "Anonymous guest"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(u.submitted_at).toLocaleString()}
                </p>
                {u.status === "pending" ? (
                  <div className="mt-2 flex gap-1.5">
                    <button
                      onClick={() => review(u, "approved")}
                      disabled={busy === u.id}
                      className="flex-1 rounded-md bg-primary py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={() => review(u, "rejected")}
                      disabled={busy === u.id}
                      className="flex-1 rounded-md border border-destructive py-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                    >
                      ✗
                    </button>
                  </div>
                ) : (
                  <span
                    className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      u.status === "approved"
                        ? "border border-primary bg-primary/10 text-primary"
                        : "border border-destructive bg-destructive/10 text-destructive"
                    }`}
                  >
                    {u.status}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function CreateEventForm({
  coupleName,
  setCoupleName,
  eventCode,
  setEventCode,
  error,
  creating,
  onSubmit,
  suggestEventCode,
}: {
  coupleName: string;
  setCoupleName: (v: string) => void;
  eventCode: string;
  setEventCode: (v: string) => void;
  error: string | null;
  creating: boolean;
  onSubmit: (e: React.FormEvent) => void;
  suggestEventCode: (name: string) => string;
}) {
  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4">
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">
          Couple's name
        </span>
        <input
          value={coupleName}
          onChange={(e) => setCoupleName(e.target.value)}
          placeholder="Priya & Arjun"
          className="rounded-md border border-border bg-secondary px-3 py-2"
          autoFocus
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">
          Guest event code
        </span>
        <input
          value={eventCode}
          onChange={(e) => setEventCode(e.target.value.toUpperCase())}
          placeholder={coupleName ? suggestEventCode(coupleName) : "SINGH2026"}
          className="rounded-md border border-border bg-secondary px-3 py-2 font-mono uppercase"
        />
        <span className="text-xs text-muted-foreground">
          What guests type or scan — leave blank to auto-generate from the couple's name.
        </span>
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={creating}
        className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
      >
        {creating ? "Creating…" : "Create event"}
      </button>
    </form>
  );
}
