
-- Tighten SECURITY DEFINER function EXECUTE grants
REVOKE EXECUTE ON FUNCTION public.get_my_event_trusted_code(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.wedding_events_after_insert_mint_secret() FROM PUBLIC, anon, authenticated;

-- Scope vendor-photos storage SELECT to owners; public viewing uses signed URLs
DROP POLICY IF EXISTS "Vendor photos viewable" ON storage.objects;
CREATE POLICY "Vendor owners can list own photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'vendor-photos'
  AND (storage.foldername(name))[1] = (auth.uid())::text
);
