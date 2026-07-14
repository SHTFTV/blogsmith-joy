import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

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
  | { kind: "success"; alreadySubscribed: boolean }
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
    const { data, error } = await supabase.rpc("launch_notify_subscribe", {
      p_email: parsed.data,
      p_source: source,
      p_ip_hash: ipHash ?? undefined,
      p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : undefined,
    });
    if (error) {
      setStatus({ kind: "error", message: "Something went wrong. Please try again." });
      return;
    }
    const result = data as { ok: boolean; error?: string; already_subscribed?: boolean } | null;
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
    setStatus({ kind: "success", alreadySubscribed: Boolean(result.already_subscribed) });
  }

  if (status.kind === "success") {
    return (
      <section
        aria-live="polite"
        className="rounded-lg border border-primary/40 bg-primary/5 p-6 md:p-8"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          {status.alreadySubscribed ? "Already on the list" : "You're on the list"}
        </p>
        <h2 className="mt-2 font-serif text-3xl text-foreground">
          {status.alreadySubscribed
            ? "You're already subscribed."
            : "Confirmed — we'll be in touch."}
        </h2>
        <p className="mt-3 text-muted-foreground">
          When paid access opens on Weddings.io Technologies with PPP pricing built in from day
          one, we'll email you directly at <strong className="text-foreground">{email}</strong>.
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
