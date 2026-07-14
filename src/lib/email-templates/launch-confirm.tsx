import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";
import {
  BRAND,
  brandmark,
  button,
  buttonWrap,
  card,
  container,
  h1,
  link,
  main,
  text,
} from "./_brand";

interface Props {
  confirmUrl?: string;
  email?: string;
}

const LaunchConfirm = ({ confirmUrl, email }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your Weddings.io launch notification</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={card}>
          <Text style={brandmark}>{BRAND.siteName}</Text>
          <Heading style={h1}>Confirm your email</Heading>
          <Text style={text}>
            You asked to be notified when Weddings.io Technologies opens paid
            access {email ? (
              <>at <strong>{email}</strong>.</>
            ) : (
              "."
            )}
          </Text>
          <Text style={text}>
            Confirm your email so we know it&rsquo;s really you. You&rsquo;ll
            only hear from us at launch — one email, no spam.
          </Text>
          <div style={buttonWrap}>
            <Button style={button} href={confirmUrl ?? "https://weddings.io/"}>
              Confirm my email
            </Button>
          </div>
          <Text style={{ ...text, fontSize: "13px", color: BRAND.muted }}>
            If the button doesn&rsquo;t work, copy and paste this link into
            your browser:
            <br />
            <a href={confirmUrl ?? "https://weddings.io/"} style={link}>
              {confirmUrl ?? "https://weddings.io/"}
            </a>
          </Text>
          <Text style={{ ...text, fontSize: "12px", color: BRAND.muted }}>
            Didn&rsquo;t sign up? You can safely ignore this email — we
            won&rsquo;t add you to any list without confirmation.
          </Text>
        </div>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LaunchConfirm,
  subject: "Confirm your Weddings.io launch notification",
  displayName: "Launch — Confirm subscription",
  previewData: {
    confirmUrl: "https://weddings.io/launch/confirm?token=example",
    email: "jane@example.com",
  },
} satisfies TemplateEntry;
