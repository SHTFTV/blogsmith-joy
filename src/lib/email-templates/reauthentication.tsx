import * as React from 'react'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import { BRAND, brandmark, card, code, container, footer, h1, main, text } from './_brand'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {BRAND.siteName} verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brandmark}>{BRAND.siteName}</Text>
          <Heading style={h1}>Confirm it&apos;s you</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Text style={code}>{token}</Text>
          <Text style={footer}>
            This code will expire shortly. If you didn&apos;t request this, you can
            safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail
