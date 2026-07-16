import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

export interface FunnelRow {
  entry_page: string;
  impressions: number;
  form_changes: number;
  cities_selected: number;
  submits: number;
  explainer_clicks: number;
  submit_rate_pct: number; // submits / impressions
  change_to_submit_pct: number; // submits / form_changes
}

export interface BreakdownRow {
  key: string;
  impressions: number;
  form_changes: number;
  cities_selected: number;
  submits: number;
  submit_rate_pct: number;
}

export interface CityRow {
  city: string;
  impressions: number;
  form_changes: number;
  cities_selected: number;
  submits: number;
  submit_rate_pct: number;
}

export interface FunnelResponse {
  since: string;
  until: string;
  city_filter: string | null;
  totals: FunnelRow;
  byEntryPage: FunnelRow[];
  byDevice: BreakdownRow[];
  byReferrer: BreakdownRow[];
  byCity: CityRow[];
  cityList: string[];
  topDestinations: Array<{ destination: string; count: number }>;
  explainerBySource: Array<{ source: string; count: number }>;
  fallbacks: {
    total: number;
    invalid: number;
    missing: number;
    topAttempted: Array<{ attempted_city: string; count: number }>;
  };
}

const FUNNEL_EVENTS = [
  "pricing_calculator_impression",
  "pricing_calculator_form_change",
  "pricing_calculator_city_selected",
  "pricing_calculator_submit",
  "ppp_explainer_click",
  "pricing_calculator_city_fallback",
] as const;

export const getPricingCalculatorFunnel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { since?: string; until?: string; city?: string | null }) =>
    z
      .object({
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
        city: z.string().min(1).max(120).nullable().optional(),
      })
      .parse(input ?? {}),
  )
  .handler(async ({ data, context }): Promise<FunnelResponse> => {
    await assertAdmin(context as any);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const defaultSince = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    const since = data.since ?? defaultSince.toISOString();
    const until = data.until ?? now.toISOString();
    const cityFilter = data.city && data.city.trim().length > 0 ? data.city.trim() : null;

    // Always fetch the full unfiltered city list for the picker.
    const cityListQuery = await supabaseAdmin
      .from("pricing_calculator_events")
      .select("city")
      .not("city", "is", null)
      .gte("created_at", since)
      .lte("created_at", until)
      .limit(50_000);
    const cityList = Array.from(
      new Set(
        (cityListQuery.data ?? [])
          .map((r: any) => (r.city as string | null) ?? "")
          .filter((c: string) => c.length > 0),
      ),
    ).sort();

    let query = supabaseAdmin
      .from("pricing_calculator_events")
      .select(
        "event_name, entry_page, destination, source, session_id, created_at, device_type, referrer_source, city, attempted_city",
      )
      .in("event_name", FUNNEL_EVENTS as unknown as string[])
      .gte("created_at", since)
      .lte("created_at", until)
      .limit(50_000);
    if (cityFilter) query = query.eq("city", cityFilter);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);

    const rowsSafe = rows ?? [];

    const byPage = new Map<string, FunnelRow>();
    const byDeviceMap = new Map<string, BreakdownRow>();
    const byReferrerMap = new Map<string, BreakdownRow>();
    const byCityMap = new Map<string, CityRow>();
    const destinations = new Map<string, number>();
    const explainerSources = new Map<string, number>();
    const attemptedCounts = new Map<string, number>();
    let fallbackTotal = 0;
    let fallbackInvalid = 0;
    let fallbackMissing = 0;

    const ensurePage = (page: string): FunnelRow => {
      let row = byPage.get(page);
      if (!row) {
        row = {
          entry_page: page,
          impressions: 0,
          form_changes: 0,
          cities_selected: 0,
          submits: 0,
          explainer_clicks: 0,
          submit_rate_pct: 0,
          change_to_submit_pct: 0,
        };
        byPage.set(page, row);
      }
      return row;
    };

    const ensureBreakdown = (map: Map<string, BreakdownRow>, key: string): BreakdownRow => {
      let row = map.get(key);
      if (!row) {
        row = {
          key,
          impressions: 0,
          form_changes: 0,
          cities_selected: 0,
          submits: 0,
          submit_rate_pct: 0,
        };
        map.set(key, row);
      }
      return row;
    };

    const ensureCity = (key: string): CityRow => {
      let row = byCityMap.get(key);
      if (!row) {
        row = {
          city: key,
          impressions: 0,
          form_changes: 0,
          cities_selected: 0,
          submits: 0,
          submit_rate_pct: 0,
        };
        byCityMap.set(key, row);
      }
      return row;
    };

    for (const r of rowsSafe as Array<Record<string, any>>) {
      const page = (r.entry_page as string | null) ?? "(unknown)";
      const device = (r.device_type as string | null) ?? "unknown";
      const referrer = (r.referrer_source as string | null) ?? "unknown";
      const cityKey = (r.city as string | null) ?? "(none)";
      const row = ensurePage(page);
      const dRow = ensureBreakdown(byDeviceMap, device);
      const rRow = ensureBreakdown(byReferrerMap, referrer);
      const cRow = ensureCity(cityKey);

      switch (r.event_name) {
        case "pricing_calculator_impression":
          row.impressions += 1;
          dRow.impressions += 1;
          rRow.impressions += 1;
          cRow.impressions += 1;
          break;
        case "pricing_calculator_form_change":
          row.form_changes += 1;
          dRow.form_changes += 1;
          rRow.form_changes += 1;
          cRow.form_changes += 1;
          break;
        case "pricing_calculator_city_selected":
          row.cities_selected += 1;
          dRow.cities_selected += 1;
          rRow.cities_selected += 1;
          cRow.cities_selected += 1;
          break;
        case "pricing_calculator_submit":
          row.submits += 1;
          dRow.submits += 1;
          rRow.submits += 1;
          cRow.submits += 1;
          if (r.destination) {
            destinations.set(r.destination, (destinations.get(r.destination) ?? 0) + 1);
          }
          break;
        case "ppp_explainer_click":
          row.explainer_clicks += 1;
          if (r.source) {
            explainerSources.set(r.source, (explainerSources.get(r.source) ?? 0) + 1);
          }
          break;
        case "pricing_calculator_city_fallback":
          fallbackTotal += 1;
          if (r.source === "missing") fallbackMissing += 1;
          else fallbackInvalid += 1;
          if (r.attempted_city) {
            attemptedCounts.set(
              r.attempted_city,
              (attemptedCounts.get(r.attempted_city) ?? 0) + 1,
            );
          }
          break;
      }
    }

    const finalizePage = (row: FunnelRow): FunnelRow => ({
      ...row,
      submit_rate_pct: row.impressions > 0 ? Math.round((row.submits / row.impressions) * 1000) / 10 : 0,
      change_to_submit_pct:
        row.form_changes > 0 ? Math.round((row.submits / row.form_changes) * 1000) / 10 : 0,
    });
    const finalizeBreakdown = (row: BreakdownRow): BreakdownRow => ({
      ...row,
      submit_rate_pct: row.impressions > 0 ? Math.round((row.submits / row.impressions) * 1000) / 10 : 0,
    });
    const finalizeCity = (row: CityRow): CityRow => ({
      ...row,
      submit_rate_pct: row.impressions > 0 ? Math.round((row.submits / row.impressions) * 1000) / 10 : 0,
    });

    const byEntryPage = Array.from(byPage.values())
      .map(finalizePage)
      .sort((a, b) => b.impressions - a.impressions);
    const byDevice = Array.from(byDeviceMap.values())
      .map(finalizeBreakdown)
      .sort((a, b) => b.impressions - a.impressions);
    const byReferrer = Array.from(byReferrerMap.values())
      .map(finalizeBreakdown)
      .sort((a, b) => b.impressions - a.impressions);
    const byCity = Array.from(byCityMap.values())
      .map(finalizeCity)
      .sort((a, b) => b.impressions - a.impressions);

    const totalsRaw: FunnelRow = {
      entry_page: "(all pages)",
      impressions: 0,
      form_changes: 0,
      cities_selected: 0,
      submits: 0,
      explainer_clicks: 0,
      submit_rate_pct: 0,
      change_to_submit_pct: 0,
    };
    for (const r of byEntryPage) {
      totalsRaw.impressions += r.impressions;
      totalsRaw.form_changes += r.form_changes;
      totalsRaw.cities_selected += r.cities_selected;
      totalsRaw.submits += r.submits;
      totalsRaw.explainer_clicks += r.explainer_clicks;
    }
    const totals = finalizePage(totalsRaw);

    const topDestinations = Array.from(destinations.entries())
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const explainerBySource = Array.from(explainerSources.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    const topAttempted = Array.from(attemptedCounts.entries())
      .map(([attempted_city, count]) => ({ attempted_city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return {
      since,
      until,
      city_filter: cityFilter,
      totals,
      byEntryPage,
      byDevice,
      byReferrer,
      byCity,
      cityList,
      topDestinations,
      explainerBySource,
      fallbacks: {
        total: fallbackTotal,
        invalid: fallbackInvalid,
        missing: fallbackMissing,
        topAttempted,
      },
    };
  });
