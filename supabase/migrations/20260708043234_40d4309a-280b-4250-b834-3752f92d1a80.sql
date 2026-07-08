
-- Drop the overly-broad public read policy that exposed event_code and owner_id
DROP POLICY IF EXISTS "wedding_events_public_read_active" ON public.wedding_events;

-- Revoke direct anon SELECT — public must go through the RPC below
REVOKE SELECT ON public.wedding_events FROM anon;

-- Security-definer lookup: caller must already know the event_code.
-- Returns only the fields needed by the guest wall (no owner_id).
CREATE OR REPLACE FUNCTION public.get_event_by_code(code text)
RETURNS TABLE (id uuid, event_code text, couple_name text, active boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, event_code, couple_name, active
  FROM public.wedding_events
  WHERE event_code = upper(code)
    AND active = true
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_event_by_code(text) FROM public;
GRANT EXECUTE ON FUNCTION public.get_event_by_code(text) TO anon, authenticated;
