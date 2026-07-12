import { useEffect, useRef, useState } from "react";

/**
 * Gateway "Coming Soon" stop.
 *
 * Unified stand-in for every payment / apply / checkout / subscribe / upgrade /
 * claim CTA while the payment gateways are intentionally closed
 * (see /journal/the-master-plan). Button text and popover copy are IDENTICAL
 * across every entry point on the site — the only thing that changes per usage
 * is an optional small `context` label and the mailto `subject`.
 *
 * Usage:
 *   <GatewayComingSoon />
 *   <GatewayComingSoon context="Vendors Directory · $10/yr" />
 *   <GatewayComingSoon context="Planner application" variant="ghost" />
 */

export const PARTNERSHIPS_EMAIL = "partnerships@industryarmymarketing.com";

/** Canonical, unified button text — do NOT vary per page. */
export const GATEWAY_BUTTON_LABEL = "Coming Soon";

/** Canonical, unified popover copy — do NOT vary per page. */
export const GATEWAY_POPOVER_EYEBROW = "Gateways closed — by design";
export const GATEWAY_POPOVER_BODY =
  "Payment isn't open yet. If you'd like an early conversation, write to the partnerships desk.";

/** Href prefixes that represent a closed gateway; audits/tests use this list. */
export const GATEWAY_HREF_PREFIXES = [
  "/apply",
  "/checkout",
  "/join",
  "/invoice",
  "/backlinks",
  "/talc",
  "/visualizer",
  "/dashboard/position-one",
] as const;

export function isGatewayHref(href: string | undefined | null): boolean {
  if (!href) return false;
  return GATEWAY_HREF_PREFIXES.some((p) => href === p || href.startsWith(`${p}/`) || href.startsWith(`${p}?`));
}

type Variant = "primary" | "ghost" | "link";

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90",
  ghost:
    "inline-flex items-center gap-2 rounded-md border border-border px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary",
  link: "inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-primary hover:opacity-80",
};

interface Props {
  /** Optional small context label rendered before the unified "Coming Soon" text. */
  context?: string;
  variant?: Variant;
  className?: string;
  /** One-off style overrides (e.g. dark-theme sections). */
  style?: React.CSSProperties;
  /** Mailto subject; defaults to a generic partnerships subject so wording stays unified. */
  subject?: string;
}

export function GatewayComingSoon({
  context,
  variant = "primary",
  className,
  style,
  subject,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const mailto = `mailto:${PARTNERSHIPS_EMAIL}?subject=${encodeURIComponent(
    subject ?? "Early access — partnerships",
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
        aria-label={`${GATEWAY_BUTTON_LABEL} — reveal partnerships email`}
        onClick={() => setOpen((v) => !v)}
        onFocus={() => setOpen(true)}
        onBlur={(e) => {
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
        data-testid="gateway-coming-soon"
      >
        <span
          aria-hidden="true"
          className="inline-block h-2 w-2 animate-pulse rounded-full bg-current"
        />
        {context ? (
          <span className="opacity-80">{context} ·</span>
        ) : null}
        <span data-testid="gateway-coming-soon-label">{GATEWAY_BUTTON_LABEL}</span>
      </button>

      <div
        role="dialog"
        aria-label="Partnerships contact"
        data-testid="gateway-coming-soon-popover"
        hidden={!open}
        className="absolute left-1/2 top-full z-30 mt-2 w-72 -translate-x-1/2 rounded-md border border-border bg-card p-4 text-left shadow-xl"
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {GATEWAY_POPOVER_EYEBROW}
        </p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {GATEWAY_POPOVER_BODY}
        </p>
        <a
          href={mailto}
          data-testid="gateway-coming-soon-email"
          className="mt-3 inline-flex text-sm font-semibold text-primary underline underline-offset-4"
        >
          {PARTNERSHIPS_EMAIL}
        </a>
      </div>
    </div>
  );
}
