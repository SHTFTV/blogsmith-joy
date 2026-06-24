import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { listVendors, type VendorRow } from "@/lib/vendors.functions";

export const Route = createFileRoute("/vendors/")({
  loader: () => listVendors({ data: {} }),
  head: () => ({
    meta: [
      { title: "Find a Wedding Vendor | Verified by Weddings.io" },
      {
        name: "description",
        content:
          "Search territory-locked, EyeSpyR-verified wedding vendors by city, category, and culture. One vendor per territory. No directory spam.",
      },
      { property: "og:title", content: "Find a Wedding Vendor | Weddings.io" },
      {
        property: "og:description",
        content: "Search verified wedding vendors by city, category, and culture.",
      },
      { property: "og:url", content: "https://weddings.io/vendors/" },
    ],
    links: [{ rel: "canonical", href: "https://weddings.io/vendors/" }],
  }),
  component: VendorsIndex,
});

function VendorsIndex() {
  const initial = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [culture, setCulture] = useState("");
  const [vendors, setVendors] = useState<VendorRow[]>(initial.vendors);
  const [loading, setLoading] = useState(false);

  const facets = initial.facets;

  // Refetch on filter change
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const res = await listVendors({ data: { q, city, category, culture } });
      if (!cancelled) {
        setVendors(res.vendors);
        setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, city, category, culture]);

  const resultCount = useMemo(() => vendors.length, [vendors]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <span>🪔</span>
            <span>Weddings.io</span>
          </a>
          <nav className="flex gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <a href="/vendors/" className="text-primary">Vendors</a>
            <a href="/tools/" className="hover:text-primary">Tools</a>
            <a href="/blog/" className="hover:text-primary">Blog</a>
            <a href="/contribute" className="hover:text-primary">Contribute</a>
            <a href="/auth" className="hover:text-primary">Sign in</a>
          </nav>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-8">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Verified Vendor Directory
          </p>
          <h1 className="mt-3 font-serif text-5xl text-foreground">
            Find a wedding vendor that actually fits.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Every vendor below is territory-locked and EyeSpyR-verified. Search by city, category,
            or culture.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, owner, or specialty…"
              className="rounded-md border border-border bg-secondary px-4 py-3 text-sm"
            />
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="rounded-md border border-border bg-secondary px-4 py-3 text-sm"
            >
              <option value="">All cities</option>
              {facets.cities.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-border bg-secondary px-4 py-3 text-sm"
            >
              <option value="">All categories</option>
              {facets.categories.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={culture}
              onChange={(e) => setCulture(e.target.value)}
              className="rounded-md border border-border bg-secondary px-4 py-3 text-sm"
            >
              <option value="">All cultures</option>
              {facets.cultures.map((c: string) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
            {loading ? "Searching…" : `${resultCount} vendor${resultCount === 1 ? "" : "s"}`}
            {(q || city || category || culture) && (
              <button
                onClick={() => {
                  setQ("");
                  setCity("");
                  setCategory("");
                  setCulture("");
                }}
                className="ml-3 text-primary underline"
              >
                Clear
              </button>
            )}
          </p>
        </div>
      </section>

      <section className="px-5 py-12 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {vendors.length === 0 && !loading && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">
              <p>No vendors match those filters.</p>
              <p className="mt-2 text-sm">
                This territory may still be open.{" "}
                <a href="/pricing/" className="text-primary underline">Claim it →</a>
              </p>
            </div>
          )}
          {vendors.map((v) => (
            <a
              key={v.id}
              href={`/vendors/${v.slug}`}
              className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-5 transition hover:border-primary"
            >
              <div className="flex items-center gap-3">
                {v.photo_url && (
                  <img
                    src={v.photo_url}
                    alt={v.business_name}
                    className="size-14 rounded-full border border-border object-cover"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-serif text-lg text-card-foreground group-hover:text-primary">
                    {v.business_name}
                  </h3>
                  <p className="truncate text-xs text-muted-foreground">{v.city}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-wider">
                {v.verified && (
                  <span className="rounded-full border border-primary bg-primary/10 px-2 py-0.5 text-primary">
                    ✓ Verified
                  </span>
                )}
                {v.category && (
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-muted-foreground">
                    {v.category}
                  </span>
                )}
                {v.culture && (
                  <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-muted-foreground">
                    {v.culture}
                  </span>
                )}
              </div>
              {v.specialty && (
                <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {v.specialty}
                </p>
              )}
              <p className="mt-auto text-xs text-muted-foreground">
                TALC.tv posts: <strong className="text-primary">{v.talc_posts}</strong>
              </p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
