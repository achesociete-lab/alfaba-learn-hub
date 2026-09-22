-- Exercices e-learning liés aux séances Nouraniya

-- Colonne exercises sur les séances (JSONB)
-- Structure: { letters: string[], instructions: string, mcq: [{question,display,choices,correct_index,explanation}], dictation_words: string[], audio_url: string }
ALTER TABLE public.nouraniya_sessions
ADD COLUMN IF NOT EXISTS exercises JSONB DEFAULT '{}';

-- Résultats des exercices par élève
CREATE TABLE IF NOT EXISTS public.nouraniya_exercise_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.nouraniya_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  mcq_answers JSONB NOT NULL DEFAULT '[]',  -- [{question_index, selected_index, correct}]
  mcq_score INTEGER NOT NULL DEFAULT 0,      -- 0-100
  dictation_answers JSONB NOT NULL DEFAULT '[]', -- [{word, answer, correct}]
  dictation_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE public.nouraniya_exercise_results ENABLE ROW LEVEL SECURITY;

-- Admin/teacher : accès total
CREATE POLICY "admin_all_exercise_results" ON public.nouraniya_exercise_results FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

-- Élève : peut lire et écrire ses propres résultats
CREATE POLICY "student_own_exercise_results" ON public.nouraniya_exercise_results FOR ALL
  USING (student_id = auth.uid());

-- Parents : lecture des résultats de leur enfant
CREATE POLICY "parent_read_exercise_results" ON public.nouraniya_exercise_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = student_id
  ));

-- Les élèves Nouraniya peuvent lire les séances de leur groupe (pour accéder aux exercices)
-- (La policy parent_read_sessions couvre déjà le cas parent)
-- Policy élève inscrit dans un groupe peut lire les séances de ce groupe
CREATE POLICY "enrolled_student_read_sessions" ON public.nouraniya_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.nouraniya_enrollments ne
    WHERE ne.student_id = auth.uid() AND ne.group_id = group_id
  ));
