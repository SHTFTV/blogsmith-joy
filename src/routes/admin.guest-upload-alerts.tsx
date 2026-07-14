import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Alert = {
  id: string;
  alert_type: "upload_burst" | "rejection_spike" | "cross_event_spray" | string;
  uploader_ip_hash: string;
  event_id: string | null;
  event_count: number;
  window_start: string;
  window_end: string;
  details: Record<string, unknown>;
  created_at: string;
};

type Config = {
  id: number;
  burst_window_minutes: number;
  burst_threshold: number;
  reject_window_minutes: number;
  reject_threshold: number;
  spray_window_minutes: number;
  spray_threshold: number;
  notify_webhook_url: string | null;
  updated_at: string;
};

const PAGE_SIZE = 25;

const TYPE_LABELS: Record<string, string> = {
  upload_burst: "Upload burst",
  rejection_spike: "Rejection spike",
  cross_event_spray: "Cross-event spray",
};

export const Route = createFileRoute("/admin/guest-upload-alerts")({
  head: () => ({
    meta: [
      { title: "Guest Upload Alerts — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminGuestUploadAlerts,
});

function AdminGuestUploadAlerts() {
  const [status, setStatus] = useState<"loading" | "denied" | "ok">("loading");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sinceHours, setSinceHours] = useState<number>(168); // 7 days
  const [config, setConfig] = useState<Config | null>(null);
  const [savingCfg, setSavingCfg] = useState(false);
  const [cfgMsg, setCfgMsg] = useState<string | null>(null);

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
    void loadAlerts();
    void loadConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page, typeFilter, sinceHours]);

  async function loadAlerts() {
    const sinceIso = new Date(Date.now() - sinceHours * 3600_000).toISOString();
    let q = supabase
      .from("guest_upload_alerts")
      .select("*", { count: "exact" })
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
    if (typeFilter !== "all") q = q.eq("alert_type", typeFilter);
    const { data, count, error } = await q;
    if (error) {
      console.error(error);
      return;
    }
    setAlerts((data ?? []) as Alert[]);
    setTotal(count ?? 0);
  }

  async function loadConfig() {
    const { data, error } = await supabase
      .from("guest_upload_alert_config")
      .select("*")
      .eq("id", 1)
      .maybeSingle();
    if (error) {
      console.error(error);
      return;
    }
    if (data) setConfig(data as Config);
  }

  async function saveConfig(next: Partial<Config>) {
    if (!config) return;
    setSavingCfg(true);
    setCfgMsg(null);
    const { error } = await supabase
      .from("guest_upload_alert_config")
      .update({ ...next, updated_at: new Date().toISOString() })
      .eq("id", 1);
    setSavingCfg(false);
    if (error) {
      setCfgMsg(`Save failed: ${error.message}`);
      return;
    }
    setCfgMsg("Saved.");
    void loadConfig();
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  if (status === "loading") {
    return <main className="p-8 text-muted-foreground">Loading…</main>;
  }
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
        <h1 className="font-serif text-3xl">Guest Upload Anomaly Alerts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suspicious guest photo upload activity detected by the periodic scan.
          Slack + email notifications fire on new alerts.
        </p>
      </header>

      {/* Config panel */}
      <section className="mb-8 rounded-lg border border-border bg-secondary p-5">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Detection thresholds
        </h2>
        {!config ? (
          <p className="text-sm text-muted-foreground">Loading config…</p>
        ) : (
          <ConfigForm
            config={config}
            saving={savingCfg}
            onSave={saveConfig}
            message={cfgMsg}
          />
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          See <code>docs/security/guest-upload-alerts.md</code> for guidance on
          safe adjustments and the alert delivery pipeline.
        </p>
      </section>

      {/* Filters */}
      <section className="mb-4 flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-muted-foreground">Type</span>
          <select
            value={typeFilter}
            onChange={(e) => {
              setPage(0);
              setTypeFilter(e.target.value);
            }}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value="all">All</option>
            <option value="upload_burst">Upload burst</option>
            <option value="rejection_spike">Rejection spike</option>
            <option value="cross_event_spray">Cross-event spray</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-muted-foreground">Since</span>
          <select
            value={sinceHours}
            onChange={(e) => {
              setPage(0);
              setSinceHours(Number(e.target.value));
            }}
            className="rounded-md border border-border bg-background px-2 py-1 text-sm"
          >
            <option value={24}>Last 24 hours</option>
            <option value={168}>Last 7 days</option>
            <option value={720}>Last 30 days</option>
            <option value={8760}>Last 365 days</option>
          </select>
        </label>
        <div className="ml-auto text-xs text-muted-foreground">
          {total} alert{total === 1 ? "" : "s"} · page {page + 1} of {totalPages}
        </div>
      </section>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">IP hash</th>
              <th className="px-3 py-2">Count</th>
              <th className="px-3 py-2">Window</th>
              <th className="px-3 py-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">
                  No alerts in the selected window.
                </td>
              </tr>
            )}
            {alerts.map((a) => (
              <tr key={a.id} className="border-t border-border">
                <td className="whitespace-nowrap px-3 py-2 text-xs">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {TYPE_LABELS[a.alert_type] ?? a.alert_type}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{a.uploader_ip_hash}</td>
                <td className="px-3 py-2 font-mono">{a.event_count}</td>
                <td className="whitespace-nowrap px-3 py-2 text-xs text-muted-foreground">
                  {new Date(a.window_start).toLocaleTimeString()}–
                  {new Date(a.window_end).toLocaleTimeString()}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{JSON.stringify(a.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
          disabled={page + 1 >= totalPages}
          className="rounded-md border border-border px-3 py-1 text-sm disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </main>
  );
}

function ConfigForm({
  config,
  saving,
  onSave,
  message,
}: {
  config: Config;
  saving: boolean;
  onSave: (next: Partial<Config>) => void;
  message: string | null;
}) {
  const [draft, setDraft] = useState<Config>(config);
  useEffect(() => setDraft(config), [config]);

  function numField(key: keyof Config, label: string, help: string) {
    return (
      <label className="grid gap-1 text-xs">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <input
          type="number"
          min={1}
          value={draft[key] as number}
          onChange={(e) =>
            setDraft({ ...draft, [key]: Number(e.target.value) } as Config)
          }
          className="w-32 rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
        <span className="text-[11px] font-normal text-muted-foreground">{help}</span>
      </label>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider">Upload burst</h3>
          {numField("burst_window_minutes", "Window (min)", "Sliding window in minutes")}
          {numField("burst_threshold", "Threshold", "Uploads per IP hash")}
        </div>
        <div className="grid gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider">Rejection spike</h3>
          {numField("reject_window_minutes", "Window (min)", "Sliding window in minutes")}
          {numField("reject_threshold", "Threshold", "Rejected uploads per IP hash")}
        </div>
        <div className="grid gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider">Cross-event spray</h3>
          {numField("spray_window_minutes", "Window (min)", "Sliding window in minutes")}
          {numField("spray_threshold", "Threshold", "Distinct events per IP hash")}
        </div>
      </div>

      <label className="grid gap-1 text-xs">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">
          Notification webhook URL (optional override)
        </span>
        <input
          type="url"
          value={draft.notify_webhook_url ?? ""}
          onChange={(e) =>
            setDraft({ ...draft, notify_webhook_url: e.target.value || null })
          }
          placeholder="Leave blank to use the built-in /api/public/hooks/guest-upload-alert route"
          className="rounded-md border border-border bg-background px-2 py-1 text-sm"
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={saving}
          onClick={() => {
            const { id: _id, updated_at: _u, ...rest } = draft;
            void _id;
            void _u;
            onSave(rest);
          }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save thresholds"}
        </button>
        {message && <span className="text-xs text-muted-foreground">{message}</span>}
      </div>
    </div>
  );
}
