# Guest Upload Anomaly Alerts

_Last reviewed: 2026-07-14_

This document explains how the guest photo upload anomaly detection pipeline
works, how alerts are delivered to admins, and how to tune the detection
thresholds safely.

## Pipeline overview

```
guest_uploads (INSERT)
        │
        ▼
scan_guest_upload_anomalies()   ← pg_cron: */5 * * * *
        │  (reads thresholds from guest_upload_alert_config)
        ▼
guest_upload_alerts (INSERT, deduped per window+ip+type)
        │
        ▼
guest_upload_alerts_notify()    ← AFTER INSERT trigger, uses net.http_post
        │
        ▼
POST /api/public/hooks/guest-upload-alert   { id }
        │  (looks up the alert row via service role — the body is only an id)
        ├──► Slack   (if SLACK_ALERTS_WEBHOOK_URL is set)
        └──► Email   (enqueue_email → transactional_emails queue → sender)
```

The webhook trusts only the alert **id** in the request body. It re-reads
the row from `guest_upload_alerts` using the service role, so an attacker
who calls the public route cannot inject arbitrary alert content — the
worst they can do is force a lookup for a nonexistent id (a cheap no-op
that returns HTTP 404).

## Adjusting detection thresholds

All three anomaly categories read their thresholds from the singleton row
in `public.guest_upload_alert_config` (id = 1). Admins can update them:

- **UI:** `/admin/guest-upload-alerts` → *Detection thresholds* panel.
- **SQL:** `UPDATE public.guest_upload_alert_config SET ... WHERE id = 1;`
  (RLS restricts this to authenticated admins via `has_role`.)

| Field | Default | Meaning |
|---|---|---|
| `burst_window_minutes`   | 10 | Sliding window for detecting rapid uploads from one IP hash. |
| `burst_threshold`        | 50 | Uploads per IP hash within the burst window before an alert fires. |
| `reject_window_minutes`  | 60 | Sliding window for repeated rejections. |
| `reject_threshold`       | 30 | Rejected uploads per IP hash within the reject window. |
| `spray_window_minutes`   | 30 | Sliding window for cross-event probing. |
| `spray_threshold`        | 10 | Distinct events touched by one IP hash before an alert fires. |
| `notify_webhook_url`     | NULL | Optional override URL. Leave blank to use the built-in `/api/public/hooks/guest-upload-alert` route. |

### Safe adjustment guidelines

1. **Raise thresholds during large events.** A packed wedding can easily
   push a single household's shared NAT IP past 50 uploads in 10 minutes.
   Bump `burst_threshold` (not the window) if a real event is producing
   false positives.
2. **Never set a window shorter than the pg_cron interval (5 min).** The
   scan runs every 5 minutes, so a 1-minute window would miss most of the
   qualifying activity between runs.
3. **Never set a threshold to 0 or 1.** The RPC rate limits already reject
   obvious abuse; the anomaly scanner is a *pattern* detector, not a
   per-request filter.
4. **Keep windows ≤ 24 hours.** The CHECK constraints enforce 1–1440
   minutes so a typo can't turn the scan into a table scan of the entire
   history.
5. **Change one dimension at a time.** After each change, watch
   `/admin/guest-upload-alerts` for a full window before adjusting the
   next value — otherwise you can't attribute the effect.
6. **Custom webhook URLs stay same-origin.** If you set
   `notify_webhook_url`, point it at a route on the same project (or a
   trusted internal service). External URLs work but expose the alert
   payload to that third party.

## Notification channels

- **Slack** — Set the `SLACK_ALERTS_WEBHOOK_URL` secret to a Slack
  Incoming Webhook URL. The route posts a short summary of each alert.
  Leave the secret unset to disable Slack delivery.
- **Email** — Alerts are enqueued into the `transactional_emails` pgmq
  queue with `template_name = "guest-upload-alert"` and a fixed recipient
  of `partnerships@industryarmymarketing.com`. Delivery uses the standard
  Lovable email queue processor (`/lovable/email/queue/process`); check
  `email_send_log` filtered by that template name to audit delivery.

Both channels are additive — enabling neither still records the alert row
in `guest_upload_alerts`, which the admin page reads.

## Testing the pipeline

- **Unit / integration:** `src/lib/__tests__/guestUploadRpcs.e2e.test.ts`
  exercises the RPCs directly against Postgres (rate limit, trusted code,
  active-event checks). Auto-skips when `PGHOST` is unset.
- **Permission regression:** `src/lib/__tests__/anonExecutePermissions.test.ts`
  asserts only the three documented RPCs are anon-executable.
- **Manual scan trigger:** run
  `SELECT public.scan_guest_upload_anomalies();` as service role. Any new
  alert row will fire the notification trigger.
- **Manual notification test:** insert a fake alert row as service role,
  then verify the Slack post and the row appended to `email_send_log`.

## Related

- `docs/security/anon-security-definer-functions.md` — rationale for the
  anon-executable RPC surface used by the upload flow.
- Migration `20260714_guest_upload_monitoring.sql` — creates the alerts
  table and the scan function.
- Migration adding `guest_upload_alert_config` and the notify trigger —
  see the latest migration timestamped 2026-07-14.
