import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/guest-post")({
  head: () => ({
    meta: [
      { title: "Guest Post Portal — Weddings.io" },
      { name: "description", content: "Submit a guest post to Weddings.io and the IAM network. Flat $10 per accepted post. Permanent dofollow byline. No subscription required." },
      { property: "og:title", content: "Guest Post Portal — Weddings.io" },
      { property: "og:description", content: "Submit a guest post for $10 per accepted post. Permanent dofollow byline on Weddings.io." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Guest Post Portal — Weddings.io" },
      { name: "twitter:description", content: "$10 per accepted guest post. Permanent dofollow byline." },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/guest-post/" }],
  }),
  component: GuestPostPage,
});

const rules = [
  ["Original content", "Must be 100% original. No AI slop. No scraped or rewritten content."],
  ["On-topic", "Weddings, wedding industry, planning, vendor operations, or IAM ecosystem topics only."],
  ["Length", "1,200 – 3,000 words. Properly formatted with H2 / H3 / lists."],
  ["Byline", "One permanent dofollow link in author byline. Two contextual dofollows allowed in-body if relevant."],
  ["Flat $10", "$10 per accepted post. Paid via PayPal once the post is live. No refunds for rejected drafts."],
  ["Editorial control", "We may copy-edit for tone, SEO, and house style. Major rewrites are returned for approval."],
] as const;

function GuestPostPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-3 text-lg font-semibold text-primary">
            <span aria-hidden="true">🪔</span>
            <span>Weddings.io</span>
          </a>
          <a href="/" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary">
            ← Home
          </a>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.28em] text-primary">
            Guest Post Portal · Flat $10 / Accepted Post
          </p>
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
            Publish on Weddings.io.
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            Pitch a guest post for the original South Asian wedding platform. Flat $10 per accepted
            post. Permanent dofollow byline. PayPal payout once your article is live.
          </p>

          <div className="mt-10 rounded-lg border border-border bg-secondary/30 p-6">
            <h2 className="font-serif text-2xl text-primary">Submission rules</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-foreground">
              {rules.map(([k, v]) => (
                <li key={k}>
                  <span className="font-semibold text-primary">{k}:</span>{" "}
                  <span className="text-muted-foreground">{v}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 rounded-lg border border-primary/30 bg-card p-6">
            <h2 className="font-serif text-2xl text-primary">How to submit</h2>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-foreground">
              <li>Email your pitch (title + 2–3 sentence summary) to <a className="text-primary underline" href="mailto:admin@weddings.io">admin@weddings.io</a>.</li>
              <li>If accepted, send the full draft as Google Doc or markdown.</li>
              <li>We edit, schedule, and publish. You confirm the byline link.</li>
              <li>Once live, invoice $10 via PayPal. Paid within 7 days.</li>
            </ol>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="mailto:admin@weddings.io?subject=Guest%20Post%20Pitch"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Pitch a Guest Post
            </a>
            <a
              href="/pricing/"
              className="rounded-md border border-border px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
              See All Pricing
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
