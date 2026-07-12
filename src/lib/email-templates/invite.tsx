import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import { BRAND, brandmark, button, buttonWrap, card, container, footer, h1, link, main, text } from './_brand'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({ siteUrl, confirmationUrl }: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You&apos;ve been invited to {BRAND.siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brandmark}>{BRAND.siteName}</Text>
          <Heading style={h1}>You&apos;re invited</Heading>
          <Text style={text}>
            You&apos;ve been invited to join{' '}
            <Link href={siteUrl} style={link}>
              {BRAND.siteName}
            </Link>
            . Accept below to create your account and get started.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Accept Invitation
            </Button>
          </Section>
          <Text style={footer}>
            If you weren&apos;t expecting this invitation, you can safely ignore this
            email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail
