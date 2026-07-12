import * as React from 'react'
import { Hr, Link, Text } from '@react-email/components'
import { BRAND, footer, link } from './_brand'

export const SUPPORT_EMAIL = 'partnerships@industryarmymarketing.com'
export const SUPPORT_URL = 'https://weddings.io/contact'
export const PREFERENCES_URL = 'https://weddings.io/account/notifications'

const hr = {
  border: 'none',
  borderTop: '1px solid #e7e2d6',
  margin: '32px 0 20px',
}

const brandLine = {
  ...footer,
  color: BRAND.ink,
  fontWeight: 'bold' as const,
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  margin: '0 0 6px',
}

/**
 * Branded footer for auth emails.
 * Auth emails are essential account/security messages and do not carry an
 * unsubscribe link. For invite-style optional notifications we surface a
 * notification preferences link instead.
 */
export function BrandFooter({
  includePreferencesLink = false,
}: {
  includePreferencesLink?: boolean
}) {
  return (
    <>
      <Hr style={hr} />
      <Text style={brandLine}>{BRAND.siteName}</Text>
      <Text style={footer}>
        Need help? Contact us at{' '}
        <Link href={`mailto:${SUPPORT_EMAIL}`} style={link}>
          {SUPPORT_EMAIL}
        </Link>{' '}
        or visit our{' '}
        <Link href={SUPPORT_URL} style={link}>
          support page
        </Link>
        .
      </Text>
      <Text style={footer}>
        This is an essential account security email, so it does not include an
        unsubscribe link.
        {includePreferencesLink ? (
          <>
            {' '}You can manage optional notification preferences{' '}
            <Link href={PREFERENCES_URL} style={link}>
              here
            </Link>
            .
          </>
        ) : null}
      </Text>
      <Text style={{ ...footer, marginTop: '18px' }}>
        © {new Date().getFullYear()} {BRAND.siteName}. All rights reserved.
      </Text>
    </>
  )
}
