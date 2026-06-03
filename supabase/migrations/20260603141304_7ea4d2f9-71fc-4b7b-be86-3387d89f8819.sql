-- Add verse/page tracking to hifz_evaluations
ALTER TABLE public.hifz_evaluations
  ADD COLUMN IF NOT EXISTS surah_start int,
  ADD COLUMN IF NOT EXISTS verse_start int,
  ADD COLUMN IF NOT EXISTS surah_end int,
  ADD COLUMN IF NOT EXISTS verse_end int,
  ADD COLUMN IF NOT EXISTS page_start int,
  ADD COLUMN IF NOT EXISTS page_end int;

-- Add rescheduling fields to hifz_sessions
ALTER TABLE public.hifz_sessions
  ADD COLUMN IF NOT EXISTS reschedule_type text,
  ADD COLUMN IF NOT EXISTS reschedule_message text,
  ADD COLUMN IF NOT EXISTS reschedule_proposed_date date,
  ADD COLUMN IF NOT EXISTS reschedule_proposed_time time,
  ADD COLUMN IF NOT EXISTS reschedule_requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS reschedule_initiated_by text;

-- Create hifz_mushaf_annotations table
CREATE TABLE IF NOT EXISTS public.hifz_mushaf_annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  page_number int NOT NULL,
  annotated_image_url text NOT NULL,
  note text,
  session_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Grants for hifz_mushaf_annotations
GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_mushaf_annotations TO authenticated;
GRANT ALL ON public.hifz_mushaf_annotations TO service_role;

-- Enable RLS
ALTER TABLE public.hifz_mushaf_annotations ENABLE ROW LEVEL SECURITY;

-- RLS policies for hifz_mushaf_annotations
CREATE POLICY "Students view own annotations"
ON public.hifz_mushaf_annotations
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY "Teachers manage all annotations"
ON public.hifz_mushaf_annotations
FOR ALL
TO authenticated
USING (is_admin_or_teacher())
WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Teachers view all annotations"
ON public.hifz_mushaf_annotations
FOR SELECT
TO authenticated
USING (is_admin_or_teacher());