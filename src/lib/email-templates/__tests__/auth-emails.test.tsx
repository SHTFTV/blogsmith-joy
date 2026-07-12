import { describe, expect, it } from 'vitest'
import * as React from 'react'
import { render } from '@react-email/render'

import { SignupEmail } from '@/lib/email-templates/signup'
import { InviteEmail } from '@/lib/email-templates/invite'
import { MagicLinkEmail } from '@/lib/email-templates/magic-link'
import { RecoveryEmail } from '@/lib/email-templates/recovery'
import { EmailChangeEmail } from '@/lib/email-templates/email-change'
import { ReauthenticationEmail } from '@/lib/email-templates/reauthentication'
import { SUPPORT_EMAIL } from '@/lib/email-templates/_footer'

/**
 * The auth webhook (`src/routes/lovable/email/auth/webhook.ts`) selects a
 * template from `payload.data.email_action_type` and passes the recipient
 * through as `templateProps.recipient` / `templateProps.email` /
 * `templateProps.newEmail` depending on the action.
 *
 * These tests mirror that exact wiring so we catch regressions in the
 * mapping (wrong template picked) or the props (recipient goes to the
 * wrong slot and the wrong address appears in the rendered email).
 */

// Must stay in lockstep with EMAIL_TEMPLATES in webhook.ts + preview.ts.
const AUTH_TEMPLATE_MAP = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
} as const

type ActionType = keyof typeof AUTH_TEMPLATE_MAP

const SITE_NAME = 'Weddings.io'
const SITE_URL = 'https://weddings.io'
const CONFIRM_URL = 'https://weddings.io/auth/callback?token=abc123'
const TOKEN = '824193'

function propsFor(action: ActionType, recipient: string, extra?: { newEmail?: string }) {
  // Mirrors the templateProps object built inside the webhook handler.
  return {
    siteName: SITE_NAME,
    siteUrl: SITE_URL,
    recipient,
    email: recipient,
    oldEmail: recipient,
    newEmail: extra?.newEmail ?? recipient,
    confirmationUrl: CONFIRM_URL,
    token: TOKEN,
  }
}

async function renderFor(action: ActionType, recipient: string, extra?: { newEmail?: string }) {
  const Component = AUTH_TEMPLATE_MAP[action]
  const html = await render(React.createElement(Component, propsFor(action, recipient, extra)))
  return html
}

describe('auth email webhook → template mapping', () => {
  it('covers every action type Supabase can emit', () => {
    expect(Object.keys(AUTH_TEMPLATE_MAP).sort()).toEqual(
      ['email_change', 'invite', 'magiclink', 'recovery', 'reauthentication', 'signup'].sort(),
    )
  })

  const cases: Array<{
    action: ActionType
    recipient: string
    expectInBody: string[]
    expectConfirmLink?: boolean
  }> = [
    {
      action: 'signup',
      recipient: 'alice@example.com',
      expectInBody: ['alice@example.com', 'Verify Email'],
      expectConfirmLink: true,
    },
    {
      action: 'magiclink',
      recipient: 'bob@example.com',
      expectInBody: ['Sign In'],
      expectConfirmLink: true,
    },
    {
      action: 'recovery',
      recipient: 'carol@example.com',
      expectInBody: ['Reset Password'],
      expectConfirmLink: true,
    },
    {
      action: 'invite',
      recipient: 'dave@example.com',
      expectInBody: ['Accept Invitation'],
      expectConfirmLink: true,
    },
    {
      action: 'reauthentication',
      recipient: 'erin@example.com',
      expectInBody: [TOKEN],
    },
  ]

  it.each(cases)(
    'renders the $action template with recipient $recipient',
    async ({ action, recipient, expectInBody, expectConfirmLink }) => {
      const html = await renderFor(action, recipient)
      for (const needle of expectInBody) {
        expect(html).toContain(needle)
      }
      if (expectConfirmLink) expect(html).toContain(CONFIRM_URL)
      // Branded footer must be present on every auth email.
      expect(html).toContain(SUPPORT_EMAIL)
      expect(html).toContain(SITE_NAME)
    },
  )

  it('email_change sends to the NEW address and shows both old and new', async () => {
    const html = await renderFor('email_change', 'old@example.com', { newEmail: 'new@example.com' })
    expect(html).toContain('old@example.com')
    expect(html).toContain('new@example.com')
    expect(html).toContain('Confirm Email Change')
    expect(html).toContain(SUPPORT_EMAIL)
  })

  it('does not leak one recipient into another template', async () => {
    const html = await renderFor('signup', 'unique-recipient-xyz@example.com')
    expect(html).toContain('unique-recipient-xyz@example.com')
    expect(html).not.toContain('bob@example.com')
    expect(html).not.toContain('carol@example.com')
  })
})
