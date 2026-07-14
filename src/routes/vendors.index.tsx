import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { GatewayComingSoon } from "@/components/GatewayComingSoon";

export const Route = createFileRoute("/vendors/")({
  head: () => ({
    meta: [
      { title: "List Your Wedding Business — $10/yr | Weddings.io" },
      {
        name: "description",
        content:
          "Vendor & planner sign up. List your wedding business on the Weddings.io verified directory for $10/year. Real search visibility, no corporate platform fees.",
      },
      { property: "og:title", content: "List Your Wedding Business — $10/yr | Weddings.io" },
      {
        property: "og:description",
        content:
          "Sign up your wedding business or planning studio for the Weddings.io verified directory. $10/year.",
      },
      { property: "og:url", content: "https://weddings.io/vendors/" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/vendors/" }],
  }),
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <p>{error.message}</p>
    </main>
  ),
  notFoundComponent: () => <main className="p-8">Not found.</main>,
  component: VendorsSignup,
});

type Role = "vendor" | "planner";

function VendorsSignup() {
  const [role, setRole] = useState<Role>("vendor");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-primary">
            Vendor & Planner Sign Up
          </p>
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
            List your wedding business on Weddings.io — $10/year.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
            One clean listing on the verified directory. Real search visibility, verified profile, culture &amp; territory tags. No corporate platform fees, no transactional cuts.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 text-left md:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Directory Listing</p>
              <p className="mt-2 font-serif text-2xl text-foreground">$10 / year</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Flat, worldwide. Verified profile in the directory. Same price in every country — already at the PPP floor.
              </p>
            </div>
            <div className="rounded-lg border border-primary/60 bg-primary/5 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Exclusive City Slot (Upgrade)</p>
              <p className="mt-2 font-serif text-2xl text-foreground">$10–$2,000 / mo · PPP-adjusted</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                One vendor per category per city. Priced by local population × your country's PPP index, clamped $10–$2,000/mo. No tiers, no add-ons buried in fine print. Same pricing applies inside the app for planners and vendors.{" "}
                <a href="/pricing" className="text-primary underline">See PPP pricing →</a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[1fr_1.2fr]">
          <aside className="space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-secondary/60 text-primary">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h2 className="font-serif text-2xl text-foreground">What you get</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>· Verified profile with EyeSpyR trust badge</li>
                <li>· City, category, and culture filters</li>
                <li>· Direct inbound leads — no middleman cuts</li>
                <li>· Free profile edits &amp; photo updates</li>
                <li>· Optional Position #1 &amp; TALC.tv add-ons</li>
              </ul>
            </div>
            <p className="rounded-lg border border-border bg-card p-4 text-sm leading-6 text-muted-foreground">
              We're picky about who we take on. Every listing is reviewed before it goes live.
            </p>
          </aside>

          <form
            className="rounded-xl border border-border bg-card p-6 md:p-8"
            onSubmit={(e) => e.preventDefault()}
          >
            <fieldset className="mb-6">
              <legend className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">
                I am a
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(["vendor", "planner"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`rounded-md border px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] transition ${
                      role === r
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-secondary/40 text-foreground hover:border-primary/60"
                    }`}
                  >
                    {r === "vendor" ? "Wedding Vendor" : "Wedding Planner"}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-4">
              <Field label="Business name" name="business" placeholder="Sandhu Events Co." />
              <Field label="Your name" name="contact" placeholder="First & last" />
              <Field label="Email" name="email" type="email" placeholder="you@business.com" />
              <Field label="Website" name="website" placeholder="https://" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="City" name="city" placeholder="Brampton" />
                <Field
                  label={role === "planner" ? "Studio focus" : "Category"}
                  name="category"
                  placeholder={role === "planner" ? "Multi-day South Asian" : "Photographer, Caterer, DJ…"}
                />
              </div>
              <Field
                label="Cultures served"
                name="cultures"
                placeholder="South Asian, Chinese, Persian…"
              />
              <label className="grid gap-2 text-sm">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Short description
                </span>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="What makes your work worth booking?"
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
              </label>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted-foreground">
                $10 / year — one verified listing
              </p>
              <GatewayComingSoon
                context={role === "planner" ? "Planner sign up" : "Vendor sign up"}
                subject={`${role === "planner" ? "Planner" : "Vendor"} sign up — early access`}
              />
              <p className="max-w-sm text-xs leading-5 text-muted-foreground">
                Payment gateways are closed by design while we onboard the first cohort. Hover the button for the partnerships desk.
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
      />
    </label>
  );
}
