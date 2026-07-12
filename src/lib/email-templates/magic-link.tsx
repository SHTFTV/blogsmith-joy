import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import { BRAND, brandmark, button, buttonWrap, card, container, footer, h1, main, text } from './_brand'
import { BrandFooter } from './_footer'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your sign-in link for {BRAND.siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brandmark}>{BRAND.siteName}</Text>
          <Heading style={h1}>Your sign-in link</Heading>
          <Text style={text}>
            Click the button below to sign in to {BRAND.siteName}. For your security,
            this link expires shortly.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Sign In
            </Button>
          </Section>
          <Text style={footer}>
            If you didn&apos;t request this link, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail
