import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useMemo, useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import {
  getEmailLogs,
  retryEmailByMessageId,
  type EmailLogRow,
} from '@/lib/emailAdmin.functions'

export const Route = createFileRoute('/admin/email-logs')({
  head: () => ({
    meta: [
      { title: 'Email Delivery Logs | Weddings.io Admin' },
      { name: 'description', content: 'Audit queued, sent, failed, and suppressed emails.' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: EmailLogsPage,
})

type Preset = '24h' | '7d' | '30d' | 'custom'

function isoDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
}

const STATUS_STYLES: Record<string, string> = {
  sent: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  pending: 'bg-amber-100 text-amber-900 border-amber-300',
  failed: 'bg-rose-100 text-rose-900 border-rose-300',
  dlq: 'bg-rose-100 text-rose-900 border-rose-300',
  suppressed: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  bounced: 'bg-orange-100 text-orange-900 border-orange-300',
  complained: 'bg-orange-100 text-orange-900 border-orange-300',
}

function EmailLogsPage() {
  const fetchLogs = useServerFn(getEmailLogs)
  const [preset, setPreset] = useState<Preset>('7d')
  const [customSince, setCustomSince] = useState('')
  const [customUntil, setCustomUntil] = useState('')
  const [template, setTemplate] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [templates, setTemplates] = useState<string[]>([])
  const [rows, setRows] = useState<EmailLogRow[]>([])
  const [counts, setCounts] = useState({ total: 0, sent: 0, failed: 0, suppressed: 0, pending: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const pageSize = 50

  const { since, until } = useMemo(() => {
    if (preset === '24h') return { since: isoDaysAgo(1), until: new Date().toISOString() }
    if (preset === '7d') return { since: isoDaysAgo(7), until: new Date().toISOString() }
    if (preset === '30d') return { since: isoDaysAgo(30), until: new Date().toISOString() }
    return {
      since: customSince ? new Date(customSince).toISOString() : isoDaysAgo(7),
      until: customUntil ? new Date(customUntil).toISOString() : new Date().toISOString(),
    }
  }, [preset, customSince, customUntil])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchLogs({
        data: {
          since,
          until,
          template: template || null,
          status: (status || null) as any,
          limit: pageSize,
          offset: page * pageSize,
        },
      })
      setRows(res.rows)
      setCounts(res.counts)
      setTemplates(res.templates)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [since, until, template, status, page])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-semibold mb-1">Email Delivery Logs</h1>
        <p className="text-sm opacity-70 mb-6">
          Auditing view of every queued, sent, failed, or suppressed email. Rows are deduplicated by message id — the
          latest status per email wins.
        </p>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end mb-6 p-4 rounded border border-white/10 bg-white/[0.03]">
          <div className="flex gap-1">
            {(['24h', '7d', '30d', 'custom'] as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPreset(p)
                  setPage(0)
                }}
                className={`px-3 py-1.5 rounded text-sm border ${
                  preset === p ? 'bg-primary text-primary-foreground border-primary' : 'border-white/20'
                }`}
              >
                {p === '24h' ? 'Last 24h' : p === '7d' ? '7 days' : p === '30d' ? '30 days' : 'Custom'}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex gap-2 items-center text-sm">
              <input
                type="datetime-local"
                value={customSince}
                onChange={(e) => setCustomSince(e.target.value)}
                className="bg-transparent border border-white/20 rounded px-2 py-1"
              />
              <span>→</span>
              <input
                type="datetime-local"
                value={customUntil}
                onChange={(e) => setCustomUntil(e.target.value)}
                className="bg-transparent border border-white/20 rounded px-2 py-1"
              />
            </div>
          )}
          <label className="text-sm">
            <div className="opacity-70 mb-1">Template</div>
            <select
              value={template}
              onChange={(e) => {
                setTemplate(e.target.value)
                setPage(0)
              }}
              className="bg-transparent border border-white/20 rounded px-2 py-1.5"
            >
              <option value="">All templates</option>
              {templates.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <div className="opacity-70 mb-1">Status</div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(0)
              }}
              className="bg-transparent border border-white/20 rounded px-2 py-1.5"
            >
              <option value="">All</option>
              <option value="sent">Sent</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="dlq">DLQ</option>
              <option value="suppressed">Suppressed</option>
              <option value="bounced">Bounced</option>
              <option value="complained">Complained</option>
            </select>
          </label>
          <button
            onClick={load}
            className="ml-auto px-3 py-1.5 rounded border border-white/20 text-sm hover:bg-white/5"
          >
            {loading ? 'Loading…' : 'Refresh'}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: counts.total, tone: 'border-white/20' },
            { label: 'Sent', value: counts.sent, tone: 'border-emerald-400/50' },
            { label: 'Pending', value: counts.pending, tone: 'border-amber-400/50' },
            { label: 'Failed', value: counts.failed, tone: 'border-rose-400/50' },
            { label: 'Suppressed', value: counts.suppressed, tone: 'border-yellow-400/50' },
          ].map((s) => (
            <div key={s.label} className={`rounded border ${s.tone} p-4 bg-white/[0.03]`}>
              <div className="text-xs uppercase tracking-wider opacity-70">{s.label}</div>
              <div className="text-2xl font-semibold mt-1">{s.value}</div>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-rose-400/50 bg-rose-500/10 text-sm">
            {error} — you must be signed in as an admin to view logs.
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto border border-white/10 rounded">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.04] text-left uppercase tracking-wider text-xs">
              <tr>
                <th className="px-3 py-2">Template</th>
                <th className="px-3 py-2">Recipient</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Queued</th>
                <th className="px-3 py-2">Last update</th>
                <th className="px-3 py-2">Attempts</th>
                <th className="px-3 py-2">Error</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && !loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center opacity-60">
                    No emails in this window.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.message_id} className="border-t border-white/5">
                  <td className="px-3 py-2 font-mono text-xs">{r.template_name ?? '—'}</td>
                  <td className="px-3 py-2">{r.recipient_email ?? '—'}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded border text-xs font-medium ${
                        STATUS_STYLES[r.status] ?? 'bg-gray-100 text-gray-900 border-gray-300'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(r.first_created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {new Date(r.latest_created_at).toLocaleString()}
                  </td>
                  <td className="px-3 py-2">{r.attempts}</td>
                  <td className="px-3 py-2 text-rose-300 max-w-md truncate" title={r.error_message ?? ''}>
                    {r.error_message ?? ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="opacity-70">
            Showing {rows.length === 0 ? 0 : page * pageSize + 1}–{page * pageSize + rows.length}
          </div>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="px-3 py-1.5 rounded border border-white/20 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={rows.length < pageSize}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1.5 rounded border border-white/20 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
