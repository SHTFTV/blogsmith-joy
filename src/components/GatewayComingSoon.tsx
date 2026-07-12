import { useEffect, useRef, useState } from "react";

/**
 * Gateway "Coming Soon" stop.
 *
 * Replaces every payment/apply/checkout CTA while the payment gateways are
 * intentionally closed (see /journal/the-master-plan). The button never
 * navigates to a checkout — hovering, focusing, or tapping it reveals the
 * partnerships email so motivated readers self-select and write to us.
 *
 * Usage:
 *   <GatewayComingSoon label="Apply" />
 *   <GatewayComingSoon label="Apply · $10/yr" variant="ghost" />
 */

export const PARTNERSHIPS_EMAIL = "partnerships@industryarmymarketing.com";

type Variant = "primary" | "ghost" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90",
  ghost:
    "inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary",
  link: "inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary hover:opacity-80",
};

interface Props {
  label: string;
  variant?: Variant;
  className?: string;
  /** Override the styles for one-off use (e.g. inline colors on directory.tsx). */
  style?: React.CSSProperties;
  /** Prefill the mailto subject so the founder can triage. Defaults to the label. */
  subject?: string;
}

export function GatewayComingSoon({
  label,
  variant = "primary",
  className,
  style,
  subject,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click so tap-to-reveal doesn't get stuck open on mobile.
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const mailto = `mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(
    subject ?? `${label} — early access`,
  )}`;

  return (
    <div
      ref={ref}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} — coming soon. Reveal partnerships email.`}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
          // Keep open if focus moved into the popover.
          if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
        }}
        className={[
          VARIANT_CLASS[variant],
          "relative cursor-pointer opacity-90",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={style}
        data-gateway="coming-soon"
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-current"
        />
        {label} — Coming Soon
      </button>

      <div
        role="dialog"
        aria-label="Partnerships contact"
        hidden={!open}
        className="absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-md border border-border bg-card p-4 text-left shadow-xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Gateways closed — by design
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Payment isn't open yet. If you'd like an early conversation, write to the partnerships desk.
        </p>
        <a
          href={mailto}
          className="mt-3 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
        >
          {PARTNERSHIPS_EMAIL}
        </a>
      </div>
    </div>
  );
}
