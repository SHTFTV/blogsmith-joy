import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  DollarSign,
  FileText,
  Globe2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import { BlogCard } from "../components/BlogCard";

import { blogPosts, homepageCarouselPosts } from "../lib/blogPosts";
import { RotatingHeadline, CultureMosaic, CultureToolsGrid } from "../components/CultureFeatures";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Weddings.io™ — The Original Multicultural Wedding Platform | Est. May 13, 2015" },
      {
        name: "description",
        content:
          "Weddings.io is the original AI-powered multicultural wedding platform, established May 13, 2015. Verified vendors. 170 cities. 24 countries. Any wedding, any culture, any size. Est. 2015 by Industry Army Marketing.",
      },
      {
        name: "keywords",
        content:
          "Weddings.io, multicultural wedding platform, South Asian weddings, AI wedding platform, Hindu wedding, Sikh wedding, Muslim wedding, wedding vendors, original wedding platform 2015",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "author", content: "Weddings.io Technologies — Industry Army Marketing, Langley BC Canada" },
      { name: "copyright", content: "Weddings.io Technologies Est. 2015. All rights reserved." },
      { name: "founded", content: "2015-05-13" },
      { name: "geo.region", content: "CA-BC" },
      { name: "geo.placename", content: "Langley, British Columbia, Canada" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://weddings.io/" },
      { property: "og:site_name", content: "Weddings.io™" },
      { property: "og:title", content: "Weddings.io™ — The Original Multicultural Wedding Platform | Est. 2015" },
      {
        property: "og:description",
        content:
          "The original AI-powered multicultural wedding platform. Established May 13, 2015. EyeSpyR verified vendors. 170 city territories. 24 countries. Any wedding, any culture.",
      },
      { property: "og:image", content: "https://weddings.io/opengraph.jpg" },
      {
        property: "og:image:alt",
        content: "Weddings.io™ — The Original Multicultural Wedding Platform, Est. May 13, 2015",
      },
      { property: "og:locale", content: "en_CA" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@weddingsio" },
      { name: "twitter:title", content: "Weddings.io™ — The Original Multicultural Wedding Platform" },
      {
        name: "twitter:description",
        content:
          "Est. May 13, 2015. EyeSpyR verified vendors. 170 cities. 24 countries. Any wedding, any culture, any size.",
      },
      { name: "twitter:image", content: "https://weddings.io/opengraph.jpg" },
    ],
    links: [
      { rel: "canonical", href: "https://weddings.io/" },
      {
        rel: "alternate",
        type: "application/rss+xml",
        title: "Weddings.io Blog RSS",
        href: "https://weddings.io/rss.xml",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://weddings.io/#agency",
              name: "Industry Army Marketing",
              url: "https://industryarmymarketing.com",
            },
            {
              "@type": "Corporation",
              "@id": "https://weddings.io/#corporation",
              name: "Weddings.io Technologies",
              legalName: "Weddings.io Technologies",
              url: "https://weddings.io",
              foundingDate: "2015",
              knowsAbout: [
                "Traditional Weddings",
                "South Asian Wedding Customs",
                "Multicultural Wedding Planning",
                "Cultural Event Technology",
              ],
              parentOrganization: { "@id": "https://weddings.io/#agency" },
            },
            {
              "@type": "WebSite",
              "@id": "https://weddings.io/#website",
              url: "https://weddings.io",
              name: "Weddings.io",
              description:
                "The premier digital architecture for traditional and multicultural wedding celebrations.",
              publisher: { "@id": "https://weddings.io/#corporation" },
              inLanguage: "en-US",
            },
            {
              "@type": "WebPage",
              "@id": "https://weddings.io/#webpage",
              url: "https://weddings.io",
              name: "Weddings.io — Traditional & Multicultural Wedding Platform | Est. 2015",
              isPartOf: { "@id": "https://weddings.io/#website" },
              about: { "@id": "https://weddings.io/#corporation" },
              description:
                "Custom tools built for traditional wedding structures, multi-day scheduling, custom dietary requirements, seating layouts, and vendor coordination. Couples plan free.",
            },
          ],
        }),

      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Weddings.io Cultural Wedding Planning Tools",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "South Asian Wedding Planner", url: "https://weddings.io/checklist/" },
            { "@type": "ListItem", position: 2, name: "Chinese Wedding Tea Ceremony Planner", url: "https://weddings.io/tools/chinese/" },
            { "@type": "ListItem", position: 3, name: "Persian Sofreh Aghd Planner", url: "https://weddings.io/tools/persian/" },
            { "@type": "ListItem", position: 4, name: "Jewish Wedding Chuppah Planner", url: "https://weddings.io/tools/jewish/" },
            { "@type": "ListItem", position: 5, name: "Hispanic Heritage Wedding Padrinos Tracker", url: "https://weddings.io/tools/mexican/" },
            { "@type": "ListItem", position: 6, name: "Nordic Wedding Planner", url: "https://weddings.io/tools/nordic/" },
            { "@type": "ListItem", position: 7, name: "Southeast Asian Buddhist Wedding Planner", url: "https://weddings.io/tools/southeast-asian/" },
          ],
        }),
      },
    ],
  }),
  component: Index,
});

const navItems = [
  { label: "Home", href: "/" },
  { label: "Cultures", href: "/cultures" },
  { label: "Tools", href: "/tools" },
  { label: "Vendors", href: "/vendors" },
  { label: "Destinations", href: "/destinations" },
  { label: "Blog", href: "/blog" },
  { label: "Ecosystem", href: "/ecosystem" },
  { label: "Pricing", href: "/pricing" },
  { label: "Guest Post", href: "/guest-post" },
] as const;

const verificationItems = [
  ["Caterer", "Chafing Stations Lit", "🍛", true],
  ["Decorator", "Mandap Assembled", "🪷", true],
  ["Florist", "Centerpieces Placed", "💐", true],
  ["DJ / MC", "Sound Check Complete", "🎧", true],
  ["Photo/Video", "B-Roll Captured", "📸", true],
  ["Transport", "Limo at Hotel", "🚐", false],
] as const;

const schedule = [
  ["10:00", "Haldi setup", "Courtyard styling, marigold drop, henna stations ready"],
  ["13:00", "Baraat arrival", "Dhol crew, horse staging, family welcome lane clear"],
  ["15:00", "Mandap ceremony", "Pandit confirmed, floral checks, aisle reserved"],
  ["18:30", "Cocktail hour", "Passed appetizers, portrait window, lounge lighting live"],
  ["20:00", "Reception + speeches", "Head table, AV cues, first dance, plated dinner"],
] as const;

const vendorRows = [
  ["Raj Kapoor Photography", "Photographer", "$4,200", "Booked"],
  ["Spice & Soul Catering", "Caterer", "$11,800", "Booked"],
  ["Mandap Dreams Decor", "Decorator", "$3,500", "Booked"],
  ["DJ Sanj", "DJ / Music", "$2,200", "Quoted"],
  ["Henna by Priya", "Mehendi", "—", "Inquired"],
  ["Toronto Limo Co.", "Transport", "—", "Inquired"],
] as const;

const budgetRows = [
  ["Venue", "$15,000", "$14,500", "96%"],
  ["Catering", "$12,000", "$11,800", "98%"],
  ["Photography", "$5,000", "$4,200", "84%"],
  ["Decor & Florals", "$4,000", "$3,500", "88%"],
  ["DJ & Music", "$2,500", "$0", "0%"],
  ["Mehendi", "$1,000", "$0", "0%"],
] as const;

const permits = [
  ["Venue / Park Permit", "Public parks, gardens, beaches — city regs", "venue"],
  ["Noise / Sound Permit", "Outdoor DJ, dhol, live music — city hall", "venue"],
  ["Liquor License", "Special Occasion Permit for your own bar", "alcohol"],
  ["Food Handler's Permit", "Caterer proof of Safe Food Handling", "food"],
  ["Marriage License", "Local clerk's office, 30-60 days before", "legal"],
  ["Event Insurance", "Accidents, property damage, vendor no-shows", "legal"],
  ["Vendor Business Licenses", "Confirm all vendors have valid licenses", "legal"],
] as const;

const couplePlans = [
  {
    name: "Free Starter",
    label: "Try It Free",
    price: "$0",
    cadence: "no account · no card · browser storage",
    description: "Taste every tool with honest limits. Data lives in your browser — clears if you wipe it. Upgrade to save to the cloud.",
    features: [
      "Budget calculator — 5 line items max",
      "Guest list — up to 25 guests",
      "Checklist — 10 items max",
      "Floor planner — 2D only, 1 saved layout",
      "Vendor CRM — up to 3 vendors",
      "AI chatbot — 5 messages / day",
      "Culture tools — 1 culture (South Asian)",
      "Invoice builder, PDF export, photo storage — locked",
    ],
    cta: "Start Free",
    href: "/tools/",
  },
  {
    name: "Couples Cloud",
    label: "Unlock Everything",
    price: "$4.99",
    cadence: "/ month",
    description: "Cloud sync, unlimited guests, all 9 cultures, 3D floor planner, unlimited AI, photo storage, PDF export.",
    features: [
      "Unlimited guests, vendors, checklist & budget items",
      "2D + 3D floor planner — unlimited saves",
      "Invoice builder + PDF export unlocked",
      "Unlimited AI wedding chatbot",
      "All 9 culture tool pages",
      "Cloud sync across all devices",
      "5GB photo storage + 30-day backup",
      "Share board with partner or planner",
    ],
    cta: "Unlock for $4.99/mo",
    href: "/checkout/couples/",
  },
] as const;


const plannerPlans = [
  {
    name: "Starter",
    label: "Planner Starter",
    price: "$29",
    cadence: "/ month",
    description: "Up to 5 active client weddings.",
    features: [
      "All couple tools for each client",
      "Cloud sync for all clients",
      "Client portal with Weddings.io branding",
      "PDF export for all clients",
      "1 team user account",
      "Basic analytics",
      "5GB storage per client wedding",
    ],
    cta: "Start 14-Day Trial",
    href: "/checkout/planner-starter/",
  },
  {
    name: "Pro",
    label: "Planner Pro",
    price: "$59",
    cadence: "/ month",
    description: "Up to 15 active client weddings.",
    features: [
      "Everything in Starter",
      "White-label client portal",
      "Up to 3 team user accounts",
      "Revenue and analytics dashboard",
      "Priority support",
      "2 TALC.tv credits/month",
      "10GB storage per client wedding",
    ],
    cta: "Start 14-Day Trial",
    href: "/checkout/planner-pro/",
  },
  {
    name: "Studio",
    label: "Planner Studio",
    price: "$99",
    cadence: "/ month",
    description: "Unlimited active client weddings.",
    features: [
      "Everything in Pro",
      "Unlimited team user accounts",
      "Full custom branding",
      "API access",
      "Dedicated account manager",
      "5 TALC.tv credits/month",
      "Unlimited storage per client wedding",
      "Featured verified planner listing",
    ],
    cta: "Start 14-Day Trial",
    href: "/checkout/planner-studio/",
  },
] as const;

const addOns = [
  ["Position #1", "Top-of-Category Lock", "+50%", "of active slot cost / month", "Lock the #1 spot in your city-category. Adds exactly 50% of your active slot cost to monthly billing. $10 slot → +$5/mo. $290 slot → +$145/mo.", "Lock Position #1", "/dashboard/position-one/"],
  ["Backlink Pack", "High-Authority Dofollow", "$25", "one-time", "Three permanent dofollow backlinks from the IAM domain network. Pay once. Never expires.", "Get Backlinks", "/backlinks/"],
  ["TALC.tv Visual Blast", "Photo → Everywhere", "$10", "per post", "One photo becomes a 2,000-word SEO post auto-published to your city page, Google Business Profile, and social. Pay-as-you-go.", "Submit a Blast", "/talc/"],
  ["Hall Visualizer", "EyeSpyR Engine Render", "$2", "per render", "AI venue render powered by the EyeSpyR Engine. Pay-as-you-go credit. Works on any plan, including free.", "Try Visualizer", "/visualizer/"],
] as const;

const countries = [
  ["🇺🇸", "United States", "792 cities"],
  ["🇨🇦", "Canada", "79 cities"],
  ["🇮🇳", "India", "50 cities"],
  ["🇬🇧", "United Kingdom", "23 cities"],
  ["🇵🇰", "Pakistan", "15 cities"],
  ["🇦🇺", "Australia", "12 cities"],
  ["🇧🇩", "Bangladesh", "10 cities"],
  ["🇦🇪", "UAE", "5 cities"],
  ["🇸🇦", "Saudi Arabia", "4 cities"],
  ["🇳🇿", "New Zealand", "4 cities"],
  ["🇱🇰", "Sri Lanka", "3 cities"],
  ["🇲🇾", "Malaysia", "3 cities"],
  ["🇸🇬", "Singapore", "1 city"],
  ["🇶🇦", "Qatar", "1 city"],
  ["🇰🇼", "Kuwait", "1 city"],
  ["🇧🇭", "Bahrain", "1 city"],
  ["🇴🇲", "Oman", "1 city"],
  ["🇿🇦", "South Africa", "2 cities"],
  ["🇰🇪", "Kenya", "2 cities"],
  ["🇫🇯", "Fiji", "2 cities"],
  ["🇲🇺", "Mauritius", "2 cities"],
  ["🇹🇹", "Trinidad & Tobago", "2 cities"],
  ["🇬🇾", "Guyana", "1 city"],
  ["🇸🇷", "Suriname", "1 city"],
] as const;

const traditions = [
  ["🕌", "Punjabi Sikh", "Anand Karaj · Dholki · Mehndi · Haldi · Baraat · Reception"],
  ["🕉️", "Punjabi Hindu", "Sagan · Mehndi · Haldi · Baraat · Phere · Reception"],
  ["🌙", "Muslim / Nikah", "Mehndi · Dholki · Baraat · Nikah · Walima"],
  ["🪔", "Gujarati", "Garba · Mehndi · Haldi · Phere · Reception"],
  ["🌺", "South Indian", "Nichayathartham · Mehndi · Muhurtam · Reception"],
  ["✨", "Intercultural", "Mix and match ceremonies from any tradition — fully customisable"],
] as const;

const founderQuotes = [
  {
    quote:
      "I'm not putting fake five-star reviews on this site. If we don't have real planners on the ground and real content coming out of real weddings, this whole thing isn't worth anything. That's the bar.",
    context: "On why Weddings.io ships with zero fabricated testimonials",
  },
  {
    quote:
      "Every city needs a real human planner who actually shows up. The tech is here to make them 10x more powerful — not to replace them with a chatbot and a stock photo.",
    context: "On the Territory Lock model",
  },
  {
    quote:
      "EyeSpyR exists because the industry lied for a decade. GPS-verified work, verified credentials, real photos from real events — or you don't get to be on the platform. Simple.",
    context: "On verified vendors and real content",
  },
] as const;


function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <HeroSection />
      <CultureToolsGrid />
      <AuthoritySection />
      <DashboardSection />
      <VendorBudgetSection />
      <PricingSection />
      <FootprintSection />
      <TraditionsSection />
      <GreenLightSection />
      <PlannerHubSection />
      <PlannersMessageSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 md:px-8">
        <a href="/" className="flex items-center gap-3 text-lg font-semibold text-primary">
          <span aria-hidden="true">🪔</span>
          <span>Weddings.io Technologies</span>
        </a>
        <nav
          aria-label="Main navigation"
          className="flex max-w-full flex-wrap items-center justify-end gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/pricing"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition hover:opacity-90"
          >
            Get Started
          </a>
        </nav>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-primary">
            Est. 2015 · Traditional & Multicultural Weddings · Ecosystem SaaS Marketplace
          </p>
          <RotatingHeadline />
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
            Any wedding, any size, any culture — traditional, multicultural, or fusion. Built on a
            highly adjustable multi-tenant tech stack we can reshape in minutes, and delivered
            through an ecosystem of connected industry hubs that make it easier for every business
            partner in the wedding industry to grow together.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/cultures/"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
            >
              Explore All Cultures <ArrowRight className="size-4" />
            </a>
            <a
              href="/tools"
              className="rounded-md border border-border px-6 py-3 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
            >
              Plan My Wedding
            </a>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-2 gap-4 border-t border-border pt-7 md:grid-cols-4">
            <Stat value="1,018" label="Cities" />
            <Stat value="24" label="Countries" />
            <Stat value="8" label="Cultures" />
            <Stat value="$10/mo" label="From" />
          </div>
          <div className="mt-10 lg:hidden">
            <CultureMosaic />
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <VerificationCard />
          <div className="hidden lg:block">
            <CultureMosaic />
          </div>
        </div>
      </div>
    </section>
  );
}

function VerificationCard() {
  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-2xl">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Green Light</p>
          <h2 className="mt-2 font-serif text-3xl text-card-foreground">Verification</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            No more verbal promises. Photo-verified proof. Every vendor. Every task.
          </p>
        </div>
        <div className="rounded-md border border-border bg-secondary px-3 py-2 text-right text-sm font-bold text-primary">
          6/6 Verified
        </div>
      </div>
      <blockquote className="mb-5 border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
        “If the limo isn't there, the light stays gray.”
      </blockquote>
      <div className="space-y-3">
        {verificationItems.map(([role, task, icon, done]) => (
          <div
            key={role}
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-md border border-border bg-secondary/50 p-3"
          >
            <span
              className={`flex size-8 items-center justify-center rounded-full ${done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
            >
              {done ? <Check className="size-4" /> : <Clock className="size-4" />}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                {role}
              </p>
              <p className="text-sm font-semibold text-card-foreground">{task}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Photo</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuthoritySection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          Est. May 13, 2015
        </p>
        <h2 className="font-serif text-4xl text-foreground md:text-6xl">
          A Decade of <em className="text-primary">Authority.</em>
        </h2>
        <div className="mt-9 rounded-lg border border-border bg-card p-7 text-left md:p-10">
          <p className="text-lg leading-8 text-muted-foreground">
            Established on May 13, 2015, Weddings.io is the original digital cornerstone for the
            South Asian wedding industry. While others try to imitate, we have spent over a decade
            building the infrastructure to support the “small guy” and the artisans who make this
            industry world-class.
          </p>
          <p className="mt-5 text-lg font-semibold text-foreground">
            We don't just market; we protect the legacy.
          </p>
        </div>
      </div>
    </section>
  );
}

function DashboardSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Your Dashboard"
          title="Everything in One Place."
          copy="Schedule, tables, dietary, room map, vendors — all managed from a single dashboard. Built for planners, couples, and the parents running the show."
        />
        <div className="mt-10 rounded-lg border border-border bg-card p-5 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Wedding</p>
              <h3 className="mt-2 font-serif text-3xl text-card-foreground">Priya & Arjun</h3>
              <p className="mt-1 text-sm text-muted-foreground">Toronto · 14 June 2026</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
              {["Overview", "Schedule", "Room Map", "Tables", "Dietary", "Vendors", "Timeline"].map(
                (item) => (
                  <span key={item} className="rounded-md border border-border px-3 py-2">
                    {item}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="grid gap-5 py-6 md:grid-cols-4">
            <StatCard label="Guests" value="386" />
            <StatCard label="Tables" value="12" />
            <StatCard label="Dietary tags" value="18" />
            <StatCard label="Shortlisted vendors" value="4" />
          </div>
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Panel
              title="Schedule"
              subtitle="Whole wedding weekend at a glance"
              badge="5 key moments locked"
            >
              <div className="space-y-4">
                {schedule.map(([time, title, desc]) => (
                  <div key={time} className="grid grid-cols-[4rem_1fr] gap-4">
                    <span className="text-sm font-bold text-primary">{time}</span>
                    <div>
                      <p className="font-semibold text-card-foreground">{title}</p>
                      <p className="text-sm leading-6 text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel
              title="Room Map"
              subtitle="See the whole room before the wedding day"
              badge="Table 8 selected"
            >
              <div className="rounded-md border border-border bg-secondary/50 p-4">
                <div className="mb-4 rounded-md border border-primary/50 p-4 text-center text-xs font-bold uppercase tracking-[0.2em] text-primary">
                  Mandap / Stage
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`aspect-square rounded-md border border-border ${i === 7 ? "bg-primary text-primary-foreground" : "bg-card text-card-foreground"} flex items-center justify-center text-sm font-bold`}
                    >
                      T{i + 1}
                    </div>
                  ))}
                </div>
                <div className="my-4 rounded-md bg-muted p-4 text-center text-sm font-semibold text-muted-foreground">
                  Dance Floor
                </div>
              </div>
            </Panel>
            <Panel title="Tables" subtitle="Who sits where" badge="Close to stage">
              <p className="mb-4 text-sm text-muted-foreground">
                Drag guests between tables — dietary tags follow automatically.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["👴👵", "Nani + Nana", "Elder access"],
                  ["🌸", "Bride cousins", "Vegetarian"],
                  ["✈️", "Toronto friends", "No nuts"],
                  ["👶", "Kids table split", "2 high chairs"],
                  ["💃", "Auntie row", "Close to stage"],
                ].map(([icon, title, tag]) => (
                  <MiniRow key={title} icon={icon} title={title} tag={tag} />
                ))}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                ♿ 5 guests flagged for elder-access seating near the exit
              </p>
            </Panel>
            <Panel
              title="Dietary"
              subtitle="Track meal needs without spreadsheets"
              badge="Live export"
            >
              <p className="mb-5 text-sm text-muted-foreground">
                Auto-synced from your guest list — caterer gets a live export.
              </p>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["🥬", "Vegetarian", "96"],
                  ["🕌", "Jain", "14"],
                  ["🚫", "No nuts", "7"],
                  ["👶", "Kids meals", "11"],
                ].map(([icon, label, value]) => (
                  <div
                    key={label}
                    className="rounded-md border border-border bg-secondary/40 p-4 text-center"
                  >
                    <div className="text-2xl">{icon}</div>
                    <p className="mt-2 text-xs text-muted-foreground">{label}</p>
                    <p className="text-2xl font-bold text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}

function VendorBudgetSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Vendor & Budget Tools"
          title="Track Every Vendor. Every Dollar."
          copy="From first inquiry to final receipt — manage vendors, budgets, invoices, and payments all in one place, including PayPal collection. No more spreadsheets."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <Panel title="My Vendors" subtitle="Your entire team, one view" badge="6 booked">
            {vendorRows.map(([name, type, price, status]) => (
              <div
                key={name}
                className="mb-3 flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3"
              >
                <div>
                  <p className="font-semibold text-card-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{price}</p>
                  <p className="text-xs text-muted-foreground">{status}</p>
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            title="Budget Tracker"
            subtitle="Know exactly where you stand"
            badge="$18,600 remaining"
          >
            <div className="mb-5 grid grid-cols-3 gap-3 text-center">
              <StatCard label="Total Budget" value="$50,300" />
              <StatCard label="Spent So Far" value="$31,700" />
              <StatCard label="Remaining" value="$18,600" />
            </div>
            {budgetRows.map(([name, budget, spent, width]) => (
              <div key={name} className="mb-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span>{name}</span>
                  <span className="text-muted-foreground">
                    {spent} / {budget}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width }} />
                </div>
              </div>
            ))}
          </Panel>
          <Panel
            title="Invoices & Receipts"
            subtitle="Every payment, documented — PayPal ready"
            badge="All · Paid · Pending"
          >
            <div className="space-y-3">
              {[
                ["Raj Kapoor Photography", "$2,100", "50% deposit — wedding day shoot", "Paid"],
                ["Spice & Soul Catering", "$3,540", "Menu tasting + booking deposit", "Paid"],
                ["Mandap Dreams Decor", "$3,500", "Full decor package — mandap + stage", "Paid"],
                ["Raj Kapoor Photography", "$2,100", "Remaining balance due", "Pending"],
                ["Spice & Soul Catering", "$8,260", "Final headcount adjustment", "Pending"],
              ].map(([name, price, note, status]) => (
                <div
                  key={`${name}-${note}`}
                  className="rounded-md border border-border bg-secondary/40 p-3"
                >
                  <div className="flex justify-between gap-3">
                    <p className="font-semibold text-card-foreground">{name}</p>
                    <p className="font-bold text-primary">{price}</p>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{note}</p>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {status}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div className="mt-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-5 flex items-center gap-3">
            <FileText className="size-6 text-primary" />
            <div>
              <h3 className="font-serif text-2xl text-card-foreground">Permits & Licenses</h3>
              <p className="text-sm text-muted-foreground">
                Don't get caught without these — every city has different rules.
              </p>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {permits.map(([name, desc, tag]) => (
              <div key={name} className="rounded-md border border-border bg-secondary/40 p-4">
                <p className="font-semibold text-card-foreground">{name}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{desc}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-wider text-primary">
                  {tag}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-primary">3 of 7 done</p>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl space-y-16">
        <SectionIntro
          eyebrow="Master Pricing · Source of Truth"
          title="All pricing. One place."
          copy="Couples plan free. Vendors pay only for what they lock. No bundles, no retainers, no contracts."
        />

        <div id="couples">
          <SectionIntro
            eyebrow="Section 1 · For Couples"
            title="Plan your wedding free."
            copy="Every tool is free. We only charge for cloud sync and photo storage."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {couplePlans.map((plan) => (
              <PlanCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>

        <div id="planners">
          <SectionIntro
            eyebrow="Section 2 · For Planners & Vendors"
            title="Planner pages are $10/year."
            copy="All vendors get a planner page for a flat $10/year to join the IAM ECO System and bidding platforms. No tiers. No add-ons. One price, one door in."
          />
          <div className="mt-8 rounded-lg border border-primary/40 bg-card p-6 md:p-8">
            <p className="font-serif text-3xl text-foreground md:text-4xl">
              $10 / year · flat · every vendor
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              IAM ECO System directory listing, bidding platform access, and EyeSpyR verification
              eligibility. Upgrade to an exclusive city territory any time — priced at
              <strong className="text-foreground"> $10 USD × ⌊population ÷ 100,000⌋</strong>, minimum $10/month.
            </p>
            <a
              href="/pricing"
              className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
            >
              See Territory Pricing →
            </a>
          </div>
        </div>

        <TerritoryPricingBlock />


        <div id="addons">
          <SectionIntro
            eyebrow="Section 5 · Add-Ons"
            title="Pay for what you use."
            copy="No bundles. No retainers. Every add-on is à la carte and works on any plan — including free."
          />
          <div className="mt-8 grid gap-6 lg:grid-cols-4">
            {addOns.map(([name, label, price, cadence, description, cta, href]) => (
              <PlanCard
                key={name}
                name={name}
                label={label}
                price={price}
                cadence={cadence}
                description={description}
                features={[]}
                cta={cta}
                href={href}
              />
            ))}
          </div>
          <div className="mt-6 rounded-lg border border-dashed border-border bg-secondary/40 p-5">
            <p className="font-serif text-xl text-primary">Guest Posting — $10</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Permanent byline, dofollow backlinks, and an author profile at /contributors/[name]/.
              Pitch partnerships@industryarmymarketing.com with subject “Guest Post: [Your Title]”.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const territoryExamples: ReadonlyArray<{
  city: string;
  detail: string;
  price: string;
  href: string;
  talk?: boolean;
}> = [
  { city: "Small towns", detail: "Under 100K population", price: "$10/mo", href: "/apply" },
  { city: "Surrey, BC", detail: "570,000 population", price: "$50/mo", href: "/apply" },
  { city: "Vancouver, BC", detail: "675,000 population", price: "$60/mo", href: "/apply" },
  { city: "Toronto, ON", detail: "2.9M population", price: "$290/mo", href: "/apply" },
  { city: "London, UK", detail: "9M population", price: "$900/mo", href: "/apply" },
  { city: "Mumbai", detail: "20M+ population", price: "District pricing", href: "/partners", talk: true },
];


const accessTiers = [
  {
    n: "01",
    name: "Vendors Directory",
    price: "$10 / year",
    tagline: "Flat annual listing. EyeSpyR verified. Bidding-ready.",
    body: "Every vendor starts here — $10/year, flat, regardless of city or category. Your verified profile opens into our bidding & contractor matching process, where couples and planners send briefs and you quote the work.",
    cta: "Apply · $10/yr",
    href: "/directory",
  },
  {
    n: "02",
    name: "Exclusive SEO Marketing Pages",
    price: "$10 / 100K / mo",
    tagline: "One vendor locks the City Page for their culture & category.",
    body: "Territory = exclusive SEO lock on the City Page (e.g. Hindu Weddings · Surrey, BC). $10 USD per 100,000 population, rounded down to the nearest $10. Minimum $10/mo. One slot per culture, per category, per city — selected by us.",
    cta: "Apply for Territory",
    href: "/apply",
  },
  {
    n: "03",
    name: "Partnership",
    price: "Talc Credits",
    tagline: "Megacity partners & rising stars.",
    body: "For districts over 2M and vendors we want to build with long-term. Talc credits as currency. Every partnership is a conversation.",
    cta: "Talk to Us",
    href: "/partners",
  },
] as const;

function TerritoryPricingBlock() {
  return (
    <div
      id="territory"
      className="rounded-lg border p-6 md:p-10"
      style={{ backgroundColor: "#080808", borderColor: "#c9a96e33", color: "#f2efe8" }}
    >
      <p
        className="mb-4 text-xs font-semibold uppercase tracking-[0.32em]"
        style={{ color: "#c9a96e" }}
      >
        Section 3 · Territory
      </p>
      <h3
        className="max-w-3xl font-serif text-4xl leading-tight md:text-5xl"
        style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2efe8" }}
      >
        Exclusive SEO Marketing Pages. $10 per 100,000 people.
      </h3>
      <p
        className="mt-4 max-w-2xl text-base leading-7"
        style={{ fontFamily: "Inter, sans-serif", color: "#f2efe8cc" }}
      >
        Every City Page is an exclusive SEO lock — one vendor per culture, per category, per city.
        One formula, all USD: your city's population sets the price, rounded down to the nearest
        $10, minimum $10/mo. Not on a City Page? The <strong style={{ color: "#f2efe8" }}>Vendors
        Directory</strong> is $10/year flat and opens into our bidding & contractor matching process.
      </p>

      <div className="mt-10 overflow-hidden rounded-md border" style={{ borderColor: "#c9a96e33" }}>
        <table className="w-full text-left text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          <thead>
            <tr style={{ backgroundColor: "#0f0f0f", color: "#c9a96e" }}>
              <th className="px-5 py-3 text-xs uppercase tracking-[0.2em]">City</th>
              <th className="px-5 py-3 text-xs uppercase tracking-[0.2em]">Population</th>
              <th className="px-5 py-3 text-xs uppercase tracking-[0.2em]">Territory</th>
            </tr>
          </thead>
          <tbody>
            {territoryExamples.map((row) => (
              <tr
                key={row.city}
                className="border-t"
                style={{ borderColor: "#c9a96e1f", color: "#f2efe8" }}
              >
                <td className="px-5 py-4 font-semibold">{row.city}</td>
                <td className="px-5 py-4" style={{ color: "#f2efe8b3" }}>{row.detail}</td>
                <td className="px-5 py-4">
                  {row.talk ? (
                    <a
                      href={row.href}
                      className="inline-flex items-center gap-1 font-semibold transition-opacity hover:opacity-80"
                      style={{ color: "#c9a96e" }}
                    >
                      {row.price} · Talk to us →
                    </a>
                  ) : (
                    <span className="font-semibold" style={{ color: "#c9a96e" }}>{row.price}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {accessTiers.map((tier) => (
          <div
            key={tier.n}
            className="flex flex-col rounded-md border p-6"
            style={{ backgroundColor: "#0f0f0f", borderColor: "#c9a96e33" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.28em]"
              style={{ color: "#c9a96e" }}
            >
              {tier.n} · {tier.name}
            </p>
            <p
              className="mt-4 font-serif text-3xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: "#f2efe8" }}
            >
              {tier.price}
            </p>
            <p
              className="mt-2 text-sm font-semibold"
              style={{ fontFamily: "Inter, sans-serif", color: "#f2efe8" }}
            >
              {tier.tagline}
            </p>
            <p
              className="mt-3 flex-1 text-sm leading-6"
              style={{ fontFamily: "Inter, sans-serif", color: "#f2efe8b3" }}
            >
              {tier.body}
            </p>
            <a
              href={tier.href}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] transition-opacity hover:opacity-80"
              style={{ color: "#c9a96e" }}
            >
              {tier.cta} →
            </a>
          </div>
        ))}
      </div>

      <p
        className="mt-8 text-xs uppercase tracking-[0.22em]"
        style={{ fontFamily: "Inter, sans-serif", color: "#f2efe880" }}
      >
        Directory $10/yr → bidding · City Page territory is exclusive · Partnership is a conversation
      </p>
    </div>
  );
}

function FootprintSection() {

  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The Global Footprint"
          title="The World's Wedding Disruptor. Est. 2015."
          copy="9 cultures. Territory-locked vendors. $10/month."
        />
        <div className="mt-10 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {countries.map(([flag, name]) => (
            <div
              key={name}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2.5"
            >
              <span className="text-xl leading-none">{flag}</span>
              <p className="text-sm font-medium text-card-foreground truncate">{name}</p>
            </div>
          ))}
        </div>
        <a
          href="/cities"
          className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
        >
          Explore All 1,018 Cities <Globe2 className="size-4" />
        </a>
      </div>
    </section>
  );
}

function TraditionsSection() {
  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Traditions Supported"
          title="Your ceremony. Your task list."
          copy="Choose a tradition in the New Wedding Wizard and the right ceremonies, tasks, vendor checklist, and permit requirements generate automatically."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {traditions.map(([icon, name, desc]) => (
            <div key={name} className="rounded-lg border border-border bg-card p-6">
              <div className="text-3xl">{icon}</div>
              <h3 className="mt-4 font-serif text-2xl text-card-foreground">{name}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GreenLightSection() {
  const steps = [
    [
      "Step 1 — Vendor Action",
      "Caterer snaps a photo of the buffet.",
      "Vendor uploads proof of delivery via the Talc.tv app.",
    ],
    [
      "Step 2 — TALC.tv Sync",
      "AI verifies location and quality via EyeSpyR.",
      "GPS coordinates confirm the vendor is on-site. AI checks photo quality.",
    ],
    [
      "Step 3 — The Green Light",
      "The couple's dashboard flips to GREEN.",
      "Task Complete. Real-time confirmation — no phone calls, no stress.",
    ],
  ];
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The “Green Light”"
          title="Real-Time Logistics. Zero Stress."
          copy="Don't wonder if the car is on its way or if the hall is ready. See it live. Powered by Talc.tv and EyeSpyR GPS verification."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {steps.map(([kicker, title, desc]) => (
            <div key={kicker} className="rounded-lg border border-border bg-card p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{kicker}</p>
              <h3 className="mt-4 font-serif text-2xl text-card-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <LiveStatus />
          <div className="rounded-lg border border-border bg-card p-7">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
              Day-Of Mode
            </p>
            <h3 className="mt-3 font-serif text-4xl text-card-foreground">
              The wedding day runs on green.
            </h3>
            <p className="mt-5 leading-7 text-muted-foreground">
              Every task has one job on the day — get flipped green. Large tap targets, minimal
              distractions, designed to be used in a lehenga with one hand while coordinating six
              things at once.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                [Camera, "Photo proof — mandatory photo before tasks can go green"],
                [Clock, "Overdue alerts — tasks past their time pulse red"],
                [ShieldCheck, "Private by default — staff never see vendor names or prices"],
                [Check, "Staff see their tasks only — filtered to what they need next"],
              ].map(([Icon, text]) => (
                <div
                  key={text as string}
                  className="flex gap-3 rounded-md border border-border bg-secondary/40 p-4"
                >
                  <Icon className="mt-1 size-5 text-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{text as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PlannerHubSection() {
  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="The Planner Hub"
          title="Built for Weddings Worldwide."
          copy="A global weddings technologies marketplace — accessible to every couple and every planner. Manage your entire vendor fleet from one Talc.tv dashboard with one-click SEO blasts for every event."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            [
              MapPin,
              "Claim Your Territory",
              "Exclusive city locks starting at $5/month. One vendor per city — pricing scales with local wedding market population.",
              "1,018 cities across 24 countries",
            ],
            [
              Globe2,
              "SEO Landing Pages",
              "Every city gets a multi-language SEO page — Hindi, Urdu, Arabic, Bengali, Tamil, Malay, English.",
              "7 languages, automatic RTL",
            ],
            [
              Camera,
              "TALC.tv Content Blasts",
              "One photo becomes a 2,000-word AI blog pushed to weddings.io, Google My Business, X, Facebook, Instagram.",
              "Powered by EyeSpyR GPS verification",
            ],
          ].map(([Icon, title, desc, note]) => (
            <div key={title as string} className="rounded-lg border border-border bg-card p-6">
              <Icon className="size-7 text-primary" />
              <h3 className="mt-4 font-serif text-2xl text-card-foreground">{title as string}</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{desc as string}</p>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {note as string}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlannersMessageSection() {
  return (
    <section className="border-b border-border bg-background px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          A Message To Planners
        </p>
        <h2 className="font-serif text-4xl leading-tight text-foreground md:text-5xl">
          Who is this for?
        </h2>
        <p className="mt-6 text-xl leading-9 text-muted-foreground">
          People doing great work — and serious about expressing it online as well.
        </p>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
          If you plan real weddings, show up for real couples, and want a platform that treats your
          craft with the same seriousness you bring to the aisle — you're the reason this exists.
          One planner per city. Verified work. Real reviews. No stock. No fakes. No AI slop.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <a
            href="/apply/"
            className="inline-flex rounded-md bg-primary px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
          >
            Apply →
          </a>
          <a
            href="/planners"
            className="inline-flex rounded-md border border-border px-6 py-3 text-sm font-bold uppercase tracking-[0.14em] text-foreground hover:border-primary hover:text-primary"
          >
            See Planner Tools
          </a>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-5xl text-center">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.32em] text-primary">
          Learn More
        </p>
        <h2 className="font-serif text-4xl text-foreground md:text-6xl">
          How It Works For Wedding Planners Marketing
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
          Watch how vendors lock territories, couples find planners, and TALC.tv distributes content
          across the platform — all from a single dashboard. Built for weddings worldwide.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Lock a city", "Become the exclusive vendor"],
            ["2", "Couples find you", "SEO pages in 7 languages"],
            ["3", "TALC.tv amplifies", "$10 content blasts everywhere"],
          ].map(([num, title, desc]) => (
            <div key={num} className="rounded-lg border border-border bg-card p-6">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {num}
              </div>
              <h3 className="mt-5 font-serif text-2xl text-card-foreground">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-primary/30 bg-primary/5 p-6 text-left md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">
            For Planners
          </p>
          <p className="mt-3 font-serif text-2xl leading-snug text-foreground md:text-3xl">
            Manage your entire vendor fleet from one Talc.tv dashboard.
          </p>
          <p className="mt-3 text-base leading-7 text-muted-foreground">
            One-click SEO blasts for every event — built for the largest, most complex weddings
            in the world.
          </p>
        </div>

        <a
          href="/pricing"
          className="mt-8 inline-flex rounded-md bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Get Started Today
        </a>
      </div>
    </section>

  );
}

function BlogSection() {
  const latestPosts = homepageCarouselPosts.slice(0, 3);


  return (
    <section className="border-b border-border bg-secondary/30 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              Latest from the Blog
            </p>
            <h2 className="font-serif text-4xl text-foreground md:text-5xl">
              New Weddings.io articles are live
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              The homepage now surfaces the newest June 2026 culture guides, territory pricing,
              AI disruption analysis, and the recent vendor trust posts — no more stale May-only feed.
            </p>
          </div>
          <a href="/blog/" className="text-sm font-bold text-primary">
            View all {blogPosts.length} posts →
          </a>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {latestPosts.map((post, index) => (
            <BlogCard key={post.slug} post={post} featured={index === 0} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="/blog/" className="inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">
            View all posts →
          </a>
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="border-b border-border bg-secondary/20 px-5 py-16 md:px-8 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionIntro
          eyebrow="Straight from the Founder"
          title="No fake reviews. Real planners. Real content. Or this isn't worth building."
          copy="We refuse to fabricate testimonials. Instead, here's what the founder has said about why this platform only works with real humans on the ground and verified work from real weddings."
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {founderQuotes.map(({ quote, context }) => (
            <figure key={context} className="flex h-full flex-col rounded-lg border border-border bg-card p-7">
              <blockquote className="flex-1 text-lg leading-8 text-card-foreground">
                <span className="mr-1 font-serif text-3xl text-primary">“</span>
                {quote}
                <span className="ml-1 font-serif text-3xl text-primary">”</span>
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-4">
                <p className="font-bold text-primary">Anit Kumar — Founder, Weddings.io Technologies</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {context}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-14 grid gap-4 rounded-xl border border-primary/40 bg-primary/5 p-8 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Are you a real planner?</p>
            <h3 className="mt-3 font-serif text-3xl text-foreground">Claim your city before someone else does.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              One planner per city. Verified credentials. Verified work. If that's you, we want you on the platform.
            </p>
            <a
              href="/apply/"
              className="mt-5 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
            >
              Apply as a Real Planner →
            </a>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-primary">Do you make real content?</p>
            <h3 className="mt-3 font-serif text-3xl text-foreground">Submit real work from a real wedding.</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Photographers, videographers, planners, decor teams — send verified work and get distributed on TALC.tv.
              No stock. No fakes. No AI slop.
            </p>
            <a
              href="/guest-post/"
              className="mt-5 inline-flex rounded-md border-2 border-primary px-5 py-3 text-sm font-bold text-primary hover:bg-primary hover:text-primary-foreground"
            >
              Submit Real Content →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


function Footer() {
  const ecosystem = [
    { url: "https://weddings.io", label: "Weddings.io", note: "Flagship platform · est. 2015" },
    { url: "https://weddingsaas.com", label: "WeddingSaaS.com", note: "Multi-tenant SaaS engine" },
  ];
  const hubs = [
    { url: "https://brides.ltd", label: "Brides.ltd", note: "Bridal planning hub" },
    { url: "https://grooms.ltd", label: "Grooms.ltd", note: "Groom planning hub" },
    { url: "https://parents.ltd", label: "Parents.ltd", note: "Parents of the couple" },
    { url: "https://jewellers.ltd", label: "Jewellers.ltd", note: "Bridal jewellery" },
    { url: "https://videographers.io", label: "Videographers.io", note: "Videographer directory" },
    { url: "https://pressrelease.ltd", label: "PressRelease.ltd", note: "Industry distribution" },
    { url: "https://ipos.ltd", label: "IPOs.ltd", note: "Market & company intelligence" },
    { url: "https://talc.tv", label: "TALC.tv", note: "Proof-of-work media" },
  ];
  return (
    <footer className="px-5 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-primary">Weddings.io Technologies</p>
        <h2 className="mt-3 font-serif text-4xl text-foreground">Est. 2015 · Ecosystem SaaS Marketplace</h2>
        <p className="mt-5 max-w-4xl leading-7 text-muted-foreground">
          Weddings.io Technologies is the corporate technology entity behind a traditional &
          multicultural wedding ecosystem — a state-of-the-art multi-tenant SaaS stack, adjustable
          in minutes, powering an interconnected network of consumer and industry hubs that help
          every business partner in the wedding industry grow together.
        </p>
        <p className="mt-5 text-sm font-semibold text-foreground">
          Partnerships & Opportunities: partnerships@industryarmymarketing.com
        </p>

        <div className="mt-12 grid gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">The Ecosystem</p>
            <ul className="space-y-3 text-sm">
              {ecosystem.map((d) => (
                <li key={d.url}>
                  <a href={d.url} rel="me noopener" className="block text-foreground transition hover:text-primary">
                    <span className="font-mono font-semibold">{d.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{d.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">Connected Industry Hubs</p>
            <ul className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {hubs.map((d) => (
                <li key={d.url}>
                  <a href={d.url} rel="me noopener" className="block text-foreground transition hover:text-primary">
                    <span className="font-mono font-semibold">{d.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{d.note}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border/40 pt-8 grid gap-8 md:grid-cols-3">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">Cultures Served</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><a href="/cultures/" className="hover:text-primary">All cultures & traditions</a></li>
              <li><a href="/tools/traditional/" className="hover:text-primary">Traditional & Religious</a></li>
              <li><a href="/tools/south-asian/" className="hover:text-primary">South Asian</a></li>
              <li><a href="/tools/chinese/" className="hover:text-primary">Chinese</a></li>
              <li><a href="/tools/persian/" className="hover:text-primary">Persian</a></li>
              <li><a href="/tools/jewish/" className="hover:text-primary">Jewish</a></li>
              <li><a href="/tools/mexican/" className="hover:text-primary">Hispanic Heritage</a></li>
              <li><a href="/tools/nordic/" className="hover:text-primary">Nordic</a></li>
              <li><a href="/tools/southeast-asian/" className="hover:text-primary">Southeast Asian</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">For Vendors & Planners</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><a href="/pricing" className="hover:text-primary">Pricing</a></li>
              <li><a href="/planners" className="hover:text-primary">Planners</a></li>
              <li><a href="/vendors" className="hover:text-primary">Vendor directory</a></li>
              <li><a href="/contribute" className="hover:text-primary">Contribute</a></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-primary">Technology</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li>Multi-tenant SaaS engine</li>
              <li>Adjustable stack — reshaped in minutes</li>
              <li>Ecosystem marketplace</li>
              <li>SEO directory infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border/40 pt-6 text-xs leading-6 text-muted-foreground">
          <p>
            <strong className="text-foreground">Weddings.io Technologies — corporate technology entity operated by Industry Army Marketing, Langley, British Columbia, Canada. Est. 2015. Not affiliated with AIWeddings.io or Weddings.io Inc. of Ontario.</strong>{" "}
            © 2015–2026 Weddings.io Technologies. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function SectionIntro({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">{eyebrow}</p>
      <h2 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">{title}</h2>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">{copy}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl text-primary">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-4">
      <p className="text-2xl font-bold text-primary">{value}</p>
      <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
function Panel({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">{title}</p>
          <h3 className="mt-2 font-serif text-2xl text-card-foreground">{subtitle}</h3>
        </div>
        <span className="rounded-md border border-border bg-secondary px-3 py-1 text-xs font-bold text-primary">
          {badge}
        </span>
      </div>
      {children}
    </section>
  );
}
function MiniRow({ icon, title, tag }: { icon: string; title: string; tag: string }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3">
      <p className="font-semibold text-card-foreground">
        <span className="mr-2">{icon}</span>
        {title}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{tag}</p>
    </div>
  );
}
function PlanCard({
  name,
  label,
  price,
  cadence,
  description,
  features,
  cta,
  href = "/pricing/",
}: {
  name: string;
  label: string;
  price: string;
  cadence: string;
  description: string;
  features: readonly string[];
  cta: string;
  href?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">{name}</p>
      <h3 className="mt-3 font-serif text-3xl text-card-foreground">{label}</h3>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-bold text-primary">{price}</span>
        <span className="text-sm text-muted-foreground">{cadence}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
      <ul className="mt-5 space-y-2 text-sm text-muted-foreground">
        {features.map((item) => (
          <li key={item} className="flex gap-2">
            <Check className="mt-0.5 size-4 text-primary" />
            {item}
          </li>
        ))}
      </ul>
      <a
        href={href}
        className="mt-6 block rounded-md bg-primary px-4 py-3 text-center text-sm font-bold text-primary-foreground"
      >
        {cta}
      </a>
    </div>
  );
}

function PricingTable({ headers, rows }: { headers: readonly string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="mt-8 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[680px] border-collapse bg-card text-left text-sm">
        <thead className="bg-secondary/70 text-xs uppercase tracking-[0.18em] text-primary">
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-border px-4 py-3 font-bold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.join("|")} className="border-b border-border/60 last:border-b-0">
              {row.map((cell) => (
                <td key={cell} className="px-4 py-3 text-muted-foreground first:font-semibold first:text-card-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Callout({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{title}</p>
      <p className="mt-3 font-serif text-2xl text-card-foreground">{value}</p>
    </div>
  );
}
function LiveStatus() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
            W
          </div>
          <div>
            <p className="font-bold text-card-foreground">Weddings.io</p>
            <p className="text-xs text-muted-foreground">Patel-Singh Wedding</p>
          </div>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          LIVE
        </span>
      </div>
      <p className="mb-4 text-xs font-bold uppercase tracking-[0.22em] text-primary">
        Wedding Day Status
      </p>
      <div className="grid grid-cols-3 gap-3">
        {[
          [Utensils, "Catering"],
          [MapPin, "Transport"],
          [Sparkles, "Décor"],
          [Camera, "Photo"],
          [DollarSign, "Music"],
          [ShieldCheck, "Attire"],
        ].map(([Icon, label]) => (
          <div
            key={label as string}
            className="rounded-md border border-border bg-secondary/40 p-3 text-center"
          >
            <Icon className="mx-auto size-5 text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">{label as string}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">Live demo — statuses cycle automatically</p>
      <div className="mt-5 space-y-3 text-sm">
        {[
          "Mandap setup confirmed",
          "Priest arrival checked",
          "Catering headcount confirm",
          "Baraat arrival — gate ready",
          "DJ sound check done",
        ].map((item, index) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-md border border-border bg-secondary/40 p-3"
          >
            <span>{item}</span>
            <span className={index === 2 ? "text-destructive" : "text-primary"}>
              {index === 2 ? "OVERDUE" : "Green"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
