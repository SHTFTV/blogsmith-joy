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

export interface FunnelResponse {
  since: string;
  until: string;
  totals: FunnelRow;
  byEntryPage: FunnelRow[];
  topDestinations: Array<{ destination: string; count: number }>;
  explainerBySource: Array<{ source: string; count: number }>;
}

const FUNNEL_EVENTS = [
  "pricing_calculator_impression",
  "pricing_calculator_form_change",
  "pricing_calculator_city_selected",
  "pricing_calculator_submit",
  "ppp_explainer_click",
] as const;

export const getPricingCalculatorFunnel = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { since?: string; until?: string }) =>
    z
      .object({
        since: z.string().datetime().optional(),
        until: z.string().datetime().optional(),
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

    const { data: rows, error } = await supabaseAdmin
      .from("pricing_calculator_events")
      .select("event_name, entry_page, destination, source, session_id, created_at")
      .in("event_name", FUNNEL_EVENTS as unknown as string[])
      .gte("created_at", since)
      .lte("created_at", until)
      .limit(50_000);
    if (error) throw new Error(error.message);

    const rowsSafe = rows ?? [];

    const byPage = new Map<string, FunnelRow>();
    const destinations = new Map<string, number>();
    const explainerSources = new Map<string, number>();

    const ensure = (page: string): FunnelRow => {
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

    for (const r of rowsSafe as Array<Record<string, any>>) {
      const page = (r.entry_page as string | null) ?? "(unknown)";
      const row = ensure(page);
      switch (r.event_name) {
        case "pricing_calculator_impression":
          row.impressions += 1;
          break;
        case "pricing_calculator_form_change":
          row.form_changes += 1;
          break;
        case "pricing_calculator_city_selected":
          row.cities_selected += 1;
          break;
        case "pricing_calculator_submit":
          row.submits += 1;
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
      }
    }

    const finalize = (row: FunnelRow): FunnelRow => ({
      ...row,
      submit_rate_pct: row.impressions > 0 ? Math.round((row.submits / row.impressions) * 1000) / 10 : 0,
      change_to_submit_pct:
        row.form_changes > 0 ? Math.round((row.submits / row.form_changes) * 1000) / 10 : 0,
    });

    const byEntryPage = Array.from(byPage.values())
      .map(finalize)
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
    const totals = finalize(totalsRaw);

    const topDestinations = Array.from(destinations.entries())
      .map(([destination, count]) => ({ destination, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const explainerBySource = Array.from(explainerSources.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    return { since, until, totals, byEntryPage, topDestinations, explainerBySource };
  });
