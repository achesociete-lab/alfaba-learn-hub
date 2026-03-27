INSERT INTO storage.buckets (id, name, public) VALUES ('quran-recordings', 'quran-recordings', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload their own recordings" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'quran-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own recordings" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'quran-recordings' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admin can view all recordings" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'quran-recordings' AND is_admin_or_teacher());
