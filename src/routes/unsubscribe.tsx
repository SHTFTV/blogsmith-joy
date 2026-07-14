import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe | Weddings.io" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnsubscribePage,
});

type Details = {
  email_redacted?: string;
  unsubscribed_at?: string | null;
  suppressed_at?: string | null;
  suppression_reason?: string | null;
};

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "already"; details: Details }
  | { kind: "confirm"; details: Details }
  | { kind: "submitting" }
  | { kind: "success"; details: Details }
  | { kind: "error"; msg: string };

function fmtDate(v?: string | null) {
  if (!v) return "—";
  try {
    return new Date(v).toLocaleString();
  } catch {
    return v;
  }
}

function UnsubscribePage() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token")
      : null;

  useEffect(() => {
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    (async () => {
      try {
        const res = await fetch(
          `/email/unsubscribe?token=${encodeURIComponent(token)}`,
          { cache: "no-store" },
        );
        const body = await res.json();
        if (!res.ok || body.error) return setState({ kind: "invalid" });
        const details: Details = {
          email_redacted: body.email_redacted,
          unsubscribed_at: body.unsubscribed_at,
          suppressed_at: body.suppressed_at,
          suppression_reason: body.suppression_reason,
        };
        if (body.valid === false && body.reason === "already_unsubscribed") {
          return setState({ kind: "already", details });
        }
        setState({ kind: "confirm", details });
      } catch (e) {
        setState({ kind: "error", msg: e instanceof Error ? e.message : String(e) });
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok) return setState({ kind: "error", msg: body.error ?? "Failed" });
      const details: Details = {
        email_redacted: body.email_redacted,
        unsubscribed_at: body.unsubscribed_at,
        suppressed_at: body.suppressed_at,
        suppression_reason: body.suppression_reason,
      };
      if (body.success === false && body.reason === "already_unsubscribed") {
        return setState({ kind: "already", details });
      }
      setState({ kind: "success", details });
    } catch (e) {
      setState({ kind: "error", msg: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">
          {state.kind === "success" || state.kind === "already"
            ? "You're unsubscribed"
            : "Unsubscribe"}
        </h1>

        <div className="mt-8 rounded-lg border border-border bg-card p-8 text-left">
          {state.kind === "loading" && (
            <p className="text-center text-muted-foreground">Checking your link…</p>
          )}

          {state.kind === "invalid" && (
            <p className="text-center text-destructive">
              This unsubscribe link is invalid or expired.
            </p>
          )}

          {state.kind === "confirm" && (
            <div className="text-center">
              <p className="text-foreground">
                Confirm you want to unsubscribe{" "}
                {state.details.email_redacted && (
                  <span className="font-mono">{state.details.email_redacted}</span>
                )}{" "}
                from Weddings.io emails.
              </p>
              <button
                onClick={confirm}
                className="mt-6 rounded-md border border-primary/60 bg-background px-5 py-2 text-primary hover:bg-primary/10"
              >
                Confirm unsubscribe
              </button>
            </div>
          )}

          {state.kind === "submitting" && (
            <p className="text-center text-muted-foreground">Unsubscribing…</p>
          )}

          {(state.kind === "success" || state.kind === "already") && (
            <SuccessCard
              details={state.details}
              isNew={state.kind === "success"}
            />
          )}

          {state.kind === "error" && (
            <p className="text-center text-destructive">Something went wrong: {state.msg}</p>
          )}
        </div>
      </div>
    </main>
  );
}

function SuccessCard({ details, isNew }: { details: Details; isNew: boolean }) {
  const effective = details.unsubscribed_at ?? details.suppressed_at ?? null;
  return (
    <div>
      <div className="mb-4 flex items-center justify-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-primary" />
        <span className="rounded bg-primary/15 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
          Suppressed
        </span>
      </div>
      <p className="text-center text-foreground">
        {isNew
          ? "You've been unsubscribed — sorry to see you go."
          : "This address is already unsubscribed. Nothing more to do."}
      </p>
      <dl className="mt-6 grid gap-3 rounded-md border border-border bg-background/50 p-4 text-sm">
        {details.email_redacted && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Email</dt>
            <dd className="font-mono">{details.email_redacted}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Effective</dt>
          <dd>{fmtDate(effective)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="font-semibold text-primary">Suppressed — no further emails</dd>
        </div>
        {details.suppression_reason && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Reason</dt>
            <dd>{details.suppression_reason}</dd>
          </div>
        )}
      </dl>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Changed your mind? Reply to any past email from us and we'll help you resubscribe.
      </p>
    </div>
  );
}
