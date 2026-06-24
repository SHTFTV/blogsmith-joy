import { useEffect, useState } from "react";

export type Culture = {
  slug: string;
  name: string;
  emoji: string;
  native: string;
  subtitle: string;
  description: string;
  tags: string[];
  tools: string[];
  href: string;
  cta: string;
  toolsLabel: string;
  image: string;
  imageAlt: string;
};

export const CULTURES: Culture[] = [
  {
    slug: "south-asian",
    name: "South Asian",
    emoji: "🪔",
    native: "शादी · ਵਿਆਹ · বিবাহ",
    subtitle: "Indian · Pakistani · Bangladeshi",
    description:
      "Multi-day celebrations across Hindu, Sikh, Muslim, Jain, and Bengali traditions. Mehndi, Sangeet, Baraat, Anand Karaj, Nikah, Vidaai — every ritual has its own vendor set, timeline, and logistics.",
    tags: ["Indian", "Pakistani", "Bangladeshi", "Sikh", "Hindu", "Muslim"],
    tools: ["📋 Multi-day Timeline", "👥 Guest List + Dietary", "💰 Budget Calculator", "✅ Checklist", "🏛️ Floor Planner", "🤖 AI Assistant"],
    href: "/checklist/",
    cta: "Open South Asian Tools",
    toolsLabel: "15+ Tools",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
    imageAlt: "South Asian wedding couple in traditional dress with mehndi and gold jewellery",
  },
  {
    slug: "chinese",
    name: "Chinese",
    emoji: "🏮",
    native: "婚礼 · 결혼식 · 結婚式",
    subtitle: "Tea Ceremony · Lion Dance · Banquet",
    description:
      "Ancestral tea ceremony sequencing, Dai Kam Jie emcee protocols, 10-course banquet course ordering, auspicious lunar calendar date selection, and Guo Da Li betrothal gift coordination.",
    tags: ["Chinese", "Cantonese", "Mandarin", "Korean", "Japanese"],
    tools: ["🍵 Tea Ceremony Planner", "📅 Lunar Date Checker", "🍜 Banquet Sequencer", "🧧 Hongbao Tracker", "🦁 Lion Dance Scheduler"],
    href: "/tools/chinese/",
    cta: "Open Chinese Tools",
    toolsLabel: "8 Tools",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    imageAlt: "Chinese wedding tea ceremony with red and gold decor and dragon phoenix motifs",
  },
  {
    slug: "persian",
    name: "Persian",
    emoji: "🌹",
    native: "عروسی · جشن عقد",
    subtitle: "Sofreh Aghd · Aghd Night",
    description:
      "Sofreh Aghd 14-item ceremonial table — every item has meaning and placement. Aghd night versus reception night coordination. Persian calligrapher brief, live music (tar, santur, kamancheh).",
    tags: ["Persian", "Iranian", "Zoroastrian", "Muslim"],
    tools: ["🕯️ Sofreh Aghd Checklist", "📅 Two-Night Planner", "✍️ Calligrapher Brief", "🎶 Live Music Scheduler", "🪞 Mirror Placement Guide"],
    href: "/tools/persian/",
    cta: "Open Persian Tools",
    toolsLabel: "6 Tools",
    image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=800",
    imageAlt: "Persian Sofreh Aghd ceremonial table with mirror candelabras and traditional items",
  },
  {
    slug: "jewish",
    name: "Jewish",
    emoji: "✡️",
    native: "חתונה · Chatunah",
    subtitle: "Chuppah · Ketubah · Hora",
    description:
      "Chuppah positioning and structural requirements. Ketubah signing witness coordination. Shabbat date conflict checker. Hora dance floor calculator. Kosher kitchen verification for venues.",
    tags: ["Orthodox", "Conservative", "Reform", "Sephardic", "Ashkenazi"],
    tools: ["🕍 Chuppah Planner", "📜 Ketubah Witness Tracker", "🌅 Shabbat Checker", "💃 Hora Floor Calculator", "🥘 Kosher Venue Verifier"],
    href: "/tools/jewish/",
    cta: "Open Jewish Tools",
    toolsLabel: "7 Tools",
    image: "https://images.unsplash.com/photo-1601933470096-0e34634ffcde?w=800",
    imageAlt: "Jewish wedding chuppah ceremony with floral arch and ketubah signing",
  },
  {
    slug: "mexican",
    name: "Mexican",
    emoji: "🎺",
    native: "La Boda · El Casamiento",
    subtitle: "Padrinos · Mariachi · Lasso",
    description:
      "Padrinos sponsor tracker — the system where 15–30 family members each sponsor a specific wedding element. Mariachi cocktail-hour scheduling. Lasso and arras ceremony props.",
    tags: ["Mexican", "Colombian", "Cuban", "Guatemalan", "Puerto Rican"],
    tools: ["🤝 Padrinos Tracker", "🎺 Mariachi Scheduler", "💒 Lasso Ceremony Guide", "🎉 Callejoneada Planner", "💰 Sponsor Budget Split"],
    href: "/tools/mexican/",
    cta: "Open Mexican Tools",
    toolsLabel: "5 Tools",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800",
    imageAlt: "Mexican wedding with mariachi band colourful flowers and padrinos",
  },
  {
    slug: "nordic",
    name: "Nordic",
    emoji: "🌿",
    native: "Bröllop · Bryllup · Häät",
    subtitle: "Foraged Florals · Folk Music",
    description:
      "Outdoor venue weather contingency planning. Seasonal foraged florist briefing. Geometric timber arch and tent permits. Hardanger fiddle and folk ensemble scheduling. Midsommar date optimization.",
    tags: ["Swedish", "Norwegian", "Danish", "Finnish", "Icelandic"],
    tools: ["⛅ Weather Contingency", "🌾 Foraged Florist Brief", "⛺ Tent Permit Tracker", "🎻 Folk Music Scheduler", "🌞 Midsommar Calculator"],
    href: "/tools/nordic/",
    cta: "Open Nordic Tools",
    toolsLabel: "5 Tools",
    image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    imageAlt: "Nordic outdoor wedding in forest setting with wildflowers and timber arch",
  },
  {
    slug: "southeast-asian",
    name: "Southeast Asian",
    emoji: "🙏",
    native: "งานแต่งงาน · Đám cưới · Kasal",
    subtitle: "Thai · Vietnamese · Filipino",
    description:
      "Buddhist monk scheduling and offering coordination. Multiple outfit change timeline (Thai brides average 3–4 changes). Water-blessing ceremony logistics. Silk attire rental sequencing.",
    tags: ["Thai", "Vietnamese", "Filipino", "Cambodian", "Indonesian"],
    tools: ["🙏 Monk Scheduler", "👘 Outfit Change Timeline", "🍵 Water Blessing Logistics", "🎭 Traditional Dance Planner", "📿 Ritual Prop Checklist"],
    href: "/tools/southeast-asian/",
    cta: "Open Southeast Asian Tools",
    toolsLabel: "6 Tools",
    image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800",
    imageAlt: "Southeast Asian Buddhist wedding ceremony with traditional silk outfits and water blessing",
  },
  {
    slug: "western",
    name: "Western Classical",
    emoji: "🎊",
    native: "Classic · Contemporary · Fusion",
    subtitle: "Civil · Garden · Contemporary",
    description:
      "Civil, contemporary, and garden ceremonies. Black-tie reception planning, string quartet scheduling, seating plan geometry, speech order management.",
    tags: ["Civil", "Contemporary", "Garden", "Fusion"],
    tools: ["🎻 String Quartet Scheduler", "🗣️ Speech Order Planner", "💃 First Dance Brief", "🪑 Seating Geometry"],
    href: "/tools/western/",
    cta: "Open Western Tools",
    toolsLabel: "6 Tools",
    image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    imageAlt: "Western church wedding ceremony with white dress floral arrangements and string quartet",
  },
  {
    slug: "traditional",
    name: "Traditional & Religious",
    emoji: "⛪",
    native: "✝ · ☩ · α",
    subtitle: "Catholic · Anglican · Orthodox · Christian",
    description:
      "Catholic Nuptial Mass structure (full 60–75 min Liturgy), Anglican Book of Common Prayer ceremony, Orthodox crowning rite, church music programming, flower girl and ring bearer coordination, rehearsal dinner run-sheet, and unity candle / sand ceremony planning.",
    tags: ["Catholic", "Anglican", "Orthodox", "Christian", "Church"],
    tools: ["✝ Nuptial Mass Timeline", "🎵 Church Music Scheduler", "💐 Flower Girl Coordinator", "🍷 Rehearsal Dinner Run-Sheet", "📜 Vow Customiser", "🕯️ Unity Ceremony Tracker"],
    href: "/tools/traditional/",
    cta: "Open Traditional Tools",
    toolsLabel: "6 Tools",
    image: "https://images.unsplash.com/photo-1490650404312-a2175773bbf5?w=800",
    imageAlt: "Traditional Catholic wedding ceremony in stone church with candles and organ",
  },
];

const ROTATING: { word: string; hold: number }[] = [
  { word: "South Asian", hold: 3000 },
  { word: "Chinese", hold: 2500 },
  { word: "Persian", hold: 2500 },
  { word: "Jewish", hold: 2500 },
  { word: "Mexican", hold: 2500 },
  { word: "Nordic", hold: 2500 },
  { word: "Southeast Asian", hold: 2800 },
  { word: "Traditional & Religious", hold: 2800 },
  { word: "Multicultural", hold: 2500 },
];

export function RotatingHeadline() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((p) => (p + 1) % ROTATING.length), ROTATING[i].hold);
    return () => clearTimeout(t);
  }, [i]);
  return (
    <h1 className="font-serif text-5xl leading-[1.05] text-foreground md:text-7xl">
      <span className="block">The World&apos;s</span>
      <span
        className="block overflow-hidden align-baseline"
        style={{ minHeight: "1.1em" }}
        aria-live="polite"
      >
        <span
          key={i}
          className="inline-block"
          style={{
            background: "linear-gradient(135deg, #FF8C00, #FFD700)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "wio-rotate-in 600ms cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          {ROTATING[i].word}
        </span>
      </span>
      <span className="block">Wedding Platform</span>
      <style>{`@keyframes wio-rotate-in{0%{transform:translateY(100%);opacity:0}100%{transform:translateY(0);opacity:1}}@keyframes wio-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
    </h1>
  );
}

export function CultureMosaic() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-2">
      {CULTURES.map((c, idx) => (
        <a
          key={c.slug}
          href={c.href}
          className="group block rounded-2xl border border-border bg-card p-4 transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
          style={{
            animation: `wio-float ${6 + (idx % 3) * 0.5}s ease-in-out infinite`,
            animationDelay: `${idx * 0.3}s`,
          }}
        >
          <div className="flex items-start justify-between">
            <span className="text-3xl" aria-hidden="true">{c.emoji}</span>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              {c.toolsLabel}
            </span>
          </div>
          <p className="mt-3 font-serif text-lg text-card-foreground">{c.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
        </a>
      ))}
    </div>
  );
}

export function CultureSwitcherBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (slug: string) => void;
}) {
  const items = [
    { slug: "all", label: "🌍 All Cultures" },
    { slug: "south-asian", label: "🪔 South Asian" },
    { slug: "chinese", label: "🏮 Chinese & East Asian" },
    { slug: "persian", label: "🌹 Persian" },
    { slug: "mexican", label: "🎺 Mexican & Latino" },
    { slug: "jewish", label: "✡️ Jewish" },
    { slug: "nordic", label: "🌿 Nordic" },
    { slug: "southeast-asian", label: "🙏 Southeast Asian" },
    { slug: "western", label: "🎊 Western" },
    { slug: "traditional", label: "⛪ Traditional & Religious" },
  ];
  return (
    <div
      className="sticky z-40 border-b border-border bg-[#0E0E0E]"
      style={{ top: 61 }}
    >
      <div
        className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-5 py-3 md:px-8"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((it) => {
          const isActive = active === it.slug;
          return (
            <button
              key={it.slug}
              type="button"
              onClick={() => onChange(it.slug)}
              className="shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-semibold transition"
              style={{
                background: isActive ? "rgba(255,140,0,0.1)" : "transparent",
                borderColor: isActive ? "rgba(255,140,0,0.4)" : "var(--border, #242424)",
                color: isActive ? "#FF8C00" : "var(--muted-foreground, #aaa)",
                boxShadow: isActive ? "inset 0 -2px 0 rgba(255,140,0,0.5)" : "none",
              }}
            >
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function CultureToolsGrid() {
  const [active, setActive] = useState<string>("all");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search).get("culture");
    if (p) setActive(p);
  }, []);

  const onChange = (slug: string) => {
    setActive(slug);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (slug === "all") url.searchParams.delete("culture");
      else url.searchParams.set("culture", slug);
      window.history.replaceState({}, "", url.toString());
    }
  };

  const filtered = CULTURES.filter(
    (c) => active === "all" || c.slug === active || (active === "chinese" && c.slug === "chinese"),
  );

  return (
    <>
      <CultureSwitcherBar active={active} onChange={onChange} />
      <section className="border-b border-border px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.3em] text-primary">
              The World&apos;s Wedding Intelligence
            </p>
            <h2 className="font-serif text-4xl leading-tight text-foreground md:text-6xl">
              Every Ceremony. Every Tradition. Properly Planned.
            </h2>
          </div>
          <div
            className="mt-10 grid gap-5"
            style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}
          >
            {filtered.map((c) => (
              <CultureCard key={c.slug} c={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function CultureCard({ c }: { c: Culture }) {
  return (
    <a
      href={c.href}
      data-culture={c.slug}
      className="group relative block overflow-hidden rounded-xl border border-border bg-card p-5 transition hover:border-primary/40"
    >
      <div
        className="mb-4 flex h-[140px] w-full items-center justify-center rounded-lg text-4xl"
        style={{
          backgroundImage: `url(${c.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <span aria-hidden="true" className="drop-shadow-lg">{c.emoji}</span>
      </div>
      <p className="font-serif text-xl font-bold text-card-foreground">{c.name}</p>
      <p className="mt-1 font-mono text-[13px] text-primary">{c.native}</p>
      <p className="mt-3 line-clamp-4 text-[13px] leading-5 text-muted-foreground">{c.description}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.tags.map((t) => (
          <span
            key={t}
            className="rounded-full border border-border bg-secondary/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {c.tools.map((t) => (
          <span
            key={t}
            className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
          >
            {t}
          </span>
        ))}
      </div>
      <span className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground">
        {c.cta} →
      </span>
      <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300 group-hover:scale-x-100" />
    </a>
  );
}
