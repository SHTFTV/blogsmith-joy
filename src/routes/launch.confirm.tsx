import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/launch/confirm")({
  head: () => ({
    meta: [
      { title: "Confirm your subscription | Weddings.io" },
      {
        name: "description",
        content:
          "Confirm your email to be notified when Weddings.io Technologies opens paid access with PPP pricing built in from day one.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LaunchConfirmPage,
});

type State =
  | { kind: "loading" }
  | { kind: "success"; email: string; alreadyConfirmed: boolean }
  | { kind: "invalid" }
  | { kind: "error"; msg: string };

function LaunchConfirmPage() {
  const [state, setState] = useState<State>({ kind: "loading" });

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null;
    if (!token) {
      setState({ kind: "invalid" });
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/public/launch-notify/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await res.json();
        if (!res.ok || body?.ok !== true) {
          setState({ kind: "invalid" });
          return;
        }
        setState({
          kind: "success",
          email: String(body.email ?? ""),
          alreadyConfirmed: Boolean(body.already_confirmed),
        });
      } catch (e) {
        setState({
          kind: "error",
          msg: e instanceof Error ? e.message : String(e),
        });
      }
    })();
  }, []);

  return (
    <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-6 py-16 text-foreground">
      <div className="w-full rounded-lg border border-primary/30 bg-card p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Launch notification
        </p>

        {state.kind === "loading" && (
          <p className="mt-6 text-muted-foreground">Confirming your email…</p>
        )}

        {state.kind === "success" && (
          <>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">
              {state.alreadyConfirmed
                ? "You’re already confirmed."
                : "You’re confirmed."}
            </h1>
            <p className="mt-3 text-muted-foreground">
              We’ll email <strong className="text-foreground">{state.email}</strong>{" "}
              the moment paid access opens on Weddings.io Technologies — with
              PPP pricing built in from day one.
            </p>
            <p className="mt-6 text-xs text-muted-foreground">
              You can unsubscribe from that email at any time using the link
              at the bottom of the message.
            </p>
          </>
        )}

        {state.kind === "invalid" && (
          <>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">
              This link isn’t valid.
            </h1>
            <p className="mt-3 text-muted-foreground">
              The confirmation link may have expired or already been used. If
              you still want to be notified, sign up again from the launch
              announcement page.
            </p>
          </>
        )}

        {state.kind === "error" && (
          <>
            <h1 className="mt-2 font-serif text-3xl md:text-4xl">
              Something went wrong.
            </h1>
            <p className="mt-3 text-muted-foreground">
              We couldn’t confirm your email right now. Please try again in a
              moment.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
