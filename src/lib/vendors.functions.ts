import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

function publicClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const VENDOR_COLUMNS =
  "id, slug, business_name, owner_name, photo_url, city, category, culture, specialty, website, instagram, verified, talc_posts, referral_count, user_id";

export type VendorRow = {
  id: string;
  slug: string;
  business_name: string;
  owner_name: string | null;
  photo_url: string | null;
  city: string | null;
  category: string | null;
  culture: string | null;
  specialty: string | null;
  website: string | null;
  instagram: string | null;
  verified: boolean;
  talc_posts: number;
  referral_count: number;
  user_id: string | null;
};

export type Territory = {
  city: string;
  latitude: number;
  longitude: number;
  country: string | null;
};

export const getVendorBySlug = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const { data: vendor, error } = await supabase
      .from("vendors")
      .select(VENDOR_COLUMNS)
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!vendor) return { vendor: null, territory: null };

    let territory: Territory | null = null;
    if (vendor.city) {
      const { data: t } = await supabase
        .from("territories")
        .select("city, latitude, longitude, country")
        .eq("city", vendor.city)
        .maybeSingle();
      if (t) {
        territory = {
          city: t.city,
          latitude: Number(t.latitude),
          longitude: Number(t.longitude),
          country: t.country,
        };
      }
    }
    return { vendor: vendor as VendorRow, territory };
  });

export const PAGE_SIZE = 12;

export const listVendors = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z
      .object({
        q: z.string().optional(),
        city: z.string().optional(),
        category: z.string().optional(),
        culture: z.string().optional(),
        page: z.number().int().min(1).default(1),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const supabase = publicClient();
    const page = data.page ?? 1;
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("vendors")
      .select(VENDOR_COLUMNS, { count: "exact" })
      .order("verified", { ascending: false })
      .order("talc_posts", { ascending: false })
      .range(from, to);

    if (data.city) query = query.eq("city", data.city);
    if (data.category) query = query.eq("category", data.category);
    if (data.culture) query = query.eq("culture", data.culture);
    if (data.q) {
      const term = `%${data.q}%`;
      query = query.or(
        `business_name.ilike.${term},specialty.ilike.${term},owner_name.ilike.${term}`,
      );
    }

    const { data: rows, error, count } = await query;
    if (error) throw new Error(error.message);

    const { data: facetsData } = await supabase
      .from("vendors")
      .select("city, category, culture")
      .limit(1000);
    const cities = Array.from(
      new Set((facetsData ?? []).map((r) => r.city).filter(Boolean)),
    ).sort() as string[];
    const categories = Array.from(
      new Set((facetsData ?? []).map((r) => r.category).filter(Boolean)),
    ).sort() as string[];
    const cultures = Array.from(
      new Set((facetsData ?? []).map((r) => r.culture).filter(Boolean)),
    ).sort() as string[];

    return {
      vendors: (rows ?? []) as VendorRow[],
      total: count ?? 0,
      page,
      pageSize: PAGE_SIZE,
      facets: { cities, categories, cultures },
    };
  });
