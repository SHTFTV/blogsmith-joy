import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { broadcastLaunchAnnouncement } from "@/lib/launchBroadcast.functions";

type Subscriber = {
  id: string;
  email: string;
  source: string;
  ip_hash: string | null;
  user_agent: string | null;
  confirmed: boolean;
  unsubscribed_at: string | null;
  created_at: string;
};

const PAGE_SIZE = 50;

export const Route = createFileRoute("/admin/launch-subscribers")({
  head: () => ({
    meta: [
      { title: "Launch Notify Subscribers — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLaunchSubscribers,
});

function AdminLaunchSubscribers() {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [sources, setSources] = useState<string[]>([]);
  const [showUnsub, setShowUnsub] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<null | {
    ok: boolean;
    dryRun?: boolean;
    totalRecipients?: number;
    enqueued?: number;
    skipped?: number;
    failed?: number;
    error?: string;
  }>(null);
  const runBroadcast = useServerFn(broadcastLaunchAnnouncement);

  async function sendLaunch(dryRun: boolean) {
    setBroadcasting(true);
    setBroadcastResult(null);
    try {
      const src = sourceFilter === "all" ? "ppp-launch" : sourceFilter;
      const confirmMsg = dryRun
        ? `Preview: how many confirmed subscribers in "${src}"?`
        : `Send the LIVE launch announcement to every confirmed subscriber in "${src}"? This cannot be undone.`;
      if (!window.confirm(confirmMsg)) {
        setBroadcasting(false);
        return;
      }
      const res = await runBroadcast({ data: { source: src, dryRun } });
      setBroadcastResult(res);
    } catch (e) {
      setBroadcastResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBroadcasting(false);
    }
  }

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return setStatus("denied");
      const { data: isAdmin } = await supabase.rpc("has_role", {
        _user_id: u.user.id,
        _role: "admin",
      });
      setStatus(isAdmin ? "ok" : "denied");
    })();
  }, []);

  useEffect(() => {
    if (status !== "ok") return;
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, sourceFilter, showUnsub]);

  async function load() {
    let q = supabase
      .from("launch_notify_subscribers")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (sourceFilter !== "all") q = q.eq("source", sourceFilter);
    if (!showUnsub) q = q.is("unsubscribed_at", null);
    if (search.trim()) q = q.ilike("email", `%${search.trim()}%`);
    const { data, count, error } = await q;
    if (error) {
      setMsg(error.message);
      return;
    }
    setRows((data ?? []) as Subscriber[]);
    setTotal(count ?? 0);
    // populate sources dropdown from a lightweight distinct query
    const { data: srcData } = await supabase
      .from("launch_notify_subscribers")
      .select("source")
      .limit(500);
    if (srcData) {
      const uniq = Array.from(new Set(srcData.map((r) => r.source))).sort();
      setSources(uniq);
    }
  }

  async function unsubscribe(id: string) {
    const { error } = await supabase
      .from("launch_notify_subscribers")
      .update({ unsubscribed_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setMsg(`Unsubscribe failed: ${error.message}`);
      return;
    }
    void load();
  }

  function exportCsv() {
    const header = ["email", "source", "confirmed", "unsubscribed_at", "created_at"];
    const lines = [header.join(",")].concat(
      rows.map((r) =>
        [r.email, r.source, r.confirmed, r.unsubscribed_at ?? "", r.created_at]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(","),
      ),
    );
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `launch-subscribers-page-${page + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  if (status === "loading") return <main className="p-8 text-muted-foreground">Loading…</main>;
  if (status === "denied") {
    return (
      <main className="grid min-h-screen place-items-center p-8">
        <p className="text-sm text-muted-foreground">Admin access required.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-foreground">
      <header className="mb-6">
        <h1 className="font-serif text-3xl">Launch Notify Subscribers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Emails collected via “Get Notified at Launch” forms across the site.
        </p>
      </header>

      <section className="mb-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-muted-foreground">Search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(0);
                void load();
              }
            }}
            placeholder="email contains…"
            className="w-64 rounded-md border border-border bg-background px-2 py-1 text-sm"
          />
        </label>
        <label className="grid gap-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-muted-foreground">Source</span>
          <select
            value={sourceFilter}
            onChange={(e) => {
              setPage(0);
              setSourceFilter(e.target.value);
            }}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            {sources.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showUnsub}
            onChange={(e) => {
              setPage(0);
              setShowUnsub(e.target.checked);
            }}
          />
          Include unsubscribed
        </label>
        <button
          onClick={() => {
            setPage(0);
            void load();
          }}
          className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm"
        >
          Refresh
        </button>
        <button
          onClick={exportCsv}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
        >
          Export page (CSV)
        </button>
        <span className="ml-auto text-sm text-muted-foreground">{total} total</span>
      </section>

      {msg && <p className="mb-3 text-sm text-destructive">{msg}</p>}

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Source</th>
              <th className="px-3 py-2 text-left">Signed up</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-muted-foreground" colSpan={5}>
                  No subscribers match these filters.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="px-3 py-2 font-mono">{r.email}</td>
                <td className="px-3 py-2">{r.source}</td>
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  {r.unsubscribed_at ? (
                    <span className="rounded bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive">
                      Unsubscribed
                    </span>
                  ) : (
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  {!r.unsubscribed_at && (
                    <button
                      onClick={() => unsubscribe(r.id)}
                      className="rounded border border-border px-2 py-1 text-xs hover:border-destructive hover:text-destructive"
                    >
                      Unsubscribe
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <nav className="mt-4 flex items-center justify-between text-sm">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
        >
          ← Previous
        </button>
        <span className="text-muted-foreground">
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
          disabled={page + 1 >= totalPages}
          className="rounded-md border border-border px-3 py-1.5 disabled:opacity-50"
        >
          Next →
        </button>
      </nav>
    </main>
  );
}
