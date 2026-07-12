import * as React from "react";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";

interface Props {
  subject?: string;
  text?: string;
}

const PropagationAlert = ({ subject, text }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{subject ?? "Edge propagation watchdog alert"}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Stale edge detected</Heading>
        <Text style={p}>
          The edge propagation watchdog on weddings.io found one or more
          regions serving an old build.
        </Text>
        <Section style={panel}>
          <Text style={mono}>{text ?? "(no detail provided)"}</Text>
        </Section>
        <Text style={p}>
          Open the watchdog page for the full history:{" "}
          <a href="https://weddings.io/admin/propagation" style={link}>
            /admin/propagation
          </a>
        </Text>
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: PropagationAlert,
  subject: (data) =>
    (data.subject as string) ?? "Edge propagation watchdog alert",
  displayName: "Propagation watchdog alert",
  previewData: {
    subject: "[weddings.io] 2 region(s) stale · bundle 7740d36",
    text: "Bundle commit: 7740d36…\nStale regions:\n  - weddings.io (apex) — commit abc1234 · colo GRU",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "28px 28px", maxWidth: "560px" };
const h1 = { fontSize: "22px", margin: "0 0 12px", color: "#111" };
const p = { fontSize: "14px", lineHeight: "22px", color: "#333", margin: "10px 0" };
const panel = {
  background: "#f6f6f6",
  border: "1px solid #e5e5e5",
  borderRadius: "6px",
  padding: "14px 16px",
  margin: "14px 0",
};
const mono = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: "12px",
  lineHeight: "18px",
  color: "#222",
  whiteSpace: "pre-wrap" as const,
  margin: 0,
};
const link = { color: "#8a2f3b", textDecoration: "underline" };
