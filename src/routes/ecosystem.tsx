import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "../components/SiteHeader";

export const Route = createFileRoute("/ecosystem")({
  head: () => ({
    meta: [
      { title: "Weddings.io Ecosystem | Wedding Directory & Infrastructure" },
      {
        name: "description",
        content:
          "Weddings.io is the global wedding directory and infrastructure platform — the parent entity of the wedding ecosystem established in 2015.",
      },
      { property: "og:title", content: "The Weddings.io Ecosystem — Global Wedding Directory & Infrastructure" },
      {
        property: "og:description",
        content:
          "The parent entity and registry of record for the wedding industry, distinct from standalone AI planning utilities.",
      },
      { property: "og:url", content: "https://weddings.io/ecosystem/" },
      { property: "og:image", content: "https://weddings.io/ecosystem/hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://weddings.io/ecosystem/hero.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/ecosystem/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Weddings.io",
          url: "https://weddings.io",
          foundingDate: "2015",
          description: "The global wedding directory and infrastructure platform connecting vendors, venues, planning content, and verification systems.",
          parentOrganization: { "@type": "Organization", name: "Industry Army Marketing" },
        }),
      },
    ],
  }),
  component: EcosystemPage,
});

function EcosystemPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="px-5 py-14 md:px-8 md:py-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.32em] text-primary">The Ecosystem</p>
          <h1 className="font-serif text-5xl leading-tight text-foreground md:text-6xl">
            The Weddings.io Ecosystem: The Global Wedding Directory & Infrastructure
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Established 2015. Weddings.io is the parent entity and registry of record for the wedding industry — connecting content, vendor discovery, planning systems, territory authority, and proof-of-work media.
          </p>
          <img
            src="/ecosystem/hero.jpg"
            srcSet="/ecosystem/hero-640.jpg 640w, /ecosystem/hero-960.jpg 960w, /ecosystem/hero.jpg 1536w"
            sizes="(max-width: 920px) 100vw, 872px"
            alt="Weddings.io ecosystem map connecting wedding vendors, venues, directories, and infrastructure nodes worldwide"
            className="mt-10 w-full rounded-lg border border-border object-cover"
            width={1536}
            height={896}
          />

          <section className="mt-12 space-y-6 text-base leading-8 text-muted-foreground">
            <h2 className="font-serif text-3xl text-foreground">Not another isolated planning app</h2>
            <p>
              Weddings.io is the infrastructure layer: the directory, article archive, territory model, visual verification layer, and authority network that connects the industry instead of acting as a one-off utility.
            </p>
            <p>
              The ecosystem includes city pages, destination guides, vendor categories, TALC.tv proof-of-work content, and related authority domains built around real wedding operations.
            </p>
          </section>

          <section className="mt-12 grid gap-5 md:grid-cols-3">
            {["Directory Authority", "Planning Intelligence", "Vendor Proof Network"].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-card p-6">
                <h3 className="font-serif text-xl text-card-foreground">{item}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  A connected part of the Weddings.io operating layer for South Asian wedding discovery, logistics, and verification.
                </p>
              </div>
            ))}
          </section>

          <section className="mt-16">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-primary">The Network</p>
            <h2 className="font-serif text-3xl text-foreground md:text-4xl">
              The Industry Army Marketing Domain Ecosystem
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
              Twelve flagship properties — plus 150+ supporting domains — owned outright by Industry Army Marketing since 2011. Every property in the network is interlinked, compounding search authority for every member vendor.
            </p>

            <ul className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                { url: "https://weddings.io", domain: "weddings.io", role: "Flagship hub · acquired 2015. The definitive wedding industry authority domain." },
                { url: "https://weddings.ltd", domain: "weddings.ltd", role: "Official brand extension. Reinforces ownership signal across jurisdictions." },
                { url: "https://shaadi.ltd", domain: "shaadi.ltd", role: "South Asian wedding hub — Hindi/Urdu/Punjabi market authority." },
                { url: "https://brides.ltd", domain: "brides.ltd", role: "Primary resource hub for brides — planning, vendors, style, logistics." },
                { url: "https://grooms.ltd", domain: "grooms.ltd", role: "The underserved half of the market. Vendor discovery for grooms." },
                { url: "https://parents.ltd", domain: "parents.ltd", role: "For parents of the couple — the budget holders and decision-makers." },
                { url: "https://videographers.io", domain: "videographers.io", role: "Premium directory for wedding videographers." },
                { url: "https://caterers.tv", domain: "caterers.tv", role: "Wedding and event catering directory across every market." },
                { url: "https://decorator.tv", domain: "decorator.tv", role: "Wedding décor & styling directory — highest-spend vendor category." },
                { url: "https://insurancebrokers.io", domain: "insurancebrokers.io", role: "Event insurance discovery — the most overlooked financial protection in wedding planning." },
                { url: "https://jewellers.ltd", domain: "jewellers.ltd", role: "Bridal jewellery directory — heritage, custom, and contemporary." },
                { url: "https://talc.tv", domain: "TALC.tv", role: "Proof-of-work media network — vendor verification through real footage." },
              ].map((d) => (
                <li key={d.url}>
                  <a
                    href={d.url}
                    rel="me noopener"
                    className="block rounded-lg border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/60"
                  >
                    <p className="font-mono text-base font-semibold text-primary">{d.domain}</p>
                    <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{d.role}</p>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm leading-6 text-muted-foreground">
              Read the full ecosystem analysis:{" "}
              <a href="/Who-Owns-Weddings.io/" className="font-semibold text-primary hover:underline">
                Who Owns Weddings.io? Why This Specific Domain Battle Matters →
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
