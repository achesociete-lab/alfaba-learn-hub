ALTER TABLE public.nouraniya_sessions
  ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '{}';

CREATE TABLE IF NOT EXISTS public.nouraniya_exercise_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.nouraniya_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  mcq_answers JSONB NOT NULL DEFAULT '[]',
  mcq_score INTEGER NOT NULL DEFAULT 0,
  dictation_answers JSONB NOT NULL DEFAULT '[]',
  dictation_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_exercise_results TO authenticated;
GRANT ALL ON public.nouraniya_exercise_results TO service_role;

ALTER TABLE public.nouraniya_exercise_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_exercise_results" ON public.nouraniya_exercise_results FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "student_own_exercise_results" ON public.nouraniya_exercise_results FOR ALL
  USING (student_id = auth.uid());

CREATE POLICY "parent_read_exercise_results" ON public.nouraniya_exercise_results FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = student_id));

CREATE POLICY "enrolled_student_read_sessions" ON public.nouraniya_sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.nouraniya_enrollments ne WHERE ne.student_id = auth.uid() AND ne.group_id = group_id));