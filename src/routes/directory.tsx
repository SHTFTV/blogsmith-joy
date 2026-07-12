import { createFileRoute, Link } from "@tanstack/react-router";
import { GatewayComingSoon } from "../components/GatewayComingSoon";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      {
        title:
          "Vendors Directory — $10/year, EyeSpyR Verified, Bidding-Ready | Weddings.io",
      },
      {
        name: "description",
        content:
          "Join the Weddings.io Vendors Directory for $10/year. Flat annual listing, EyeSpyR verified, opens into our bidding & contractor matching process. Not a City Page territory — a global directory for every wedding professional.",
      },
      {
        name: "keywords",
        content:
          "wedding vendors directory, $10 vendor listing, wedding contractor bidding, wedding vendor matching, EyeSpyR verified vendors, multicultural wedding vendors",
      },
      { property: "og:title", content: "Vendors Directory — $10/year · Weddings.io" },
      {
        property: "og:description",
        content:
          "Flat $10/year vendor listing. EyeSpyR verified. Opens into the bidding & contractor matching process.",
      },
      { property: "og:url", content: "https://weddings.io/directory" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vendors Directory — $10/year · Weddings.io" },
      {
        name: "twitter:description",
        content:
          "Flat $10/year vendor listing. EyeSpyR verified. Opens into bidding & contractor matching.",
      },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/directory" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebPage",
              "@id": "https://weddings.io/directory#webpage",
              url: "https://weddings.io/directory",
              name: "Vendors Directory — $10/year · Weddings.io",
              description:
                "Flat $10/year vendor listing that opens into the Weddings.io bidding & contractor matching process.",
              isPartOf: { "@id": "https://weddings.io/#website" },
            },
            {
              "@type": "Product",
              name: "Weddings.io Vendors Directory Listing",
              description:
                "Flat $10 USD/year vendor directory listing, EyeSpyR verified, with access to the bidding & contractor matching process.",
              brand: { "@type": "Organization", name: "Weddings.io" },
              offers: {
                "@type": "Offer",
                price: "10.00",
                priceCurrency: "USD",
                priceSpecification: {
                  "@type": "UnitPriceSpecification",
                  price: "10.00",
                  priceCurrency: "USD",
                  billingIncrement: 1,
                  unitCode: "ANN",
                  unitText: "year",
                },
                availability: "https://schema.org/InStock",
                url: "https://weddings.io/directory",
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: "https://weddings.io/" },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Vendors Directory",
                  item: "https://weddings.io/directory",
                },
              ],
            },
          ],
        }),
      },
    ],
  }),
  component: DirectoryPage,
});

const bg = "#080808";
const gold = "#c9a96e";
const text = "#f2efe8";
const serif = "'Cormorant Garamond', serif";
const sans = "Inter, sans-serif";

function DirectoryPage() {
  return (
    <main style={{ backgroundColor: bg, color: text, fontFamily: sans, minHeight: "100vh" }}>
      <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <p
          className="text-xs font-semibold uppercase tracking-[0.32em]"
          style={{ color: gold }}
        >
          Vendors Directory · $10 / year
        </p>
        <h1
          className="mt-6 text-4xl leading-tight md:text-6xl"
          style={{ fontFamily: serif, color: text }}
        >
          The global Vendors Directory. Flat $10 a year. Bidding-ready.
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8" style={{ color: `${text}cc` }}>
          Every wedding professional on Weddings.io starts here. One flat annual fee — $10
          USD/year — for a verified profile that opens directly into our{" "}
          <strong style={{ color: text }}>bidding &amp; contractor matching process</strong>.
          Couples and planners submit briefs; matching vendors quote the work. No bracket
          pricing, no bidding wars for a slot — you're always in the room.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">
          <GatewayComingSoon
            label="Apply · $10/yr"
            subject="Vendors Directory — early access"
          />
          <Link
            to="/vendors"
            className="inline-flex items-center gap-2 rounded-md border px-6 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition-opacity hover:opacity-80"
            style={{ borderColor: `${gold}66`, color: gold }}
          >
            Browse the Directory
          </Link>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "01",
              title: "Flat $10 / year",
              body: "One price for every category, every city, every culture. Renews annually. No tiers, no upsells to keep your profile live.",
            },
            {
              n: "02",
              title: "EyeSpyR Verified",
              body: "We verify credentials, active reviews, and business standing before your profile publishes. Verified vendors get the trust badge.",
            },
            {
              n: "03",
              title: "Bidding & Matching",
              body: "Briefs come in from couples and planners. Our matching engine routes them to relevant Directory vendors. You quote — they choose.",
            },
          ].map((card) => (
            <div
              key={card.n}
              className="rounded-md border p-6"
              style={{ backgroundColor: "#0f0f0f", borderColor: `${gold}33` }}
            >
              <p
                className="text-xs font-semibold uppercase tracking-[0.28em]"
                style={{ color: gold }}
              >
                {card.n}
              </p>
              <h2 className="mt-4 text-2xl" style={{ fontFamily: serif, color: text }}>
                {card.title}
              </h2>
              <p className="mt-3 text-sm leading-6" style={{ color: `${text}b3` }}>
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <section className="mt-20">
          <p
            className="text-xs font-semibold uppercase tracking-[0.32em]"
            style={{ color: gold }}
          >
            How bidding & contractor matching works
          </p>
          <ol className="mt-6 space-y-5">
            {[
              "Apply and pay $10/year. EyeSpyR runs verification.",
              "Your profile publishes to the Directory with category, culture, service area, and rate range.",
              "Couples or planners submit a brief (date, guest count, budget, ceremonies).",
              "The matching engine routes the brief to eligible Directory vendors.",
              "You review the brief and submit a quote. The client compares quotes and awards the contract.",
              "Fulfill the work. Verified reviews feed back into EyeSpyR and your Directory ranking.",
            ].map((step, i) => (
              <li key={i} className="flex gap-4">
                <span
                  className="mt-1 shrink-0 text-lg"
                  style={{ fontFamily: serif, color: gold, minWidth: "1.75rem" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ color: `${text}d9` }}>{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          className="mt-20 rounded-md border p-8"
          style={{ backgroundColor: "#0f0f0f", borderColor: `${gold}33` }}
        >
          <h2 className="text-3xl" style={{ fontFamily: serif, color: text }}>
            Directory vs. Exclusive SEO Marketing Pages
          </h2>
          <p className="mt-4" style={{ color: `${text}b3` }}>
            The Directory is open to every verified vendor at $10/year. Our{" "}
            <strong style={{ color: text }}>Exclusive SEO Marketing Pages</strong> — the City
            Pages — are different: each is territory-locked to <em>one</em> vendor per
            culture, per category, per city, priced at $10 USD per 100,000 population.
            Directory listing is the entry point; territory is the upgrade.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <GatewayComingSoon
              label="Apply for a City Page territory"
              variant="link"
              subject="City Page territory — early access"
            />
          </div>
        </section>

        <p
          className="mt-16 text-xs uppercase tracking-[0.22em]"
          style={{ color: `${text}80` }}
        >
          Directory $10/yr → bidding · City Page territory is exclusive · Partnership is a
          conversation
        </p>
      </section>
    </main>
  );
}
