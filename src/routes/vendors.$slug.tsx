import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getVendorBySlug } from "@/lib/vendors.functions";

export const Route = createFileRoute("/vendors/$slug")({
  loader: async ({ params }) => {
    const vendor = await getVendorBySlug({ data: { slug: params.slug } });
    if (!vendor) throw notFound();
    return vendor;
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.business_name ?? prettify(params.slug);
    const desc = loaderData?.specialty
      ? `${loaderData.specialty.slice(0, 155)}`
      : `Territory-locked vendor profile on Weddings.io. EyeSpyR verified. TALC.tv distribution.`;
    return {
      meta: [
        { title: `${name} | Verified Vendor | Weddings.io` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} | Weddings.io` },
        { property: "og:description", content: desc },
        { property: "og:url", content: `https://weddings.io/vendors/${params.slug}/` },
        ...(loaderData?.photo_url ? [{ property: "og:image", content: loaderData.photo_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(loaderData?.photo_url ? [{ name: "twitter:image", content: loaderData.photo_url }] : []),
      ],
      links: [{ rel: "canonical", href: `https://weddings.io/vendors/${params.slug}/` }],
    };
  },
  errorComponent: ({ error }) => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <div className="text-center">
        <h1 className="font-serif text-3xl">Couldn't load this vendor</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <a href="/" className="mt-6 inline-block text-primary underline">Back home</a>
      </div>
    </main>
  ),
  notFoundComponent: () => (
    <main className="grid min-h-screen place-items-center bg-background p-8 text-foreground">
      <div className="text-center">
        <h1 className="font-serif text-3xl">Vendor not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This territory slot may still be open. <a href="/pricing/" className="text-primary underline">Claim it →</a>
        </p>
      </div>
    </main>
  ),
  component: VendorProfile,
});

function prettify(slug: string) {
  return slug.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ");
}

function VendorProfile() {
  const { slug } = Route.useParams();
  const v = Route.useLoaderData();
  const [refCount, setRefCount] = useState(v.referral_count ?? 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const k = `wio_refs_${slug}`;
    const local = Number(localStorage.getItem(k) ?? 0);
    setRefCount((v.referral_count ?? 0) + local);
  }, [slug, v.referral_count]);

  const refLink = typeof window !== "undefined"
    ? `${window.location.origin}/pricing/?ref=${encodeURIComponent(v.business_name.toLowerCase().replace(/\s+/g, "-"))}`
    : "";

  const instagramHandle = v.instagram ?? "";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold text-primary"><span>🪔</span><span>Weddings.io</span></a>
          <nav className="flex gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <a href="/tools/" className="hover:text-primary">Tools</a>
            <a href="/blog/" className="hover:text-primary">Blog</a>
            <a href="/contribute" className="hover:text-primary">Contribute</a>
          </nav>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[200px_1fr]">
          {v.photo_url && (
            <img src={v.photo_url} alt={v.business_name} className="size-48 rounded-full border border-border bg-card" />
          )}
          <div>
            <div className="flex flex-wrap gap-2">
              {v.verified && (
                <span className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  ✓ EyeSpyR Verified
                </span>
              )}
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                🔒 Territory Lock · {v.city} · {v.category}
              </span>
            </div>
            <h1 className="mt-4 font-serif text-5xl text-foreground">{v.business_name}</h1>
            {v.owner_name && (
              <p className="mt-2 text-sm text-muted-foreground">Owner: {v.owner_name} · {v.city}</p>
            )}
            {v.specialty && (
              <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">{v.specialty}</p>
            )}
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {v.website && (
                <a href={v.website} className="rounded-md border border-border px-4 py-2 hover:border-primary hover:text-primary">Website</a>
              )}
              {instagramHandle && (
                <a
                  href={`https://instagram.com/${instagramHandle.replace("@", "")}`}
                  className="rounded-md border border-border px-4 py-2 hover:border-primary hover:text-primary"
                >
                  Instagram {instagramHandle}
                </a>
              )}
              <span className="rounded-md bg-secondary px-4 py-2 text-muted-foreground">
                TALC.tv Posts: <strong className="text-primary">{v.talc_posts}</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">Founding Member Perk</p>
          <h2 className="mt-3 font-serif text-3xl text-card-foreground">Refer a vendor — get one free TALC.tv blast.</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Share your unique referral link. When a referred vendor locks a territory, we credit one free blast to your slot.
          </p>
          <div className="mt-6 flex gap-2">
            <input
              readOnly
              value={refLink}
              className="flex-1 rounded-md border border-border bg-secondary px-3 py-2 text-sm text-foreground"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(refLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
              }}
              className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Referrals credited: <strong className="text-primary">{refCount}</strong>
          </p>
        </div>
      </section>
    </main>
  );
}
