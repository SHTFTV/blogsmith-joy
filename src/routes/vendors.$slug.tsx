import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getVendorBySlug, type VendorRow } from "@/lib/vendors.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/vendors/$slug")({
  loader: async ({ params }) => {
    const result = await getVendorBySlug({ data: { slug: params.slug } });
    if (!result.vendor) throw notFound();
    return result;
  },
  head: ({ loaderData, params }) => {
    const v = loaderData?.vendor;
    const name = v?.business_name ?? prettify(params.slug);
    const desc = v?.specialty
      ? v.specialty.slice(0, 155)
      : `Territory-locked vendor profile on Weddings.io. EyeSpyR verified. TALC.tv distribution.`;
    const url = `https://weddings.io/vendors/${params.slug}/`;

    const jsonLd: Record<string, unknown> = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name,
      description: desc,
      url,
      areaServed: v?.city ?? undefined,
      address: v?.city
        ? {
            "@type": "PostalAddress",
            addressLocality: v.city.split(",")[0]?.trim(),
            addressRegion: v.city.split(",")[1]?.trim(),
            addressCountry: loaderData?.territory?.country ?? undefined,
          }
        : undefined,
      geo: loaderData?.territory
        ? {
            "@type": "GeoCoordinates",
            latitude: loaderData.territory.latitude,
            longitude: loaderData.territory.longitude,
          }
        : undefined,
      image: v?.photo_url ?? undefined,
      sameAs: [
        v?.website,
        v?.instagram ? `https://instagram.com/${v.instagram.replace("@", "")}` : null,
      ].filter(Boolean),
      makesOffer: v?.category ? { "@type": "Offer", name: v.category } : undefined,
      knowsAbout: v?.culture ? [v.culture, "Weddings"] : ["Weddings"],
    };
    if (v?.verified) {
      jsonLd.hasCredential = {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "Verification",
        name: "EyeSpyR Verified",
        recognizedBy: { "@type": "Organization", name: "Weddings.io" },
      };
    }

    return {
      meta: [
        { title: `${name} | Verified Vendor | Weddings.io` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} | Weddings.io` },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
        ...(v?.photo_url ? [{ property: "og:image", content: v.photo_url }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        ...(v?.photo_url ? [{ name: "twitter:image", content: v.photo_url }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(jsonLd),
        },
      ],
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
          This territory slot may still be open.{" "}
          <a href="/pricing/" className="text-primary underline">Claim it →</a>
        </p>
      </div>
    </main>
  ),
  component: VendorProfile,
});

function prettify(slug: string) {
  return slug
    .split("-")
    .map((s) => s[0]?.toUpperCase() + s.slice(1))
    .join(" ");
}

function VendorProfile() {
  const { slug } = Route.useParams();
  const { vendor, territory } = Route.useLoaderData();
  const [v, setV] = useState<VendorRow>(vendor);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [refCount, setRefCount] = useState(v.referral_count ?? 0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setCurrentUserId(session?.user?.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const k = `wio_refs_${slug}`;
    const local = Number(localStorage.getItem(k) ?? 0);
    setRefCount((v.referral_count ?? 0) + local);
  }, [slug, v.referral_count]);

  const refLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/pricing/?ref=${encodeURIComponent(
          v.business_name.toLowerCase().replace(/\s+/g, "-"),
        )}`
      : "";

  const instagramHandle = v.instagram ?? "";
  const isOwner = !!currentUserId && currentUserId === v.user_id;

  const mapSrc = territory
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${territory.longitude - 0.08}%2C${territory.latitude - 0.05}%2C${territory.longitude + 0.08}%2C${territory.latitude + 0.05}&layer=mapnik&marker=${territory.latitude}%2C${territory.longitude}`
    : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 md:px-8">
          <a href="/" className="flex items-center gap-2 text-lg font-semibold text-primary">
            <span>🪔</span>
            <span>Weddings.io</span>
          </a>
          <nav className="flex gap-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            <a href="/vendors/" className="hover:text-primary">Vendors</a>
            <a href="/tools/" className="hover:text-primary">Tools</a>
            <a href="/blog/" className="hover:text-primary">Blog</a>
            <a href="/contribute" className="hover:text-primary">Contribute</a>
            {currentUserId ? (
              <button
                onClick={() => supabase.auth.signOut()}
                className="hover:text-primary"
              >
                Sign out
              </button>
            ) : (
              <a href="/auth" className="hover:text-primary">Sign in</a>
            )}
          </nav>
        </div>
      </header>

      <section className="border-b border-border px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[200px_1fr]">
          {v.photo_url && (
            <img
              src={v.photo_url}
              alt={v.business_name}
              className="size-48 rounded-full border border-border bg-card object-cover"
            />
          )}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {v.verified && (
                <span className="rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                  ✓ EyeSpyR Verified
                </span>
              )}
              <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                🔒 Territory Lock · {v.city} · {v.category}
              </span>
              {v.culture && (
                <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {v.culture}
                </span>
              )}
              {isOwner && !editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="ml-auto rounded-md border border-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Edit profile
                </button>
              )}
            </div>
            <h1 className="mt-4 font-serif text-5xl text-foreground">{v.business_name}</h1>
            {v.owner_name && (
              <p className="mt-2 text-sm text-muted-foreground">
                Owner: {v.owner_name} · {v.city}
              </p>
            )}

            {editing && isOwner ? (
              <EditForm
                vendor={v}
                onCancel={() => setEditing(false)}
                onSaved={(updated) => {
                  setV(updated);
                  setEditing(false);
                }}
              />
            ) : (
              <>
                {v.specialty && (
                  <p className="mt-6 max-w-2xl leading-7 text-muted-foreground">{v.specialty}</p>
                )}
                <div className="mt-6 flex flex-wrap gap-3 text-sm">
                  {v.website && (
                    <a
                      href={v.website}
                      className="rounded-md border border-border px-4 py-2 hover:border-primary hover:text-primary"
                    >
                      Website
                    </a>
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
              </>
            )}
          </div>
        </div>
      </section>

      {mapSrc && (
        <section className="border-b border-border px-5 py-12 md:px-8">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-serif text-2xl text-foreground">Locked territory: {v.city}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {v.business_name} holds exclusive access to this market on Weddings.io.
            </p>
            <div className="mt-6 overflow-hidden rounded-lg border border-border">
              <iframe
                title={`Map of ${v.city}`}
                src={mapSrc}
                className="h-[360px] w-full"
                loading="lazy"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Map data ©{" "}
              <a
                href={`https://www.openstreetmap.org/?mlat=${territory.latitude}&mlon=${territory.longitude}#map=12/${territory.latitude}/${territory.longitude}`}
                className="underline"
              >
                OpenStreetMap
              </a>{" "}
              contributors.
            </p>
          </div>
        </section>
      )}

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto max-w-3xl rounded-lg border border-border bg-card p-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
            Founding Member Perk
          </p>
          <h2 className="mt-3 font-serif text-3xl text-card-foreground">
            Refer a vendor — get one free TALC.tv blast.
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Share your unique referral link. When a referred vendor locks a territory, we credit one
            free blast to your slot.
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

function EditForm({
  vendor,
  onCancel,
  onSaved,
}: {
  vendor: VendorRow;
  onCancel: () => void;
  onSaved: (v: VendorRow) => void;
}) {
  const [form, setForm] = useState({
    photo_url: vendor.photo_url ?? "",
    website: vendor.website ?? "",
    instagram: vendor.instagram ?? "",
    specialty: vendor.specialty ?? "",
    owner_name: vendor.owner_name ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { data, error } = await supabase
      .from("vendors")
      .update({
        photo_url: form.photo_url || null,
        website: form.website || null,
        instagram: form.instagram || null,
        specialty: form.specialty || null,
        owner_name: form.owner_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", vendor.id)
      .select(
        "id, slug, business_name, owner_name, photo_url, city, category, culture, specialty, website, instagram, verified, talc_posts, referral_count, user_id",
      )
      .maybeSingle();
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data) onSaved(data as VendorRow);
  }

  return (
    <form onSubmit={save} className="mt-6 grid max-w-2xl gap-4">
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">Photo URL</span>
        <input
          value={form.photo_url}
          onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
          className="rounded-md border border-border bg-secondary px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">Owner name</span>
        <input
          value={form.owner_name}
          onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
          className="rounded-md border border-border bg-secondary px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">Website</span>
        <input
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
          className="rounded-md border border-border bg-secondary px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">Instagram</span>
        <input
          value={form.instagram}
          onChange={(e) => setForm({ ...form, instagram: e.target.value })}
          placeholder="@handle"
          className="rounded-md border border-border bg-secondary px-3 py-2"
        />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-bold uppercase tracking-wider text-muted-foreground">Specialty</span>
        <textarea
          value={form.specialty}
          onChange={(e) => setForm({ ...form, specialty: e.target.value })}
          rows={4}
          className="rounded-md border border-border bg-secondary px-3 py-2"
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border px-4 py-2 text-sm font-bold hover:border-primary hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
