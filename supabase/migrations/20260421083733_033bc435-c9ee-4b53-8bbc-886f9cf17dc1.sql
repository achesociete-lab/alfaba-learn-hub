
-- Drop the broad public read and replace with object-level read
DROP POLICY IF EXISTS "Public read presentiel course photos" ON storage.objects;

CREATE POLICY "Public read individual presentiel course files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presentiel-courses' AND (storage.foldername(name))[1] IS NOT NULL);
