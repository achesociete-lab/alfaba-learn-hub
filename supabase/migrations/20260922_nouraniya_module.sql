-- Module Nouraniya : gestion des cours d'arabe en présentiel (méthode Nouraniya)

-- Groupes / classes
CREATE TABLE IF NOT EXISTS public.nouraniya_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'debutant', -- debutant, intermediaire, avance
  day_of_week TEXT, -- lundi, mardi, …
  time_slot TEXT,   -- "14h00-15h30"
  location TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inscription d'un élève dans un groupe
CREATE TABLE IF NOT EXISTS public.nouraniya_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.nouraniya_groups(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, group_id)
);

-- Séances (occurrences réelles d'un groupe)
CREATE TABLE IF NOT EXISTS public.nouraniya_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.nouraniya_groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  title TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Présences par séance et par élève
CREATE TABLE IF NOT EXISTS public.nouraniya_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.nouraniya_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'retard')),
  delay_minutes INTEGER,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

-- Notes et évaluations par élève
CREATE TABLE IF NOT EXISTS public.nouraniya_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.nouraniya_groups(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'global', -- recitation, ecriture, lecture, comportement, global
  score NUMERIC(4,1) NOT NULL,
  max_score NUMERIC(4,1) NOT NULL DEFAULT 20,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lien parent → profil élève
CREATE TABLE IF NOT EXISTS public.parent_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_user_id, child_profile_id)
);

-- Messages du professeur aux parents
CREATE TABLE IF NOT EXISTS public.nouraniya_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS : admin/teacher voient tout
ALTER TABLE public.nouraniya_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_messages ENABLE ROW LEVEL SECURITY;

-- Admin/teacher : accès total
CREATE POLICY "admin_all_groups" ON public.nouraniya_groups FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "admin_all_enrollments" ON public.nouraniya_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "admin_all_sessions" ON public.nouraniya_sessions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "admin_all_attendance" ON public.nouraniya_attendance FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "admin_all_grades" ON public.nouraniya_grades FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "admin_all_parent_links" ON public.parent_links FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

CREATE POLICY "admin_all_messages" ON public.nouraniya_messages FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','teacher')));

-- Parents : lecture de leur propre lien + données de leur enfant
CREATE POLICY "parent_read_own_link" ON public.parent_links FOR SELECT
  USING (parent_user_id = auth.uid());

CREATE POLICY "parent_read_child_attendance" ON public.nouraniya_attendance FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = student_id
  ));

CREATE POLICY "parent_read_child_grades" ON public.nouraniya_grades FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = student_id
  ));

CREATE POLICY "parent_read_messages" ON public.nouraniya_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = student_id
  ));

CREATE POLICY "parent_mark_read_messages" ON public.nouraniya_messages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = student_id
  ));

CREATE POLICY "parent_read_sessions" ON public.nouraniya_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    JOIN public.nouraniya_enrollments ne ON ne.student_id = pl.child_profile_id
    WHERE pl.parent_user_id = auth.uid() AND ne.group_id = group_id
  ));

CREATE POLICY "parent_read_groups" ON public.nouraniya_groups FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    JOIN public.nouraniya_enrollments ne ON ne.student_id = pl.child_profile_id
    WHERE pl.parent_user_id = auth.uid() AND ne.group_id = id
  ));
