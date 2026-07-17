-- Tighten pricing_calculator_events INSERT policy (replace WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can insert pricing calculator events" ON public.pricing_calculator_events;
CREATE POLICY "Anyone can insert pricing calculator events"
  ON public.pricing_calculator_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    event_name IS NOT NULL
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 6 AND 128
    AND length(coalesce(user_agent, '')) <= 1000
    AND length(coalesce(entry_page, '')) <= 500
    AND length(coalesce(city, '')) <= 200
    AND length(coalesce(country, '')) <= 200
    AND length(coalesce(source, '')) <= 200
    AND length(coalesce(destination, '')) <= 200
    AND length(coalesce(referrer_source, '')) <= 500
    AND length(coalesce(attempted_city, '')) <= 200
  );

-- Add owner-scoped UPDATE policy for guest-photos storage bucket
-- (parity with SELECT/DELETE; keeps write ownership fail-closed for non-owners)
DROP POLICY IF EXISTS guest_photos_owner_can_update ON storage.objects;
CREATE POLICY guest_photos_owner_can_update
  ON storage.objects
  FOR UPDATE
  TO public
  USING (
    bucket_id = 'guest-photos'
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(objects.name))[1]
        AND e.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'guest-photos'
    AND EXISTS (
      SELECT 1 FROM public.wedding_events e
      WHERE e.id::text = (storage.foldername(objects.name))[1]
        AND e.owner_id = auth.uid()
    )
  );
