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
  main,
  text,
} from "./_brand";

interface Props {
  ctaUrl?: string;
}

const LaunchLive = ({ ctaUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>
      Weddings.io Technologies is live — PPP pricing built in from day one.
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={card}>
          <Text style={brandmark}>{BRAND.siteName}</Text>
          <Heading style={h1}>We&rsquo;re live.</Heading>
          <Text style={text}>
            Paid access to Weddings.io Technologies is now open — the first
            wedding platform in the world to launch with Purchasing Power
            Parity built in from day one.
          </Text>
          <Text style={text}>
            The best service wins. Not the biggest budget. Thanks for waiting
            with us — here&rsquo;s your first look.
          </Text>
          <div style={buttonWrap}>
            <Button style={button} href={ctaUrl ?? "https://weddings.io/"}>
              Explore the platform
            </Button>
          </div>
          <Text style={{ ...text, fontSize: "12px", color: BRAND.muted }}>
            You&rsquo;re receiving this because you asked to be notified when
            we launched. Use the unsubscribe link below to stop future
            emails.
          </Text>
        </div>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LaunchLive,
  subject: "Weddings.io Technologies is live — PPP pricing built in",
  displayName: "Launch — Live announcement",
  previewData: { ctaUrl: "https://weddings.io/" },
} satisfies TemplateEntry;
