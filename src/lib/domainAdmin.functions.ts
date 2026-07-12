import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { checkAllDomains, DOMAINS, expectedBuild, type DomainStatus } from "@/lib/domainStatus";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error("Role check failed");
  if (!data) throw new Error("Forbidden");
}

// Fire N cache-busting probes at a domain to trigger edge revalidation.
// This is the only server-side "repush" available — Lovable publishing is
// per-project, not per-domain — so we prime the edge by hitting root +
// build-info repeatedly with unique query strings.
async function primeDomain(url: string, passes: number): Promise<void> {
  const base = url.replace(/\/$/, "");
  const paths = ["/", "/api/public/build-info"];
  await Promise.all(
    Array.from({ length: passes }, (_, i) => {
      const bust = `${Date.now().toString(36)}${i}${Math.random().toString(36).slice(2, 6)}`;
      return Promise.all(
        paths.map((p) =>
          fetch(`${base}${p}?_repush=${bust}`, {
            method: "GET",
            headers: {
              "cache-control": "no-cache, no-store, must-revalidate",
              pragma: "no-cache",
            },
            cache: "no-store",
          }).catch(() => null),
        ),
      );
    }),
  );
}

// Admin-only. Confirms which domains are stale/error, primes each with
// cache-busting requests, re-checks, and writes an audit row. Returns
// before/after reports.
export const repushStaleDomains = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { confirm: true; notes?: string; passes?: number }) =>
    z
      .object({
        confirm: z.literal(true),
        notes: z.string().max(500).optional(),
        passes: z.number().int().min(1).max(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);

    const before = await checkAllDomains();
    const staleUrls = new Set(
      before.domains
        .filter((d) => d.status !== "match")
        .map((d) => d.url),
    );
    const targets = DOMAINS.filter((d) => staleUrls.has(d.url));

    const passes = data.passes ?? 3;
    if (targets.length > 0) {
      await Promise.all(targets.map((t) => primeDomain(t.url, passes)));
      // brief settle before re-checking edge
      await new Promise((r) => setTimeout(r, 1500));
    }

    const after = await checkAllDomains();
    const afterByUrl = new Map<string, DomainStatus>(after.domains.map((d) => [d.url, d]));

    const recovered = targets.filter((t) => afterByUrl.get(t.url)?.status === "match").length;
    const stillStale = targets.length - recovered;

    // Persist audit
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const expected = expectedBuild();
      const db = supabaseAdmin as unknown as {
        from: (t: string) => {
          insert: (
            row: Record<string, unknown>,
          ) => Promise<{ error: { message: string } | null }>;
        };
      };
      const { error } = await db.from("domain_repush_audit").insert({
        triggered_by: context.userId,
        bundle_commit: expected.commit,
        bundle_commit_short: expected.commitShort,
        targets_total: targets.length,
        targets_recovered: recovered,
        targets_still_stale: stillStale,
        targets: JSON.parse(JSON.stringify(targets)),
        before_summary: JSON.parse(JSON.stringify(before.summary)),
        after_summary: JSON.parse(JSON.stringify(after.summary)),
        notes: data.notes ?? null,
      });
      if (error) console.warn(`[repushStaleDomains] audit insert failed: ${error.message}`);
    } catch (e) {
      console.warn(
        `[repushStaleDomains] audit exception: ${e instanceof Error ? e.message : String(e)}`,
      );
    }

    return {
      ok: true,
      passes,
      targets: targets.map((t) => t.url),
      recovered,
      stillStale,
      before,
      after,
    };
  });

// Admin-only. Read recent audit rows.
export const listDomainRepushAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { limit?: number }) =>
    z.object({ limit: z.number().int().min(1).max(100).optional() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const limit = data.limit ?? 25;
    const { data: rows, error } = await (context.supabase as any)
      .from("domain_repush_audit")
      .select(
        "id, run_at, triggered_by, bundle_commit_short, targets_total, targets_recovered, targets_still_stale, targets, notes",
      )
      .order("run_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { rows: rows ?? [] };
  });
