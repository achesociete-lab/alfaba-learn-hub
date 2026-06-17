
CREATE POLICY "Teachers upload annotation photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'presentiel-submissions' AND public.is_admin_or_teacher());

CREATE POLICY "Teachers update annotation photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'presentiel-submissions' AND public.is_admin_or_teacher())
  WITH CHECK (bucket_id = 'presentiel-submissions' AND public.is_admin_or_teacher());
