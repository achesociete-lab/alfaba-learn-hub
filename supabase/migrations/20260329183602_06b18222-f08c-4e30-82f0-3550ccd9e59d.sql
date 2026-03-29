
CREATE TABLE public.teacher_recordings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  surah_number integer NOT NULL,
  audio_url text NOT NULL,
  teacher_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(surah_number)
);

ALTER TABLE public.teacher_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can listen to teacher recordings"
  ON public.teacher_recordings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage recordings"
  ON public.teacher_recordings FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Teachers can update recordings"
  ON public.teacher_recordings FOR UPDATE
  TO authenticated
  USING (is_admin_or_teacher());

CREATE POLICY "Teachers can delete recordings"
  ON public.teacher_recordings FOR DELETE
  TO authenticated
  USING (is_admin_or_teacher());

-- Make quran-recordings bucket public so students can play teacher audio
UPDATE storage.buckets SET public = true WHERE id = 'quran-recordings';

-- Storage policy: allow authenticated users to read all files
CREATE POLICY "Authenticated users can read quran recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'quran-recordings');

-- Allow teachers to upload
CREATE POLICY "Teachers can upload quran recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'quran-recordings' AND is_admin_or_teacher());
