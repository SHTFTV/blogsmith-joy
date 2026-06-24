
CREATE POLICY "Vendors upload own photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vendor-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Vendors update own photos" ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vendor-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Vendors delete own photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vendor-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Vendor photos viewable" ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'vendor-photos');
