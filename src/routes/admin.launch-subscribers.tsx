import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    attempted?: number;
    error?: string;
  }>(null);

  type Broadcast = {
    id: string;
    source: string;
    template_name: string;
    broadcast_key: string | null;
    total_recipients: number;
    enqueued: number;
    skipped: number;
    failed: number;
    created_at: string;
    notes: string | null;
  };
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [exportingId, setExportingId] = useState<string | null>(null);

  async function callBroadcast(body: Record<string, unknown>): Promise<any> {
    const { data: sess } = await supabase.auth.getSession();
    const accessToken = sess.session?.access_token;
    if (!accessToken) throw new Error("Session expired. Please sign in again.");
    const res = await fetch("/api/admin/launch-broadcast", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });
    return res.json();
  }

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
      const body = await callBroadcast({ mode: "send", source: src, dryRun });
      setBroadcastResult(body);
      if (!dryRun && body?.ok) void loadBroadcasts();
    } catch (e) {
      setBroadcastResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setBroadcasting(false);
    }
  }

  async function retryFailed(broadcastId: string) {
    if (!window.confirm("Re-enqueue every recipient whose last send failed or was DLQ'd?")) return;
    setRetryingId(broadcastId);
    try {
      const body = await callBroadcast({ mode: "retry_failed", broadcastId });
      if (body?.ok) {
        setMsg(
          `Retry: attempted ${body.attempted ?? 0}, enqueued ${body.enqueued ?? 0}, skipped ${
            body.skipped ?? 0
          }, failed ${body.failed ?? 0}.`,
        );
        void loadBroadcasts();
      } else {
        setMsg(`Retry failed: ${body?.error ?? "unknown"}`);
      }
    } catch (e) {
      setMsg(`Retry failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setRetryingId(null);
    }
  }

  async function loadBroadcasts() {
    const { data, error } = await supabase
      .from("launch_broadcasts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (!error) setBroadcasts((data ?? []) as Broadcast[]);
  }

  async function exportBroadcastCsv(b: Broadcast) {
    setExportingId(b.id);
    try {
      // Deduplicate by message_id — latest status wins.
      const { data, error } = await supabase
        .from("email_send_log")
        .select("message_id, recipient_email, status, error_message, created_at")
        .contains("metadata", { broadcast_id: b.id })
        .order("created_at", { ascending: false })
        .limit(10000);
      if (error) {
        setMsg(`Export failed: ${error.message}`);
        return;
      }
      const latest = new Map<string, any>();
      for (const row of data ?? []) {
        if (!row.message_id) continue;
        if (!latest.has(row.message_id)) latest.set(row.message_id, row);
      }
      const rowsOut = Array.from(latest.values());
      const header = ["recipient_email", "status", "error_message", "timestamp", "message_id"];
      const lines = [header.join(",")].concat(
        rowsOut.map((r) =>
          [
            r.recipient_email ?? "",
            r.status ?? "",
            r.error_message ?? "",
            r.created_at ?? "",
            r.message_id ?? "",
          ]
            .map((v) => `"${String(v).replace(/"/g, '""')}"`)
            .join(","),
        ),
      );
      const blob = new Blob([lines.join("\n")], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `broadcast-${b.broadcast_key ?? b.id}-recipients.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingId(null);
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
    void loadBroadcasts();
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

      <section className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[240px]">
            <h2 className="font-serif text-lg text-foreground">Launch announcement</h2>
            <p className="text-xs text-muted-foreground">
              Queues the “launch-live” email to every confirmed, non-unsubscribed
              subscriber in <strong>{sourceFilter === "all" ? "ppp-launch" : sourceFilter}</strong>.
              Sends are async; retries + failures are recorded in Cloud → Emails.
            </p>
          </div>
          <button
            onClick={() => sendLaunch(true)}
            disabled={broadcasting}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm font-semibold disabled:opacity-60"
          >
            {broadcasting ? "Working…" : "Preview count"}
          </button>
          <button
            onClick={() => sendLaunch(false)}
            disabled={broadcasting}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {broadcasting ? "Sending…" : "Send launch announcement"}
          </button>
        </div>
        {broadcastResult && (
          <p className="mt-3 text-sm">
            {broadcastResult.ok === false ? (
              <span className="text-destructive">
                Broadcast failed: {broadcastResult.error ?? "unknown error"}
              </span>
            ) : broadcastResult.dryRun ? (
              <span className="text-foreground">
                Preview — {broadcastResult.totalRecipients ?? 0} confirmed subscribers would be
                emailed.
              </span>
            ) : (
              <span className="text-foreground">
                Broadcast complete — enqueued {broadcastResult.enqueued ?? 0},
                skipped {broadcastResult.skipped ?? 0} (suppressed), failed{" "}
                {broadcastResult.failed ?? 0} of {broadcastResult.totalRecipients ?? 0}.
              </span>
            )}
          </p>
        )}
      </section>

      <section className="mb-6 rounded-lg border border-border bg-card p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg text-foreground">Broadcast history</h2>
            <p className="text-xs text-muted-foreground">
              Preview count = total recipients targeted. Success = enqueued and delivered to the
              queue. Suppressed = on the unsubscribe/bounce list. Failed = rejected by the
              queue or moved to the DLQ after 5 attempts.
            </p>
          </div>
          <button
            onClick={() => void loadBroadcasts()}
            className="rounded-md border border-border bg-secondary px-3 py-1.5 text-xs"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left">When</th>
                <th className="px-3 py-2 text-left">Template · Source</th>
                <th className="px-3 py-2 text-right">Preview</th>
                <th className="px-3 py-2 text-right">Sent</th>
                <th className="px-3 py-2 text-right">Suppressed</th>
                <th className="px-3 py-2 text-right">Failed</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {broadcasts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-muted-foreground">
                    No broadcasts yet.
                  </td>
                </tr>
              )}
              {broadcasts.map((b) => (
                <tr key={b.id} className="border-t border-border align-top">
                  <td className="px-3 py-2 text-muted-foreground">
                    {new Date(b.created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-mono text-xs">{b.template_name}</div>
                    <div className="text-xs text-muted-foreground">{b.source}</div>
                    {b.broadcast_key && (
                      <div className="text-[10px] text-muted-foreground">{b.broadcast_key}</div>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right">{b.total_recipients}</td>
                  <td className="px-3 py-2 text-right text-primary">{b.enqueued}</td>
                  <td className="px-3 py-2 text-right">{b.skipped}</td>
                  <td className="px-3 py-2 text-right text-destructive">{b.failed}</td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => void exportBroadcastCsv(b)}
                        disabled={exportingId === b.id}
                        className="rounded border border-border px-2 py-1 text-xs disabled:opacity-50"
                      >
                        {exportingId === b.id ? "Exporting…" : "CSV"}
                      </button>
                      <button
                        onClick={() => void retryFailed(b.id)}
                        disabled={retryingId === b.id || b.failed === 0}
                        title={b.failed === 0 ? "No failed recipients to retry" : "Re-enqueue failed + DLQ recipients"}
                        className="rounded border border-border px-2 py-1 text-xs hover:border-primary hover:text-primary disabled:opacity-50"
                      >
                        {retryingId === b.id ? "Retrying…" : "Retry failed"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>




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
