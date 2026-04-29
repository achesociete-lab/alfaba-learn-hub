
-- ============================================
-- 1. EXTEND presentiel_courses
-- ============================================
ALTER TABLE public.presentiel_courses
  ADD COLUMN IF NOT EXISTS level public.class_level NOT NULL DEFAULT 'niveau_1',
  ADD COLUMN IF NOT EXISTS lesson_text text,
  ADD COLUMN IF NOT EXISTS vocabulary jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dictation_words jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS comprehension_questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS reorder_exercises jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS fill_blanks jsonb NOT NULL DEFAULT '[]'::jsonb;

-- ============================================
-- 2. SUBMISSION STATUS ENUM
-- ============================================
DO $$ BEGIN
  CREATE TYPE public.presentiel_submission_status AS ENUM ('en_attente', 'validee', 'a_corriger');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.presentiel_step_type AS ENUM ('ecriture', 'dictee');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- 3. presentiel_submissions
-- ============================================
CREATE TABLE IF NOT EXISTS public.presentiel_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  user_id uuid NOT NULL,
  step_type public.presentiel_step_type NOT NULL,
  photo_url text NOT NULL,
  status public.presentiel_submission_status NOT NULL DEFAULT 'en_attente',
  feedback text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pres_subs_course ON public.presentiel_submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_pres_subs_user ON public.presentiel_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_pres_subs_status ON public.presentiel_submissions(status);

ALTER TABLE public.presentiel_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own submissions" ON public.presentiel_submissions;
CREATE POLICY "Students view own submissions"
  ON public.presentiel_submissions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students insert own submissions" ON public.presentiel_submissions;
CREATE POLICY "Students insert own submissions"
  ON public.presentiel_submissions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Teachers view all submissions" ON public.presentiel_submissions;
CREATE POLICY "Teachers view all submissions"
  ON public.presentiel_submissions FOR SELECT
  TO authenticated
  USING (public.is_admin_or_teacher());

DROP POLICY IF EXISTS "Teachers update submissions" ON public.presentiel_submissions;
CREATE POLICY "Teachers update submissions"
  ON public.presentiel_submissions FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_teacher())
  WITH CHECK (public.is_admin_or_teacher());

DROP POLICY IF EXISTS "Teachers delete submissions" ON public.presentiel_submissions;
CREATE POLICY "Teachers delete submissions"
  ON public.presentiel_submissions FOR DELETE
  TO authenticated
  USING (public.is_admin_or_teacher());

CREATE TRIGGER set_pres_subs_updated_at
  BEFORE UPDATE ON public.presentiel_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 4. presentiel_reading_scores
-- ============================================
CREATE TABLE IF NOT EXISTS public.presentiel_reading_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  user_id uuid NOT NULL,
  attempt_number integer NOT NULL DEFAULT 1,
  target_text text NOT NULL,
  transcription text,
  correct_words integer NOT NULL DEFAULT 0,
  total_words integer NOT NULL DEFAULT 0,
  score_percent numeric NOT NULL DEFAULT 0,
  word_results jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pres_scores_course ON public.presentiel_reading_scores(course_id);
CREATE INDEX IF NOT EXISTS idx_pres_scores_user ON public.presentiel_reading_scores(user_id);

ALTER TABLE public.presentiel_reading_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students view own scores" ON public.presentiel_reading_scores;
CREATE POLICY "Students view own scores"
  ON public.presentiel_reading_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Students insert own scores" ON public.presentiel_reading_scores;
CREATE POLICY "Students insert own scores"
  ON public.presentiel_reading_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Teachers view all scores" ON public.presentiel_reading_scores;
CREATE POLICY "Teachers view all scores"
  ON public.presentiel_reading_scores FOR SELECT
  TO authenticated
  USING (public.is_admin_or_teacher());

-- ============================================
-- 5. STORAGE BUCKET presentiel-submissions
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentiel-submissions', 'presentiel-submissions', false)
ON CONFLICT (id) DO NOTHING;

-- Policies on storage.objects
DROP POLICY IF EXISTS "Students upload own submission photos" ON storage.objects;
CREATE POLICY "Students upload own submission photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'presentiel-submissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Students read own submission photos" ON storage.objects;
CREATE POLICY "Students read own submission photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'presentiel-submissions'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Teachers read all submission photos" ON storage.objects;
CREATE POLICY "Teachers read all submission photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'presentiel-submissions'
    AND public.is_admin_or_teacher()
  );

DROP POLICY IF EXISTS "Teachers delete submission photos" ON storage.objects;
CREATE POLICY "Teachers delete submission photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'presentiel-submissions'
    AND public.is_admin_or_teacher()
  );
