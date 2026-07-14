import { useState } from "react";
import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(5, "Enter a valid email.")
  .max(254, "That email is too long.")
  .email("Enter a valid email.");

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | {
      kind: "success";
      state: "confirmation_sent" | "already_confirmed" | "confirmation_pending" | "suppressed";
    }
  | { kind: "error"; message: string };

async function hashIpFingerprint(): Promise<string | null> {
  try {
    // We don't have the client IP; hash a stable-per-session fingerprint so the
    // server-side rate limit still works against single-machine abuse.
    const seed = [
      navigator.userAgent,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
      String(screen.width),
      String(screen.height),
    ].join("|");
    const bytes = new TextEncoder().encode(seed);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return null;
  }
}

export function LaunchNotifyForm({
  source = "ppp-launch",
  headline = "Get Notified at Launch",
  description = "Weddings.io Technologies is launching paid access in days. PPP pricing built in from day one. Be the first to know when applications open.",
}: {
  source?: string;
  headline?: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "submitting") return;
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setStatus({ kind: "error", message: parsed.error.issues[0]?.message ?? "Invalid email." });
      return;
    }
    setStatus({ kind: "submitting" });
    const ipHash = await hashIpFingerprint();
    let result:
      | {
          ok: boolean;
          error?: string;
          status?: "confirmation_sent" | "already_confirmed" | "confirmation_pending" | "suppressed";
        }
      | null = null;
    try {
      const res = await fetch("/api/public/launch-notify/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: parsed.data,
          source,
          ip_hash: ipHash,
          user_agent:
            typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
        }),
      });
      result = (await res.json()) as typeof result;
    } catch {
      setStatus({ kind: "error", message: "Network error. Please try again." });
      return;
    }
    if (!result?.ok) {
      const msg =
        result?.error === "invalid_email"
          ? "Enter a valid email."
          : result?.error === "rate_limited"
            ? "Too many signups from this device. Try again in a few minutes."
            : "Something went wrong. Please try again.";
      setStatus({ kind: "error", message: msg });
      return;
    }
    setStatus({ kind: "success", state: result.status ?? "confirmation_sent" });
  }

  if (status.kind === "success") {
    const isAlready = status.state === "already_confirmed";
    const isSuppressed = status.state === "suppressed";
    const headline = isAlready
      ? "You're already confirmed."
      : isSuppressed
        ? "This email is on our no-send list."
        : "Check your inbox to confirm.";
    const label = isAlready
      ? "Already confirmed"
      : isSuppressed
        ? "No email will be sent"
        : "One more step";
    const body = isAlready
      ? "You'll hear from us the moment paid access opens on Weddings.io Technologies — no need to do anything."
      : isSuppressed
        ? "This address previously unsubscribed from our emails, so we won't send a confirmation. Reach out from a different address if you'd like updates."
        : "We just sent a confirmation email — click the link inside to finish signing up. Only confirmed addresses will receive the launch announcement.";
    return (
      <section
        aria-live="polite"
        className="rounded-lg border border-primary/40 bg-primary/5 p-6 md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {label}
        </p>
        <h2 className="mt-2 font-serif text-3xl text-foreground">{headline}</h2>
        <p className="mt-3 text-muted-foreground">
          {body} {!isSuppressed && (
            <>
              We sent it to <strong className="text-foreground">{email}</strong>.
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-primary/40 bg-card p-6 md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        Launch Notification
      </p>
      <h2 className="mt-2 font-serif text-3xl text-foreground md:text-4xl">{headline}</h2>
      <p className="mt-3 max-w-2xl text-muted-foreground">{description}</p>
      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row" noValidate>
        <label htmlFor="launch-notify-email" className="sr-only">
          Email address
        </label>
        <input
          id="launch-notify-email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          maxLength={254}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status.kind === "error") setStatus({ kind: "idle" });
          }}
          className="w-full flex-1 rounded-md border border-border bg-background px-4 py-3 text-base text-foreground focus:border-primary focus:outline-none"
          aria-invalid={status.kind === "error"}
          aria-describedby={status.kind === "error" ? "launch-notify-error" : undefined}
        />
        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {status.kind === "submitting" ? "Adding you…" : "Notify me at launch"}
        </button>
      </form>
      {status.kind === "error" && (
        <p
          id="launch-notify-error"
          role="alert"
          className="mt-3 text-sm font-medium text-destructive"
        >
          {status.message}
        </p>
      )}
      <p className="mt-3 text-xs text-muted-foreground">
        One email at launch. No spam. Unsubscribe anytime.
      </p>
    </section>
  );
}
