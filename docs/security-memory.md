# Security Memory — weddings.io

> Mirror of the Lovable-managed security memory. This file is the source of
> truth that CI validates (`scripts/validate-security-memory.mjs`). When you
> edit the entry via the security tools, update this file in the same commit.

## Application access model

Public-facing wedding platform. Most routes are anonymous-readable. A small
set of authenticated routes (owner dashboards, admin) sit behind
`_authenticated/` with the integration-managed Supabase gate. Guests upload
photos to a wedding photo-wall using short event codes / trusted VIP codes;
those flows are intentionally callable by `anon`.

## Never allow

- `anon` execute on ANY `public.*` function except the five listed under
  "Accepted anon-callable SECURITY DEFINER functions" below.
- `authenticated` execute on the internal email-queue helpers
  (`enqueue_email`, `read_email_batch`, `delete_email`, `move_to_dlq`,
  `email_queue_dispatch`, `email_queue_wake`). Those are `service_role`
  only. Any migration re-granting these to `anon`/`authenticated` is a
  regression.
- A `SECURITY DEFINER` function without `SET search_path = public` (or
  `public, pg_temp`). This is enforced by
  `scripts/lint-supabase-security.mjs`.
- Broad `USING (true)` SELECT policies on user-owned tables without a
  `-- public-read: <reason>` justification comment.

## Accepted anon-callable SECURITY DEFINER functions

Each entry MUST contain the four labelled sections below. CI
(`scripts/validate-security-memory.mjs`) rejects the memory if any of
them are missing:

- **Callers:** which Postgres roles (`anon`, `authenticated`, `service_role`) may execute.
- **Why definer:** why `SECURITY INVOKER` is insufficient.
- **Data returned:** shape of the return, and confirmation no PII/secret leaks.
- **Abuse control:** in-function checks (rate limit, ownership, active flag, etc.).

### 1. `public.get_event_by_code(text)`

- **Callers:** `anon`, `authenticated`.
- **Why definer:** reads `public.wedding_events` past its RLS so a guest
  who only knows the short event code can resolve the event.
- **Data returned:** `(id, event_code, couple_name, active)` — no PII,
  no contact info, no owner id.
- **Abuse control:** filtered to `active = true`, `LIMIT 1`, upper-cased
  code lookup; short codes are non-enumerable in practice.

### 2. `public.get_event_by_trusted_code(text)`

- **Callers:** `anon`, `authenticated`.
- **Why definer:** joins `wedding_events` with `wedding_event_secrets`
  (secrets table is otherwise unreadable by clients).
- **Data returned:** `(id, couple_name, active)` — trusted code itself
  is never echoed back.
- **Abuse control:** requires an exact 10-char trusted code hand-shared
  by the couple with VIP guests.

### 3. `public.submit_guest_upload(uuid, text, text, text, text, text, text)`

- **Callers:** `anon`, `authenticated`.
- **Why definer:** guests are not signed in; the function performs the
  event lookup, trusted-code verification, per-IP rate-limit check, and
  the insert into `public.guest_uploads` with a screening status the
  client cannot override.
- **Data returned:** the new upload id (uuid). No stored row is echoed.
- **Abuse control:** 20 uploads / 10 min per IP-hash for anon, 300 / 10 min
  for verified trusted; requires `active = true` event;
  `auto_approved = true` only when a valid trusted code is presented.

### 4. `public.get_my_event_trusted_code(uuid)`

- **Callers:** `authenticated` only (anon EXECUTE revoked).
- **Why definer:** reads `wedding_event_secrets`, which is not directly
  readable by clients.
- **Data returned:** the trusted code string, only for events where
  `wedding_events.owner_id = auth.uid()`.
- **Abuse control:** join on `owner_id = auth.uid()` scopes the row set
  to the caller's own events.

### 5. `public.has_role(uuid, app_role)`

- **Callers:** `authenticated` only (anon EXECUTE revoked).
- **Why definer:** used inside RLS policies on other tables to avoid
  recursive RLS on `public.user_roles`. Cannot be `SECURITY INVOKER`
  without reintroducing the recursion the split-table pattern solves.
- **Data returned:** `boolean`. No user data leaks.
- **Abuse control:** boolean-only return; parameters are the caller's
  own claimed user id + role; policies use it with `auth.uid()`.

`public.wedding_events_after_insert_mint_secret` is `SECURITY DEFINER` but
has `EXECUTE` revoked from `anon` and `authenticated`; it fires as a
trigger only and is deliberately excluded from the list above.

## Pre-publish and post-deploy enforcement

- `scripts/lint-supabase-security.mjs` runs first in the `prebuild` npm
  script and in `.github/workflows/supabase-security.yml`.
- `scripts/validate-security-memory.mjs` runs in `prebuild` and in the
  same workflow — fails the build if this document loses a required
  section for any of the five accepted functions.
- `scripts/scan-supabase-live-security.mjs` runs in
  `.github/workflows/supabase-post-deploy.yml` against the live database
  using `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF`; any new
  linter warning outside the accepted allowlist fails the job and
  blocks the next publish.
