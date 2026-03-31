
-- Storage bucket for lesson audio recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-recordings', 'lesson-recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Table to track lesson recordings
CREATE TABLE IF NOT EXISTS public.lesson_recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level public.class_level NOT NULL,
  lesson_number integer NOT NULL,
  audio_url text NOT NULL,
  recorded_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(level, lesson_number)
);

ALTER TABLE public.lesson_recordings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can listen
CREATE POLICY "Anyone can view lesson recordings" ON public.lesson_recordings
  FOR SELECT TO authenticated USING (true);

-- Only admin/teacher can manage
CREATE POLICY "Teachers can insert lesson recordings" ON public.lesson_recordings
  FOR INSERT TO authenticated WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Teachers can update lesson recordings" ON public.lesson_recordings
  FOR UPDATE TO authenticated USING (is_admin_or_teacher());

CREATE POLICY "Teachers can delete lesson recordings" ON public.lesson_recordings
  FOR DELETE TO authenticated USING (is_admin_or_teacher());

-- Storage policies for the bucket
CREATE POLICY "Anyone can read lesson recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'lesson-recordings');

CREATE POLICY "Teachers can upload lesson recordings" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'lesson-recordings' AND public.is_admin_or_teacher());

CREATE POLICY "Teachers can update lesson recordings" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'lesson-recordings' AND public.is_admin_or_teacher());

CREATE POLICY "Teachers can delete lesson recordings" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'lesson-recordings' AND public.is_admin_or_teacher());
