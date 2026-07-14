# Anon-Executable `SECURITY DEFINER` Functions

_Last reviewed: 2026-07-14_

The Supabase linter flags every `SECURITY DEFINER` function that is executable
by the `anon` role. In this project a small, deliberate allow-list of such
functions powers the public guest photo-upload flow. All other `SECURITY
DEFINER` helpers have `EXECUTE` revoked from `anon` (and, where appropriate,
from `PUBLIC`).

## Why `SECURITY DEFINER` is required here

The guest upload flow is used by **unauthenticated wedding guests** who tap a
QR code and land on a public upload page. They have no Supabase session, so
they operate as the `anon` role. The underlying tables (`wedding_events`,
`wedding_event_secrets`, `guest_uploads`) are protected by RLS that
intentionally does **not** grant `anon` direct read/write access — exposing
those tables would leak private event data and allow arbitrary inserts.

`SECURITY DEFINER` functions let us expose a **narrow, validated RPC surface**
that runs with the function owner's privileges while enforcing our own checks
inside the function body.

## The allow-list

| Function | Purpose | Validations performed |
|---|---|---|
| `public.get_event_by_code(code text)` | Resolve a public event code (printed on invites) to a minimal event record. | Uppercases input; returns only `id`, `event_code`, `couple_name`, `active`; filters `active = true`; `LIMIT 1`; no PII beyond couple name. |
| `public.get_event_by_trusted_code(code text)` | Resolve a **trusted** upload code (shared privately by the couple) to a minimal event record used to auto-approve uploads. | Requires the code to exist in `wedding_event_secrets`; filters `active = true`; returns only `id`, `couple_name`, `active`; no secrets returned. |
| `public.submit_guest_upload(...)` | Insert a guest upload row after the guest has uploaded media to storage. | Verifies `wedding_events.active = true`; if `trusted_code` provided, verifies it against `wedding_event_secrets`; per-IP-hash rate limit (20 uploads / 10 min anonymous, 300 / 10 min trusted); forces `status = 'pending_screening'`; `auto_approved` is set from server-side trusted-code check, **never** from client input; returns only the new row id. |

All three functions:

- Are the **only** RPCs the public upload page calls.
- Set `SET search_path = public` to defeat search-path hijacking.
- Return the minimum columns needed by the UI.
- Do not accept SQL, HTML, or file bytes — only scalar identifiers and a
  storage path already written by the guest's authenticated storage upload.

## What is explicitly not exposed to `anon`

Every other `SECURITY DEFINER` function in `public` has `EXECUTE` revoked from
`anon`:

`has_role`, `get_my_event_trusted_code`, `enqueue_email`, `delete_email`,
`move_to_dlq`, `read_email_batch`, `email_queue_wake`, `email_queue_dispatch`,
`wedding_events_after_insert_mint_secret`.

The automated test in `src/lib/__tests__/anonExecutePermissions.test.ts`
asserts both sides of this contract and will fail the build if a future
migration widens the allow-list or accidentally revokes one of the required
public grants.

## Abuse monitoring

`public.scan_guest_upload_anomalies()` runs on a `pg_cron` schedule and writes
into `public.guest_upload_alerts` whenever it sees:

- more than 50 uploads from a single IP hash in a 10-minute window,
- more than 30 rejected uploads from a single IP hash in a 60-minute window,
- a single IP hash touching more than 10 distinct events in a 30-minute
  window (cross-event spraying).

Alerts are readable only by admins (via `has_role(auth.uid(), 'admin')`) and
by `service_role`. See migration `20260714_guest_upload_monitoring.sql`.
