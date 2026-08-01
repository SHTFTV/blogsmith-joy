import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CITY_ENTRIES,
  COUNTRY_OPTIONS,
  CULTURES,
  formatCityPrice,
  type Culture,
} from "@/lib/cityDirectory";

const TITLE = "Wedding Planner Territories by City | Weddings.io";
const DESCRIPTION =
  "Search 187 Weddings.io city territories by country, culture and availability. One exclusive wedding planner slot per city, PPP-adjusted pricing.";
const CANONICAL = "https://weddings.io/cities/";

export const Route = createFileRoute("/cities/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: CitiesIndex,
});

type StatusFilter = "all" | "available" | "coming-soon";

function CitiesIndex() {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("all");
  const [culture, setCulture] = useState<"all" | Culture>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CITY_ENTRIES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q) && !c.slug.includes(q)) return false;
      if (country !== "all" && c.country !== country) return false;
      if (culture !== "all" && !c.cultures.includes(culture)) return false;
      if (status !== "all" && c.status !== status) return false;
      return true;
    });
  }, [query, country, culture, status]);

  const selectClass =
    "h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground";

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Wedding planner territories by city
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        One exclusive planner slot per city across {COUNTRY_OPTIONS.length} countries and{" "}
        {CITY_ENTRIES.length} territories. Pricing is population-based and PPP-adjusted.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city name…"
          aria-label="Search city name"
          className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground"
        />
        <select
          aria-label="Filter by country"
          className={selectClass}
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="all">All countries</option>
          {COUNTRY_OPTIONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.flag} {c.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by culture"
          className={selectClass}
          value={culture}
          onChange={(e) => setCulture(e.target.value as "all" | Culture)}
        >
          <option value="all">All cultures</option>
          {CULTURES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by territory status"
          className={selectClass}
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
        >
          <option value="all">Any availability</option>
          <option value="available">Available</option>
          <option value="coming-soon">Coming soon</option>
        </select>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {results.length} {results.length === 1 ? "territory" : "territories"} shown
      </p>

      {results.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
          No territories match those filters yet.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <li key={c.slug}>
              <Link
                to="/cities/$slug"
                params={{ slug: c.slug }}
                className="flex h-full flex-col rounded-lg border border-border p-5 transition-colors hover:border-primary hover:bg-accent/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-base font-semibold text-foreground">
                    <span aria-hidden="true" className="mr-2">
                      {c.flag}
                    </span>
                    {c.name}
                  </span>
                  <span className="whitespace-nowrap text-sm font-semibold text-primary">
                    {formatCityPrice(c)}
                  </span>
                </div>
                <span className="mt-1 text-xs text-muted-foreground">{c.countryName}</span>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {c.cultures.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span
                  className={`mt-4 inline-flex w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    c.status === "available"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {c.status === "available" ? "Available" : "Coming soon"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
