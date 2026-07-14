import { execSync } from "node:child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * End-to-end test for the guest photo upload SECURITY DEFINER surface.
 *
 * Simulates realistic guest upload attempts against the real database
 * (via `psql`) and asserts that the three anon-executable RPCs enforce:
 *
 *  1. Per-event validation — rejects inactive / unknown events.
 *  2. Trusted-code checks   — auto-approves iff the code matches
 *     wedding_event_secrets, otherwise stays in the anonymous rate limit
 *     bucket and does NOT auto-approve.
 *  3. Rate limiting          — 20 uploads / 10 min anonymous, 300 / 10 min
 *     trusted.
 *
 * All test data is scoped under an ephemeral event and IP hash, and
 * cleaned up in afterAll. The test auto-skips when PGHOST is missing
 * (matches src/lib/__tests__/anonExecutePermissions.test.ts).
 */

function psqlAvailable(): boolean {
  if (!process.env.PGHOST) return false;
  try {
    execSync("psql -tAc 'select 1'", { stdio: ["ignore", "pipe", "ignore"] });
    return true;
  } catch {
    return false;
  }
}

function sql<T = string>(q: string): T {
  const out = execSync(`psql -tAc ${JSON.stringify(q)}`, {
    stdio: ["ignore", "pipe", "pipe"],
  })
    .toString()
    .trim();
  return out as unknown as T;
}

function sqlOrThrow(q: string): string {
  try {
    return execSync(`psql -tAc ${JSON.stringify(q)}`, {
      stdio: ["ignore", "pipe", "pipe"],
    })
      .toString()
      .trim();
  } catch (err) {
    const stderr =
      (err as { stderr?: Buffer }).stderr?.toString() ?? String(err);
    throw new Error(stderr);
  }
}

const shouldRun = psqlAvailable();
const describeIfDb = shouldRun ? describe : describe.skip;

describeIfDb("guest upload RPCs (E2E)", () => {
  const eventCode = `E2E${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const trustedCode = `T2E${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const ipHashAnon = `e2e-anon-${Date.now().toString(36)}`;
  const ipHashTrusted = `e2e-trust-${Date.now().toString(36)}`;
  let eventId = "";

  beforeAll(() => {
    // Insert a fresh event owned by nobody (owner_id nullable). The
    // after-insert trigger mints a wedding_event_secrets row; we overwrite
    // it with a known trusted code so the test can assert both paths.
    eventId = sqlOrThrow(
      `INSERT INTO public.wedding_events (event_code, couple_name, active)
       VALUES ('${eventCode}', 'E2E Test Couple', true)
       RETURNING id;`,
    );
    sqlOrThrow(
      `UPDATE public.wedding_event_secrets
       SET trusted_code = '${trustedCode}'
       WHERE event_id = '${eventId}';`,
    );
  });

  afterAll(() => {
    if (!eventId) return;
    // Order matters — clean children first.
    try {
      sqlOrThrow(
        `DELETE FROM public.guest_upload_alerts WHERE uploader_ip_hash IN ('${ipHashAnon}', '${ipHashTrusted}');`,
      );
      sqlOrThrow(
        `DELETE FROM public.guest_uploads WHERE event_id = '${eventId}';`,
      );
      sqlOrThrow(
        `DELETE FROM public.wedding_event_secrets WHERE event_id = '${eventId}';`,
      );
      sqlOrThrow(`DELETE FROM public.wedding_events WHERE id = '${eventId}';`);
    } catch {
      // best-effort cleanup
    }
  });

  it("get_event_by_code returns the active event", () => {
    const found = sql(
      `SELECT id FROM public.get_event_by_code('${eventCode}');`,
    );
    expect(found).toBe(eventId);
  });

  it("get_event_by_code returns nothing for an unknown code", () => {
    const found = sql(
      `SELECT id FROM public.get_event_by_code('NOSUCHCODE999');`,
    );
    expect(found).toBe("");
  });

  it("get_event_by_trusted_code succeeds only with the real trusted code", () => {
    const ok = sql(
      `SELECT id FROM public.get_event_by_trusted_code('${trustedCode}');`,
    );
    expect(ok).toBe(eventId);

    const bad = sql(
      `SELECT id FROM public.get_event_by_trusted_code('${trustedCode}XXX');`,
    );
    expect(bad).toBe("");
  });

  it("submit_guest_upload rejects an unknown event id", () => {
    expect(() =>
      sqlOrThrow(
        `SELECT public.submit_guest_upload(
          '00000000-0000-0000-0000-000000000000',
          'https://x/y.jpg', 'image', 'p', 'guest', '${ipHashAnon}', NULL);`,
      ),
    ).toThrow(/Event not found or inactive/);
  });

  it("submit_guest_upload without trusted code does NOT auto-approve", () => {
    const newId = sqlOrThrow(
      `SELECT public.submit_guest_upload(
        '${eventId}', 'https://x/y1.jpg', 'image', 'p1', 'guest',
        '${ipHashAnon}', NULL);`,
    );
    expect(newId).toMatch(/^[0-9a-f-]{36}$/);
    const auto = sql(
      `SELECT auto_approved FROM public.guest_uploads WHERE id = '${newId}';`,
    );
    expect(auto).toBe("f");
  });

  it("submit_guest_upload with the real trusted code auto-approves", () => {
    const newId = sqlOrThrow(
      `SELECT public.submit_guest_upload(
        '${eventId}', 'https://x/y2.jpg', 'image', 'p2', 'photog',
        '${ipHashTrusted}', '${trustedCode}');`,
    );
    const auto = sql(
      `SELECT auto_approved FROM public.guest_uploads WHERE id = '${newId}';`,
    );
    expect(auto).toBe("t");
  });

  it("submit_guest_upload with a wrong trusted code does NOT auto-approve", () => {
    const newId = sqlOrThrow(
      `SELECT public.submit_guest_upload(
        '${eventId}', 'https://x/y3.jpg', 'image', 'p3', 'faker',
        '${ipHashTrusted}', 'BOGUSCODE');`,
    );
    const auto = sql(
      `SELECT auto_approved FROM public.guest_uploads WHERE id = '${newId}';`,
    );
    expect(auto).toBe("f");
  });

  it(
    "anonymous rate limit (20 per 10 min) blocks the 21st upload",
    () => {
      // We've already inserted 1 anon row above. Add 19 more to reach 20.
      for (let i = 0; i < 19; i++) {
        sqlOrThrow(
          `SELECT public.submit_guest_upload(
            '${eventId}', 'https://x/r${i}.jpg', 'image', 'p_r${i}', 'guest',
            '${ipHashAnon}', NULL);`,
        );
      }
      // The 21st should fail.
      expect(() =>
        sqlOrThrow(
          `SELECT public.submit_guest_upload(
            '${eventId}', 'https://x/rZ.jpg', 'image', 'pZ', 'guest',
            '${ipHashAnon}', NULL);`,
        ),
      ).toThrow(/Too many uploads/);
    },
    30_000,
  );

  it("trusted rate limit is much higher (21st trusted upload still succeeds)", () => {
    // We inserted 1 trusted + 1 bogus (still under trusted hash). Insert 19
    // more trusted; total 21 for the trusted IP hash. Trusted cap is 300
    // per 10 min, so this stays well below.
    for (let i = 0; i < 19; i++) {
      sqlOrThrow(
        `SELECT public.submit_guest_upload(
          '${eventId}', 'https://x/t${i}.jpg', 'image', 'p_t${i}', 'photog',
          '${ipHashTrusted}', '${trustedCode}');`,
      );
    }
    const count = sql(
      `SELECT count(*)::text FROM public.guest_uploads
       WHERE uploader_ip_hash = '${ipHashTrusted}';`,
    );
    expect(Number(count)).toBeGreaterThanOrEqual(21);
  });

  it("submit_guest_upload rejects when event is inactive", () => {
    sqlOrThrow(
      `UPDATE public.wedding_events SET active = false WHERE id = '${eventId}';`,
    );
    try {
      expect(() =>
        sqlOrThrow(
          `SELECT public.submit_guest_upload(
            '${eventId}', 'https://x/ia.jpg', 'image', 'p_ia', 'guest',
            'e2e-inactive-${Date.now()}', NULL);`,
        ),
      ).toThrow(/Event not found or inactive/);
    } finally {
      sqlOrThrow(
        `UPDATE public.wedding_events SET active = true WHERE id = '${eventId}';`,
      );
    }
  });
});

if (!shouldRun) {
  describe.skip("guest upload RPCs (E2E)", () => {
    it("skipped — PGHOST not set", () => {
      expect(true).toBe(true);
    });
  });
}
