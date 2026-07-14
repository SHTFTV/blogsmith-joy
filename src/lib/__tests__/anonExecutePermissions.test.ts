import { execSync } from "node:child_process";
import { describe, it, expect } from "vitest";

/**
 * Regression guard for the anon-executable SECURITY DEFINER surface.
 *
 * See docs/security/anon-security-definer-functions.md for the rationale.
 * This test asserts BOTH sides of the contract:
 *   1. The three public guest-upload RPCs remain EXECUTE-able by anon.
 *   2. No other SECURITY DEFINER function in the `public` schema is
 *      EXECUTE-able by anon.
 *
 * The test uses `psql` against the managed Supabase database using the
 * standard PG* environment variables. When those are not available
 * (typical CI without DB access) the test is skipped rather than failing,
 * so it never blocks unrelated work — but any local run or DB-enabled CI
 * job will catch a regression.
 */

const REQUIRED_ANON_EXECUTABLE = new Set<string>([
  "get_event_by_code",
  "get_event_by_trusted_code",
  "submit_guest_upload",
]);

function psqlAvailable(): boolean {
  if (!process.env.PGHOST) return false;
  try {
    execSync("psql -tAc 'select 1'", { stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

function fetchAnonExecutable(): Set<string> {
  const sql = `
    SELECT DISTINCT p.proname
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    CROSS JOIN LATERAL aclexplode(p.proacl) a
    JOIN pg_roles r ON r.oid = a.grantee
    WHERE n.nspname = 'public'
      AND p.prosecdef
      AND a.privilege_type = 'EXECUTE'
      AND r.rolname = 'anon'
    ORDER BY p.proname;
  `.replace(/\s+/g, " ");
  const out = execSync(`psql -tAc ${JSON.stringify(sql)}`, {
    encoding: "utf8",
  });
  return new Set(
    out
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

describe("anon EXECUTE on SECURITY DEFINER functions in public", () => {
  const canRun = psqlAvailable();
  const maybe = canRun ? it : it.skip;

  maybe("grants EXECUTE to anon on exactly the required guest RPCs", () => {
    const actual = fetchAnonExecutable();

    // Every required function must be present.
    for (const name of REQUIRED_ANON_EXECUTABLE) {
      expect(
        actual.has(name),
        `Missing anon EXECUTE on required public RPC "${name}". ` +
          `The guest upload flow needs this; do not revoke it.`,
      ).toBe(true);
    }

    // No other SECURITY DEFINER function may be exposed to anon.
    const unexpected = [...actual].filter(
      (n) => !REQUIRED_ANON_EXECUTABLE.has(n),
    );
    expect(
      unexpected,
      `Unexpected anon-executable SECURITY DEFINER function(s): ` +
        `${unexpected.join(", ")}. Review docs/security/anon-security-definer-functions.md ` +
        `before widening the allow-list.`,
    ).toEqual([]);
  });
});
