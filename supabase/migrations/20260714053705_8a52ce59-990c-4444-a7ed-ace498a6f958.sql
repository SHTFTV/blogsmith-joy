
ALTER TABLE public.launch_broadcasts
  ADD COLUMN IF NOT EXISTS broadcast_key TEXT;

CREATE INDEX IF NOT EXISTS launch_broadcasts_broadcast_key_idx
  ON public.launch_broadcasts (broadcast_key);

CREATE INDEX IF NOT EXISTS email_send_log_metadata_broadcast_idx
  ON public.email_send_log ((metadata->>'broadcast_id'))
  WHERE metadata ? 'broadcast_id';
