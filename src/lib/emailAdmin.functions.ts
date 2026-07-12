import * as React from 'react'
import { createServerFn } from '@tanstack/react-start'
import { render } from '@react-email/render'
import { z } from 'zod'
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware'

import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'

export const AUTH_EMAIL_TYPES = [
  'signup',
  'magiclink',
  'recovery',
  'invite',
  'email_change',
  'reauthentication',
] as const
export type AuthEmailType = (typeof AUTH_EMAIL_TYPES)[number]

const SITE_NAME = 'Weddings.io'
const SITE_URL = 'https://weddings.io'
const SAMPLE_EMAIL = 'jane.doe@example.com'
const SAMPLE_NEW_EMAIL = 'jane.doe.new@example.com'
const SAMPLE_URL = 'https://weddings.io/auth/callback?token=EXAMPLE_TOKEN_12345'

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc('has_role', {
    _user_id: context.userId,
    _role: 'admin',
  })
  if (error) throw new Error('Role check failed')
  if (!data) throw new Error('Forbidden')
}

// ---------- Preview a single auth template with realistic sample data ----------

export const previewAuthTemplate = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { type: AuthEmailType }) =>
    z.object({ type: z.enum(AUTH_EMAIL_TYPES) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any)
    const html = await renderAuthTemplate(data.type)
    return { html, subject: SUBJECTS[data.type] }
  })

// ---------- Retry / requeue a failed email by message_id ----------

export const retryEmailByMessageId = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { messageId: string }) =>
    z.object({ messageId: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const { data: rows, error } = await supabaseAdmin
      .from('email_send_log')
      .select('id, status, template_name, recipient_email, metadata, created_at')
      .eq('message_id', data.messageId)
      .order('created_at', { ascending: false })
      .limit(10)
    if (error) throw new Error(error.message)
    if (!rows || rows.length === 0) throw new Error('No log rows for that message_id')

    const latest = rows[0]
    if (latest.status === 'sent') throw new Error('Already sent — refusing to requeue')
    if (latest.status === 'pending') throw new Error('Still pending — nothing to retry')

    // Find the saved queue payload from the initial pending row's metadata.
    const withPayload = rows.find(
      (r: any) => r.metadata && (r.metadata as any).queue_payload,
    )
    if (!withPayload) {
      throw new Error(
        'Cannot requeue: no saved queue payload for this message (predates payload capture).',
      )
    }
    const queuePayload = (withPayload.metadata as any).queue_payload

    // Audit: append a new pending row keyed on the same message_id so the
    // dashboard's dedup-by-message_id shows the retry as latest attempt.
    const auditMeta = {
      requeued: true,
      requeued_by: (context as any).userId,
      requeued_at: new Date().toISOString(),
      previous_status: latest.status,
      previous_error: (latest as any).error_message ?? null,
      original_run_id: (queuePayload as any)?.run_id ?? null,
    }
    await supabaseAdmin.from('email_send_log').insert({
      message_id: data.messageId,
      template_name: latest.template_name,
      recipient_email: latest.recipient_email,
      status: 'pending',
      metadata: { ...auditMeta, queue_payload: queuePayload },
    })

    const { error: rpcErr } = await supabaseAdmin.rpc('enqueue_email', {
      queue_name: 'auth_emails',
      payload: { ...queuePayload, requeued_at: auditMeta.requeued_at },
    })
    if (rpcErr) {
      await supabaseAdmin.from('email_send_log').insert({
        message_id: data.messageId,
        template_name: latest.template_name,
        recipient_email: latest.recipient_email,
        status: 'failed',
        error_message: `Requeue failed: ${rpcErr.message}`,
        metadata: auditMeta,
      })
      throw new Error(`Requeue failed: ${rpcErr.message}`)
    }

    console.log('Email requeued', {
      messageId: data.messageId,
      requeuedBy: (context as any).userId,
      template: latest.template_name,
    })

    return { ok: true, messageId: data.messageId }
  })


// ---------- List deduplicated email_send_log rows ----------

const LogFilterSchema = z.object({
  since: z.string().datetime().optional(),
  until: z.string().datetime().optional(),
  template: z.string().min(1).max(64).nullable().optional(),
  status: z
    .enum(['sent', 'pending', 'failed', 'dlq', 'suppressed', 'bounced', 'complained'])
    .nullable()
    .optional(),
  limit: z.number().int().min(1).max(200).optional(),
  offset: z.number().int().min(0).max(10_000).optional(),
})

export type EmailLogRow = {
  message_id: string
  template_name: string | null
  recipient_email: string | null
  status: string
  error_message: string | null
  created_at: string
  latest_created_at: string
  first_created_at: string
  attempts: number
}

export const getEmailLogs = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => LogFilterSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any)
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server')

    const since = data.since ?? new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
    const until = data.until ?? new Date().toISOString()
    const limit = data.limit ?? 50
    const offset = data.offset ?? 0

    // Fetch a bounded window, then dedupe in memory by message_id (latest wins).
    const { data: rows, error } = await supabaseAdmin
      .from('email_send_log')
      .select('message_id, template_name, recipient_email, status, error_message, created_at')
      .gte('created_at', since)
      .lte('created_at', until)
      .order('created_at', { ascending: false })
      .limit(2000)

    if (error) throw new Error(error.message)

    const groups = new Map<string, EmailLogRow>()
    for (const r of rows ?? []) {
      const mid = r.message_id ?? `_${r.created_at}_${r.recipient_email}`
      const existing = groups.get(mid)
      if (!existing) {
        groups.set(mid, {
          message_id: mid,
          template_name: r.template_name,
          recipient_email: r.recipient_email,
          status: r.status,
          error_message: r.error_message,
          created_at: r.created_at,
          latest_created_at: r.created_at,
          first_created_at: r.created_at,
          attempts: 1,
        })
      } else {
        existing.attempts += 1
        if (r.created_at < existing.first_created_at) existing.first_created_at = r.created_at
        if (r.created_at > existing.latest_created_at) {
          existing.latest_created_at = r.created_at
          existing.status = r.status
          existing.error_message = r.error_message
          existing.template_name = r.template_name ?? existing.template_name
          existing.recipient_email = r.recipient_email ?? existing.recipient_email
        }
      }
    }

    let deduped = Array.from(groups.values())
    if (data.template) deduped = deduped.filter((r) => r.template_name === data.template)
    if (data.status) deduped = deduped.filter((r) => r.status === data.status)
    deduped.sort((a, b) => (a.latest_created_at < b.latest_created_at ? 1 : -1))

    const totalUnique = deduped.length
    const counts = {
      total: totalUnique,
      sent: deduped.filter((r) => r.status === 'sent').length,
      failed: deduped.filter((r) => r.status === 'failed' || r.status === 'dlq').length,
      suppressed: deduped.filter((r) => r.status === 'suppressed').length,
      pending: deduped.filter((r) => r.status === 'pending').length,
    }
    const templates = Array.from(
      new Set((rows ?? []).map((r) => r.template_name).filter((t): t is string => !!t)),
    ).sort()

    const page = deduped.slice(offset, offset + limit)
    return { rows: page, counts, templates, totalUnique, since, until }
  })

// ---------- Shared render helpers ----------

const SUBJECTS: Record<AuthEmailType, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your sign-in link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const COMPONENTS: Record<AuthEmailType, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const SAMPLE_PROPS: Record<AuthEmailType, Record<string, unknown>> = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_URL,
  },
  magiclink: { siteName: SITE_NAME, confirmationUrl: SAMPLE_URL },
  recovery: { siteName: SITE_NAME, confirmationUrl: SAMPLE_URL },
  invite: { siteName: SITE_NAME, siteUrl: SITE_URL, confirmationUrl: SAMPLE_URL },
  email_change: {
    siteName: SITE_NAME,
    oldEmail: SAMPLE_EMAIL,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_NEW_EMAIL,
    confirmationUrl: SAMPLE_URL,
  },
  reauthentication: { token: '824193' },
}

export async function renderAuthTemplate(type: AuthEmailType) {
  const Component = COMPONENTS[type]
  return render(React.createElement(Component, SAMPLE_PROPS[type]))
}

export function sampleRecipientFor(type: AuthEmailType): string {
  if (type === 'email_change') return SAMPLE_NEW_EMAIL
  return SAMPLE_EMAIL
}
