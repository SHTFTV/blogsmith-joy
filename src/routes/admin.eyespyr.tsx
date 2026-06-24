import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Submission = {
  id: string;
  vendor_id: string;
  user_id: string;
  photos: string[];
  city: string | null;
  category: string | null;
  notes: string | null;
  status: string;
  submitted_at: string;
  vendors?: {
    slug: string;
    business_name: string;
    verified: boolean;
  } | null;
};

export const Route = createFileRoute("/admin/eyespyr")({
  head: () => ({
    meta: [
      { title: "EyeSpyR Admin Review" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminEyeSpyR,
});

function AdminEyeSpyR() {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filter, setFilter] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        setStatus("denied");
        return;
      }
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: u.user.id,
        _role: "admin",
      });
      setStatus(isAdmin ? "ok" : "denied");
    })();
  }, []);

  useEffect(() => {
    if (status !== "ok") return;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filter]);

  async function refresh() {
    let q = supabase
      .from("eyespyr_submissions")
      .select("*, vendors(slug, business_name, verified)")
      .order("submitted_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data, error } = await q;
    if (error) {
      console.error(error);
      return;
    }
    setSubmissions((data ?? []) as Submission[]);
  }

  async function review(s: Submission, decision: "verified" | "rejected") {
    setBusy(s.id);
    const { data: u } = await supabase.auth.getUser();
    await supabase
      .from("eyespyr_submissions")
      .update({
        status: decision,
        reviewed_at: new Date().toISOString(),
        reviewed_by: u.user?.id,
      })
      .eq("id", s.id);
    if (decision === "verified") {
      await supabase
        .from("vendors")
        .update({ verified: true, updated_at: new Date().toISOString() })
        .eq("id", s.vendor_id);
    }
    setBusy(null);
    refresh();
  }

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Checking access…</p>
      </main>
    );
  }
  if (status === "denied") {
    return (
      <main className="grid min-h-screen place-items-center bg-background text-foreground">
        <div className="text-center">
          <h1 className="font-serif text-3xl">Admin access required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with an admin account to review EyeSpyR submissions.
          </p>
          <a href="/auth" className="mt-6 inline-block text-primary underline">
            Sign in →
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-5 py-6 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              EyeSpyR Admin
            </p>
            <h1 className="mt-1 font-serif text-3xl">Verification Submissions</h1>
          </div>
          <div className="flex gap-2 text-xs font-bold uppercase tracking-wider">
            {(["pending", "verified", "rejected", "all"] as const).map((f) => (
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
            ))}
          </div>
        </div>
      </header>

      <section className="px-5 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl gap-4">
          {submissions.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              No {filter === "all" ? "" : filter} submissions.
            </p>
          )}
          {submissions.map((s) => (
            <article
              key={s.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-xl">
                    {s.vendors?.business_name ?? "Unknown vendor"}{" "}
                    {s.vendors?.verified && (
                      <span className="ml-2 rounded-full border border-primary bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        ✓ Verified
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {s.city} · {s.category} · submitted{" "}
                    {new Date(s.submitted_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
                    s.status === "pending"
                      ? "border border-border bg-secondary text-muted-foreground"
                      : s.status === "verified"
                        ? "border border-primary bg-primary/10 text-primary"
                        : "border border-destructive bg-destructive/10 text-destructive"
                  }`}
                >
                  {s.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {s.photos.map((p, i) => (
                  <a key={p} href={p} target="_blank" rel="noreferrer">
                    <img
                      src={p}
                      alt={`Photo ${i + 1}`}
                      className="size-28 rounded-md border border-border object-cover hover:border-primary"
                    />
                  </a>
                ))}
              </div>

              {s.notes && (
                <p className="mt-3 rounded-md border border-border bg-secondary p-3 text-sm text-muted-foreground">
                  {s.notes}
                </p>
              )}

              {s.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => review(s, "verified")}
                    disabled={busy === s.id}
                    className="rounded-md bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    ✓ Verify
                  </button>
                  <button
                    onClick={() => review(s, "rejected")}
                    disabled={busy === s.id}
                    className="rounded-md border border-destructive px-4 py-2 text-xs font-bold uppercase tracking-wider text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    ✗ Reject
                  </button>
                  {s.vendors?.slug && (
                    <a
                      href={`/vendors/${s.vendors.slug}`}
                      className="rounded-md border border-border px-4 py-2 text-xs font-bold uppercase tracking-wider hover:border-primary hover:text-primary"
                    >
                      View profile →
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
