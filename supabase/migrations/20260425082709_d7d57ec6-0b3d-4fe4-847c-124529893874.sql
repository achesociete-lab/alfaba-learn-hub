
-- Table tutor_sessions
CREATE TABLE public.tutor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  summary TEXT,
  weak_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  strong_points JSONB NOT NULL DEFAULT '[]'::jsonb,
  score NUMERIC,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own sessions" ON public.tutor_sessions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own sessions" ON public.tutor_sessions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own sessions" ON public.tutor_sessions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all sessions" ON public.tutor_sessions
  FOR SELECT TO authenticated USING (is_admin_or_teacher());
CREATE POLICY "Service role manages sessions" ON public.tutor_sessions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Table tutor_homework
CREATE TABLE public.tutor_homework (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID REFERENCES public.tutor_sessions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  due_date DATE,
  submission JSONB,
  score NUMERIC,
  feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','corrected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_homework ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own homework" ON public.tutor_homework
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own homework" ON public.tutor_homework
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all homework" ON public.tutor_homework
  FOR SELECT TO authenticated USING (is_admin_or_teacher());
CREATE POLICY "Service role manages homework" ON public.tutor_homework
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_tutor_homework_updated_at
  BEFORE UPDATE ON public.tutor_homework
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table tutor_progress
CREATE TABLE public.tutor_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level TEXT NOT NULL DEFAULT 'niveau_1',
  lessons_completed JSONB NOT NULL DEFAULT '[]'::jsonb,
  weak_letters JSONB NOT NULL DEFAULT '[]'::jsonb,
  strong_letters JSONB NOT NULL DEFAULT '[]'::jsonb,
  weekly_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC NOT NULL DEFAULT 0,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_session_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tutor_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own progress" ON public.tutor_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own progress" ON public.tutor_progress
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own progress" ON public.tutor_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all progress" ON public.tutor_progress
  FOR SELECT TO authenticated USING (is_admin_or_teacher());
CREATE POLICY "Service role manages progress" ON public.tutor_progress
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_tutor_progress_updated_at
  BEFORE UPDATE ON public.tutor_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Table tutor_reports
CREATE TABLE public.tutor_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  sessions_count INTEGER NOT NULL DEFAULT 0,
  average_score NUMERIC NOT NULL DEFAULT 0,
  progress_summary TEXT,
  recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
  sent_by_email BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.tutor_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own reports" ON public.tutor_reports
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all reports" ON public.tutor_reports
  FOR SELECT TO authenticated USING (is_admin_or_teacher());
CREATE POLICY "Service role manages reports" ON public.tutor_reports
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_tutor_sessions_user ON public.tutor_sessions(user_id, started_at DESC);
CREATE INDEX idx_tutor_homework_user ON public.tutor_homework(user_id, status, created_at DESC);
CREATE INDEX idx_tutor_reports_user ON public.tutor_reports(user_id, week_start DESC);
