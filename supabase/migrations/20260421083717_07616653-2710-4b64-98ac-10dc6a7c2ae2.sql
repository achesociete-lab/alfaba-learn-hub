
-- 1) Enum extension
ALTER TYPE public.student_type ADD VALUE IF NOT EXISTS 'en_attente';

-- 2) Tables (no policies yet)
CREATE TABLE public.presentiel_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  course_date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  ocr_text TEXT,
  qcm JSONB DEFAULT '[]'::jsonb,
  translation JSONB DEFAULT '{}'::jsonb,
  dictation JSONB DEFAULT '{}'::jsonb,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.presentiel_course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.presentiel_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

CREATE TABLE public.presentiel_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.presentiel_courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  qcm_score INTEGER,
  qcm_completed BOOLEAN NOT NULL DEFAULT false,
  translation_completed BOOLEAN NOT NULL DEFAULT false,
  dictation_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX idx_presentiel_assignments_user ON public.presentiel_course_assignments(user_id);
CREATE INDEX idx_presentiel_assignments_course ON public.presentiel_course_assignments(course_id);

-- 3) Enable RLS
ALTER TABLE public.presentiel_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentiel_course_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentiel_course_progress ENABLE ROW LEVEL SECURITY;

-- 4) Policies
CREATE POLICY "Teachers manage presentiel courses"
  ON public.presentiel_courses FOR ALL TO authenticated
  USING (is_admin_or_teacher())
  WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Assigned students view presentiel courses"
  ON public.presentiel_courses FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.presentiel_course_assignments a
    WHERE a.course_id = presentiel_courses.id AND a.user_id = auth.uid()
  ));

CREATE POLICY "Teachers manage assignments"
  ON public.presentiel_course_assignments FOR ALL TO authenticated
  USING (is_admin_or_teacher())
  WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Students view their own assignments"
  ON public.presentiel_course_assignments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Students manage their own progress"
  ON public.presentiel_course_progress FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers view all progress"
  ON public.presentiel_course_progress FOR SELECT TO authenticated
  USING (is_admin_or_teacher());

-- 5) Triggers
CREATE TRIGGER update_presentiel_courses_updated_at
  BEFORE UPDATE ON public.presentiel_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_presentiel_progress_updated_at
  BEFORE UPDATE ON public.presentiel_course_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('presentiel-courses', 'presentiel-courses', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read presentiel course photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'presentiel-courses');

CREATE POLICY "Teachers upload presentiel course photos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'presentiel-courses' AND is_admin_or_teacher());

CREATE POLICY "Teachers update presentiel course photos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'presentiel-courses' AND is_admin_or_teacher());

CREATE POLICY "Teachers delete presentiel course photos"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'presentiel-courses' AND is_admin_or_teacher());
