CREATE TABLE IF NOT EXISTS public.nouraniya_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL DEFAULT 'debutant',
  day_of_week TEXT, time_slot TEXT, location TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nouraniya_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.nouraniya_groups(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, group_id)
);

CREATE TABLE IF NOT EXISTS public.nouraniya_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.nouraniya_groups(id) ON DELETE CASCADE,
  session_date DATE NOT NULL, title TEXT, notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.nouraniya_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.nouraniya_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'retard')),
  delay_minutes INTEGER, note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(session_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.nouraniya_grades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES public.nouraniya_groups(id) ON DELETE CASCADE,
  evaluation_date DATE NOT NULL,
  category TEXT NOT NULL DEFAULT 'global',
  score NUMERIC(4,1) NOT NULL, max_score NUMERIC(4,1) NOT NULL DEFAULT 20,
  comment TEXT, created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.parent_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_user_id, child_profile_id)
);

CREATE TABLE IF NOT EXISTS public.nouraniya_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL, read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_groups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_attendance TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_grades TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.parent_links TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.nouraniya_messages TO authenticated;
GRANT ALL ON public.nouraniya_groups TO service_role;
GRANT ALL ON public.nouraniya_enrollments TO service_role;
GRANT ALL ON public.nouraniya_sessions TO service_role;
GRANT ALL ON public.nouraniya_attendance TO service_role;
GRANT ALL ON public.nouraniya_grades TO service_role;
GRANT ALL ON public.parent_links TO service_role;
GRANT ALL ON public.nouraniya_messages TO service_role;

ALTER TABLE public.nouraniya_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nouraniya_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all_groups" ON public.nouraniya_groups FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());
CREATE POLICY "admin_all_enrollments" ON public.nouraniya_enrollments FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());
CREATE POLICY "admin_all_sessions" ON public.nouraniya_sessions FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());
CREATE POLICY "admin_all_attendance" ON public.nouraniya_attendance FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());
CREATE POLICY "admin_all_grades" ON public.nouraniya_grades FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());
CREATE POLICY "admin_all_parent_links" ON public.parent_links FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());
CREATE POLICY "admin_all_messages" ON public.nouraniya_messages FOR ALL TO authenticated
  USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());

CREATE POLICY "parent_read_own_link" ON public.parent_links FOR SELECT TO authenticated
  USING (parent_user_id = auth.uid());
CREATE POLICY "parent_read_child_attendance" ON public.nouraniya_attendance FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = nouraniya_attendance.student_id));
CREATE POLICY "parent_read_child_grades" ON public.nouraniya_grades FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = nouraniya_grades.student_id));
CREATE POLICY "parent_read_messages" ON public.nouraniya_messages FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = nouraniya_messages.student_id));
CREATE POLICY "parent_mark_read_messages" ON public.nouraniya_messages FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = nouraniya_messages.student_id))
  WITH CHECK (EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.parent_user_id = auth.uid() AND pl.child_profile_id = nouraniya_messages.student_id));
CREATE POLICY "parent_read_sessions" ON public.nouraniya_sessions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    JOIN public.nouraniya_enrollments ne ON ne.student_id = pl.child_profile_id
    WHERE pl.parent_user_id = auth.uid() AND ne.group_id = nouraniya_sessions.group_id
  ));
CREATE POLICY "parent_read_groups" ON public.nouraniya_groups FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.parent_links pl
    JOIN public.nouraniya_enrollments ne ON ne.student_id = pl.child_profile_id
    WHERE pl.parent_user_id = auth.uid() AND ne.group_id = nouraniya_groups.id
  ));