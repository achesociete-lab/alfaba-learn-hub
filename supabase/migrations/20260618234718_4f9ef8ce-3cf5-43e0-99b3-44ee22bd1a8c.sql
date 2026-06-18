-- 1. Colonne multi-audios
ALTER TABLE public.presentiel_submissions
  ADD COLUMN IF NOT EXISTS feedback_audio_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

-- 2. Policy storage pour upload teacher (drop puis recreate pour éviter le conflit)
DROP POLICY IF EXISTS "Teachers upload annotation photos" ON storage.objects;
DROP POLICY IF EXISTS "Teachers update annotation photos" ON storage.objects;

CREATE POLICY "Teachers upload annotation photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'presentiel-submissions' AND public.is_admin_or_teacher());

CREATE POLICY "Teachers update annotation photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'presentiel-submissions' AND public.is_admin_or_teacher())
  WITH CHECK (bucket_id = 'presentiel-submissions' AND public.is_admin_or_teacher());