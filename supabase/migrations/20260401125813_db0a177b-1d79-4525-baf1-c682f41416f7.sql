
CREATE TABLE public.teacher_audio_clips (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level public.class_level NOT NULL,
  lesson_number integer NOT NULL,
  audio_key text NOT NULL,
  audio_url text NOT NULL,
  recorded_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (level, lesson_number, audio_key)
);

ALTER TABLE public.teacher_audio_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can listen to audio clips"
ON public.teacher_audio_clips FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Teachers can insert audio clips"
ON public.teacher_audio_clips FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Teachers can update audio clips"
ON public.teacher_audio_clips FOR UPDATE
TO authenticated
USING (is_admin_or_teacher());

CREATE POLICY "Teachers can delete audio clips"
ON public.teacher_audio_clips FOR DELETE
TO authenticated
USING (is_admin_or_teacher());

CREATE TRIGGER update_teacher_audio_clips_updated_at
BEFORE UPDATE ON public.teacher_audio_clips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
