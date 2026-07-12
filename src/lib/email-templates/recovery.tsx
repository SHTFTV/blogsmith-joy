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

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({ confirmationUrl }: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {BRAND.siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={card}>
          <Text style={brandmark}>{BRAND.siteName}</Text>
          <Heading style={h1}>Reset your password</Heading>
          <Text style={text}>
            We received a request to reset your password for {BRAND.siteName}. Click
            the button below to choose a new one.
          </Text>
          <Section style={buttonWrap}>
            <Button style={button} href={confirmationUrl}>
              Reset Password
            </Button>
            <BrandFooter />
        </Section>
          <Text style={footer}>
            If you didn&apos;t request a password reset, you can safely ignore this
            email — your password will not be changed.
          </Text>
          <BrandFooter />
        </Section>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail
