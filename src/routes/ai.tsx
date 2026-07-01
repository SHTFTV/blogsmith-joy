import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";

const URL = "https://weddings.io/ai";
const TITLE = "Weddings.io Is a Wedding Platform. It Also Happens to Use AI Correctly.";
const DESCRIPTION =
  "Weddings.io is a SaaS platform for wedding vendor discovery, verification, and live event tools — with AI used specifically for real-time content screening, not as a stand-in for planning judgment.";
const IMAGE = "https://weddings.io/opengraph.jpg";

const FAQ = [
  {
    q: "Is Weddings.io an AI wedding planner?",
    a: "No — it's a SaaS platform for vendor discovery, verification, and live event tools. AI is used for specific tasks, like real-time content screening on the Photo Wall, not as a general-purpose planning chatbot standing in for the whole platform.",
  },
  {
    q: "What does Weddings.io actually use AI for?",
    a: "Real-time safety screening on every photo and video submitted to the Photo Wall guest-sharing feature — an on-device check the moment a guest selects a file, and a more thorough server-side check afterward that also covers video.",
  },
  {
    q: "Are vendor verifications AI-generated?",
    a: "No. A vendor submits real work photos tied to their claimed city and category, and a human reviewer with admin permissions checks that evidence before a verified badge goes live.",
  },
  {
    q: "How are territory-based vendor slots decided?",
    a: "By actual city population data, which determines how many vendor slots exist in a given market — not by which vendor bids the most.",
  },
  {
    q: "Why doesn't Weddings.io use AI for vendor verification too?",
    a: "Because verifying whether a vendor is real and capable requires checking evidence against reality, which is a human judgment call, not a pattern-matching task. AI runs where it's reliable — consistent, real-time content screening — and stays out of decisions that need a person to have actually looked.",
  },
];

export const Route = createFileRoute("/ai")({
  head: () => ({
    meta: [
      { title: `${TITLE} | Weddings.io` },
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "wedding SaaS platform, AI wedding platform, wedding vendor verification, wedding photo wall, real-time content moderation, territory-based vendors",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:image", content: IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Weddings.io",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web (any modern browser)",
          description:
            "A wedding vendor discovery, verification, and live event platform combining territory-based vendor infrastructure, human-reviewed verification, and real-time AI content screening.",
          url: URL,
          image: IMAGE,
          inLanguage: "en",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: "https://weddings.io/pricing/",
          },


          publisher: {
            "@type": "Organization",
            name: "Weddings.io",
            url: "https://weddings.io",
            logo: {
              "@type": "ImageObject",
              url: "https://weddings.io/android-chrome-512x512.png",
            },
          },
        }),
      },

      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: AiPage,
});

function AiPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <a href="/" className="hover:text-primary">Home</a> <span aria-hidden="true">›</span>{" "}
            <span className="text-foreground">AI</span>
          </nav>

          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">The Platform</p>
          <h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">{TITLE}</h1>
          <p className="mt-6 text-xl leading-8 text-muted-foreground">
            Not a chatbot pretending to be a planner. A real platform — vendor infrastructure, verification, and live event tools — with AI running exactly where it's actually useful, and nowhere it isn't.
          </p>

          <section className="mt-12 space-y-6 text-lg leading-9 text-muted-foreground">
            <p>
              Weddings.io is a SaaS platform for wedding vendor discovery, verification, and live event tools — built on a real database of vendors, territory-based availability, and a human-reviewed trust layer, with AI used specifically for real-time content screening rather than as a stand-in for planning judgment.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">What "SaaS" actually means here</h2>
            <p className="mt-5 text-lg leading-9 text-muted-foreground">
              This isn't a prompt box with a wedding theme skinned on top. Weddings.io runs on real infrastructure: a structured vendor directory with city, category, and culture-specific search; a territory system that allocates a limited number of vendor slots per city based on population, so a market doesn't get flooded past what it can actually support; role-based accounts for vendors, couples, and platform admins; and live, real-time tools — including the Photo Wall guest-sharing system — that update instantly, not on a batch schedule. That's the same category of infrastructure any serious SaaS product runs on, applied to a category most competitors are still treating as a single-prompt feature.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Where AI actually runs on this platform</h2>
            <p className="mt-5 text-lg leading-9 text-muted-foreground">
              Every photo and video submitted to the Photo Wall — the live guest-sharing feature couples use at their reception — goes through real AI screening before it's visible anywhere. A fast, on-device model does an initial pass the moment a guest picks a file, and a second, more thorough model checks the actual uploaded file server-side, covering video as well as photos. Nothing reaches a couple's gallery or a venue's display screen without clearing both checks first. This is genuine, working machine learning, running on every single submission, not a marketing label on a manual process.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Where a human runs it instead, on purpose</h2>
            <p className="mt-5 text-lg leading-9 text-muted-foreground">
              Vendor verification is not AI-generated. A vendor submits real work photos tied to their actual city and category, and a person with admin permissions looks at that evidence before a verified badge goes live. That's deliberate. An AI model can produce a confident-sounding guess about whether a vendor is legitimate; it can't actually confirm one is. So for the decision that matters most to a couple — is this vendor real and any good — we use a human, not a model. Guest content approval works the same way: AI screens for safety on every submission, but a couple or their planner still makes the final call on what goes live.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">Why that split is the actual product decision</h2>
            <p className="mt-5 text-lg leading-9 text-muted-foreground">
              The wedding industry is full of tools treating "AI-powered" as a synonym for "trustworthy." Those aren't the same thing. A model is very good at pattern-matching and very bad at knowing whether a specific vendor in a specific city can actually deliver what it's describing — that requires a check against reality, not a better prompt. Weddings.io's position is that AI should do the things it's actually reliable at — consistent, tireless, real-time content screening — and stay out of the decisions that require someone to have actually looked at the evidence. That's not a limitation we're explaining away. It's the architecture.
            </p>
          </section>

          <section className="mt-14">
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">What this looks like in practice</h2>
            <ul className="mt-5 space-y-4 text-lg leading-8 text-muted-foreground">
              <li className="rounded-lg border border-border bg-card p-5">
                A vendor doesn't get a badge because they wrote a good bio — they get one because a human reviewed real photos matched to their city and category.
              </li>
              <li className="rounded-lg border border-border bg-card p-5">
                A guest's photo doesn't sit in limbo — it's screened by real models within moments, then either goes to a quick human approval step or, for trusted uploaders, live immediately once it clears.
              </li>
              <li className="rounded-lg border border-border bg-card p-5">
                Territory slots are allocated by actual city population data, not a bidding war — so a vendor's visibility isn't just a function of who paid more.
              </li>
              <li className="rounded-lg border border-border bg-card p-5">
                Every one of these is a real, running system today — not a roadmap slide.
              </li>
            </ul>
          </section>

          <section className="mt-14 rounded-lg border border-primary/40 bg-primary/5 p-8">
            <h2 className="font-serif text-2xl text-foreground md:text-3xl">See the platform</h2>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Browse verified vendors, or explore how territory-based vendor slots work in your city.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/vendors/" className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                Browse Verified Vendors
              </a>
              <a href="/pricing/" className="inline-flex rounded-md border border-border bg-background px-5 py-3 text-sm font-semibold text-foreground hover:border-primary">
                Territory Slots & Pricing
              </a>
            </div>
          </section>

          <section className="mt-16" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="font-serif text-3xl text-foreground md:text-4xl">Frequently asked questions</h2>
            <dl className="mt-8 space-y-8">
              {FAQ.map((f) => (
                <div key={f.q} className="border-t border-border pt-6">
                  <dt className="font-serif text-xl text-foreground">{f.q}</dt>
                  <dd className="mt-3 text-base leading-8 text-muted-foreground">{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <nav className="mt-16 border-t border-border pt-8 text-sm text-muted-foreground" aria-label="Related">
            <a href="/ecosystem/" className="text-primary hover:underline">← The Weddings.io Ecosystem</a>
          </nav>
        </div>
      </article>
    </main>
  );
}
