import { createFileRoute } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { AUTH_EMAIL_TYPES, previewAuthTemplate, type AuthEmailType } from '@/lib/emailAdmin.functions'

export const Route = createFileRoute('/admin/email-preview')({
  head: () => ({
    meta: [
      { title: 'Auth Email Preview | Weddings.io Admin' },
      { name: 'description', content: 'Preview every branded auth email template with sample data.' },
      { name: 'robots', content: 'noindex,nofollow' },
    ],
  }),
  component: EmailPreviewPage,
})

const LABELS: Record<AuthEmailType, string> = {
  signup: 'Signup confirm',
  magiclink: 'Sign-in link',
  recovery: 'Password reset',
  invite: 'Invite',
  email_change: 'Email change',
  reauthentication: 'Reauth code',
}

function EmailPreviewPage() {
  const preview = useServerFn(previewAuthTemplate)
  const [active, setActive] = useState<AuthEmailType>('signup')
  const [html, setHtml] = useState<string>('')
  const [subject, setSubject] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    preview({ data: { type: active } })
      .then((res) => {
        if (cancelled) return
        setHtml(res.html)
        setSubject(res.subject)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e?.message ?? 'Failed to render — admin role required.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [active])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-semibold mb-1">Auth Email Preview</h1>
        <p className="text-sm opacity-70 mb-6">
          Every auth email template rendered with realistic sample data. Sign-in as an admin to preview.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {AUTH_EMAIL_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setActive(t)}
              className={`px-3 py-1.5 rounded text-sm border ${
                active === t ? 'bg-primary text-primary-foreground border-primary' : 'border-white/20'
              }`}
            >
              {LABELS[t]}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-baseline gap-3">
          <div className="text-xs uppercase tracking-wider opacity-60">Subject</div>
          <div className="font-medium">{subject || (loading ? 'Rendering…' : '')}</div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded border border-rose-400/50 bg-rose-500/10 text-sm">{error}</div>
        )}

        <div className="rounded border border-white/10 bg-white overflow-hidden">
          <iframe
            title={`Preview: ${active}`}
            srcDoc={html}
            className="w-full"
            style={{ height: '900px', border: '0' }}
          />
        </div>
      </main>
    </div>
  )
}
