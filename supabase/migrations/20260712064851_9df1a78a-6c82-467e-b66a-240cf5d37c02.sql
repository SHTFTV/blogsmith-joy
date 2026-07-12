
-- Fix: SUPA_function_search_path_mutable — pin search_path on email queue helpers
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pg_temp;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pg_temp;

-- Fix: SUPA_anon_security_definer_function_executable — revoke anon EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.delete_email(text, bigint) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enqueue_email(text, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.read_email_batch(text, integer, integer) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.move_to_dlq(text, text, bigint, jsonb) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_dispatch() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_queue_wake() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_event_by_trusted_code(text) FROM PUBLIC;

-- Fix: propagation_check_runs_public_read — restrict deployment/monitoring reads to admins
DROP POLICY IF EXISTS "Anyone can read watchdog history" ON public.propagation_check_runs;
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.propagation_check_runs FROM anon;

CREATE POLICY "Admins can read watchdog history"
  ON public.propagation_check_runs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
