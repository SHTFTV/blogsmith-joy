import * as React from 'react'
import { render } from '@react-email/render'
import { parseEmailWebhookPayload } from '@lovable.dev/email-js'
import { WebhookError, verifyWebhookRequest } from '@lovable.dev/webhooks-js'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { createFileRoute } from '@tanstack/react-router'
import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: 'Confirm your email',
  invite: "You've been invited",
  magiclink: 'Your login link',
  recovery: 'Reset your password',
  email_change: 'Confirm your new email',
  reauthentication: 'Your verification code',
}

const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
}

const SITE_NAME = 'Weddings.io'
const SENDER_DOMAIN = 'notify.weddings.io'
const ROOT_DOMAIN = 'weddings.io'
const FROM_DOMAIN = 'weddings.io'

function redactEmail(email: string | null | undefined): string {
  if (!email) return '***'
  const [localPart, domain] = email.split('@')
  if (!localPart || !domain) return '***'
  return `${localPart[0]}***@${domain}`
}

export type AuthWebhookDeps = {
  apiKey?: string
  supabase?: SupabaseClient
}

/**
 * Handler body split out so unit/integration tests can inject a mocked
 * Supabase client without hitting the network.
 *
 * Idempotency: `run_id` from the verified payload is unique per webhook
 * delivery. We use it as `message_id` and short-circuit if any log row
 * already exists — Supabase or an upstream proxy retrying the same delivery
 * will not enqueue a second email.
 */
export async function processAuthWebhook(request: Request, deps: AuthWebhookDeps = {}) {
  const apiKey = deps.apiKey ?? process.env.LOVABLE_API_KEY
  if (!apiKey) {
    console.error('LOVABLE_API_KEY not configured')
    return Response.json({ error: 'Server configuration error' }, { status: 500 })
  }

  let payload: any
  let run_id = ''
  try {
    const verified = await verifyWebhookRequest({
      req: request,
      secret: apiKey,
      parser: parseEmailWebhookPayload,
    })
    payload = verified.payload
    run_id = payload.run_id
  } catch (error) {
    if (error instanceof WebhookError) {
      switch (error.code) {
        case 'invalid_signature':
        case 'missing_timestamp':
        case 'invalid_timestamp':
        case 'stale_timestamp':
          console.error('Invalid webhook signature', { code: error.code })
          return Response.json({ error: 'Invalid signature' }, { status: 401 })
        case 'invalid_payload':
        case 'invalid_json':
        case 'body_too_large':
          console.error('Invalid webhook payload', { code: error.code })
          return Response.json({ error: 'Invalid webhook payload' }, { status: 400 })
      }
    }
    console.error('Webhook verification failed', { error })
    return Response.json({ error: 'Invalid webhook payload' }, { status: 400 })
  }

  if (!run_id) return Response.json({ error: 'Invalid webhook payload' }, { status: 400 })
  if (payload.version !== '1') {
    return Response.json(
      { error: `Unsupported payload version: ${payload.version}` },
      { status: 400 },
    )
  }

  const emailType = payload.data.action_type
  const EmailTemplate = EMAIL_TEMPLATES[emailType]
  if (!EmailTemplate) {
    console.error('Unknown email type', { emailType, run_id })
    return Response.json({ error: `Unknown email type: ${emailType}` }, { status: 400 })
  }

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables')
    return Response.json({ error: 'Server configuration error' }, { status: 500 })
  }
  const supabase = deps.supabase ?? createClient(supabaseUrl, supabaseServiceKey)

  // Deterministic message_id keyed on run_id gives us idempotent behaviour
  // against duplicate webhook deliveries.
  const messageId = run_id

  const { data: existing, error: existingErr } = await supabase
    .from('email_send_log')
    .select('id, status')
    .eq('message_id', messageId)
    .limit(1)

  if (existingErr) {
    console.error('Idempotency check failed', { error: existingErr })
    return Response.json({ error: 'Storage error' }, { status: 500 })
  }
  if (existing && existing.length > 0) {
    console.log('Duplicate webhook delivery ignored', {
      run_id,
      emailType,
      email_redacted: redactEmail(payload.data.email),
    })
    return Response.json({
      success: true,
      deduplicated: true,
      messageId,
      priorStatus: existing[0].status,
    })
  }

  const templateProps = {
    siteName: SITE_NAME,
    siteUrl: `https://${ROOT_DOMAIN}`,
    recipient: payload.data.email,
    confirmationUrl: payload.data.url,
    token: payload.data.token,
    email: payload.data.email,
    oldEmail: payload.data.old_email,
    newEmail: payload.data.new_email,
  }
  const element = React.createElement(EmailTemplate, templateProps)
  const html = await render(element)
  const text = await render(element, { plainText: true })

  const queuePayload = {
    run_id,
    message_id: messageId,
    to: payload.data.email,
    from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
    sender_domain: SENDER_DOMAIN,
    subject: EMAIL_SUBJECTS[emailType] || 'Notification',
    html,
    text,
    purpose: 'transactional',
    label: emailType,
    queued_at: new Date().toISOString(),
  }

  await supabase.from('email_send_log').insert({
    message_id: messageId,
    template_name: emailType,
    recipient_email: payload.data.email,
    status: 'pending',
    metadata: {
      run_id,
      email_action_type: emailType,
      queue_payload: queuePayload,
    },
  })

  const { error: enqueueError } = await supabase.rpc('enqueue_email', {
    queue_name: 'auth_emails',
    payload: queuePayload,
  })

  if (enqueueError) {
    console.error('Failed to enqueue auth email', { error: enqueueError, run_id, emailType })
    await supabase.from('email_send_log').insert({
      message_id: messageId,
      template_name: emailType,
      recipient_email: payload.data.email,
      status: 'failed',
      error_message: 'Failed to enqueue email',
    })
    return Response.json({ error: 'Failed to enqueue email' }, { status: 500 })
  }

  console.log('Auth email enqueued', {
    emailType,
    email_redacted: redactEmail(payload.data.email),
    run_id,
    messageId,
  })

  return Response.json({ success: true, queued: true, messageId, emailType })
}

export const Route = createFileRoute('/lovable/email/auth/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => processAuthWebhook(request),
    },
  },
})
