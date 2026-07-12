// Shared brand styling for Weddings.io auth emails.
// Body background MUST stay #ffffff per email infra rules; brand accents
// (gold #c9a96e on near-black #0a0a0a) appear inside the container.

export const BRAND = {
  siteName: 'Weddings.io',
  gold: '#c9a96e',
  goldDark: '#a8895a',
  ink: '#0a0a0a',
  cream: '#f7f3ea',
  muted: '#6b7280',
  border: '#e7e2d6',
}

export const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Georgia, "Times New Roman", serif',
  margin: 0,
  padding: '40px 0',
}

export const container = {
  maxWidth: '560px',
  margin: '0 auto',
  padding: '0 24px',
}

export const card = {
  border: `1px solid ${BRAND.border}`,
  borderTop: `4px solid ${BRAND.gold}`,
  borderRadius: '4px',
  padding: '40px 32px',
  backgroundColor: '#ffffff',
}

export const brandmark = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '13px',
  letterSpacing: '0.24em',
  textTransform: 'uppercase' as const,
  color: BRAND.gold,
  margin: '0 0 24px',
  textAlign: 'center' as const,
  fontWeight: 'normal' as const,
}

export const h1 = {
  fontFamily: 'Georgia, "Times New Roman", serif',
  fontSize: '26px',
  fontWeight: 'normal' as const,
  color: BRAND.ink,
  margin: '0 0 20px',
  textAlign: 'center' as const,
  lineHeight: '1.25',
}

export const text = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  fontSize: '15px',
  color: '#3f3f46',
  lineHeight: '1.6',
  margin: '0 0 20px',
}

export const button = {
  backgroundColor: BRAND.ink,
  color: BRAND.gold,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  fontSize: '13px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.16em',
  textTransform: 'uppercase' as const,
  borderRadius: '2px',
  padding: '16px 32px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '8px 0 24px',
}

export const buttonWrap = {
  textAlign: 'center' as const,
  margin: '28px 0',
}

export const link = { color: BRAND.goldDark, textDecoration: 'underline' }

export const footer = {
  fontFamily: '-apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif',
  fontSize: '12px',
  color: BRAND.muted,
  lineHeight: '1.6',
  margin: '28px 0 0',
  textAlign: 'center' as const,
}

export const code = {
  fontFamily: '"SF Mono", Menlo, Consolas, monospace',
  fontSize: '30px',
  fontWeight: 'bold' as const,
  letterSpacing: '0.4em',
  color: BRAND.ink,
  backgroundColor: BRAND.cream,
  border: `1px solid ${BRAND.border}`,
  borderRadius: '4px',
  padding: '20px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}
