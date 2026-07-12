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

type State =
  | { kind: "loading" }
  | { kind: "invalid" }
  | { kind: "already" }
  | { kind: "confirm" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; msg: string };

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
        if (body.valid === false && body.reason === "already_unsubscribed") {
          return setState({ kind: "already" });
        }
        setState({ kind: "confirm" });
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
      if (body.success === false && body.reason === "already_unsubscribed") {
        return setState({ kind: "already" });
      }
      setState({ kind: "success" });
    } catch (e) {
      setState({ kind: "error", msg: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Unsubscribe</h1>
        <div className="mt-8 rounded-lg border border-border bg-card p-8">
          {state.kind === "loading" && (
            <p className="text-muted-foreground">Checking your link…</p>
          )}
          {state.kind === "invalid" && (
            <p className="text-destructive">This unsubscribe link is invalid or expired.</p>
          )}
          {state.kind === "already" && (
            <p className="text-foreground">You've already been unsubscribed. Nothing more to do.</p>
          )}
          {state.kind === "confirm" && (
            <>
              <p className="text-foreground">
                Confirm you want to unsubscribe from Weddings.io emails.
              </p>
              <button
                onClick={confirm}
                className="mt-6 rounded-md border border-primary/60 bg-background px-5 py-2 text-primary hover:bg-primary/10"
              >
                Confirm unsubscribe
              </button>
            </>
          )}
          {state.kind === "submitting" && (
            <p className="text-muted-foreground">Unsubscribing…</p>
          )}
          {state.kind === "success" && (
            <p className="text-foreground">You've been unsubscribed. Thanks — sorry to see you go.</p>
          )}
          {state.kind === "error" && (
            <p className="text-destructive">Something went wrong: {state.msg}</p>
          )}
        </div>
      </div>
    </main>
  );
}
