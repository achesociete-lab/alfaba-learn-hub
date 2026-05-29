-- ============================================================
-- Table 1 : hifz_config (Configuration Hifz de l'élève)
-- ============================================================
CREATE TABLE public.hifz_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  hizb_already_memo INTEGER DEFAULT 0,
  duration_months INTEGER DEFAULT 16,
  start_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_config TO authenticated;
GRANT ALL ON public.hifz_config TO service_role;

ALTER TABLE public.hifz_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eleves voient leur propre config" 
ON public.hifz_config 
FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Eleves modifient leur propre config" 
ON public.hifz_config 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Eleves creent leur propre config" 
ON public.hifz_config 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Eleves suppriment leur propre config" 
ON public.hifz_config 
FOR DELETE 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Admins voient toutes les configs" 
ON public.hifz_config 
FOR SELECT 
TO authenticated 
USING (public.is_admin_or_teacher());

-- ============================================================
-- Table 2 : hifz_sessions (Séances de révision)
-- ============================================================
CREATE TABLE public.hifz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  status TEXT DEFAULT 'en_attente' CHECK (status IN ('en_attente', 'confirmee', 'annulee', 'effectuee')),
  meet_link TEXT,
  notes_eleve TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_sessions TO authenticated;
GRANT ALL ON public.hifz_sessions TO service_role;

ALTER TABLE public.hifz_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eleves voient leurs propres sessions" 
ON public.hifz_sessions 
FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Eleves creent leurs propres sessions" 
ON public.hifz_sessions 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Admins voient toutes les sessions" 
ON public.hifz_sessions 
FOR SELECT 
TO authenticated 
USING (public.is_admin_or_teacher());

CREATE POLICY "Admins gerent toutes les sessions" 
ON public.hifz_sessions 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_teacher())
WITH CHECK (public.is_admin_or_teacher());

-- ============================================================
-- Table 3 : hifz_evaluations (Évaluations par hizb)
-- ============================================================
CREATE TABLE public.hifz_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.hifz_sessions(id),
  student_id UUID REFERENCES auth.users(id) NOT NULL,
  hizb_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('valide', 'a_retravailler')),
  niveau TEXT CHECK (niveau IN ('mediocre', 'moyen', 'bon', 'excellent')),
  notes TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  teacher_id UUID REFERENCES auth.users(id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.hifz_evaluations TO authenticated;
GRANT ALL ON public.hifz_evaluations TO service_role;

ALTER TABLE public.hifz_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eleves voient leurs propres evaluations" 
ON public.hifz_evaluations 
FOR SELECT 
TO authenticated 
USING (auth.uid() = student_id);

CREATE POLICY "Admins voient toutes les evaluations" 
ON public.hifz_evaluations 
FOR SELECT 
TO authenticated 
USING (public.is_admin_or_teacher());

CREATE POLICY "Admins gerent toutes les evaluations" 
ON public.hifz_evaluations 
FOR ALL 
TO authenticated 
USING (public.is_admin_or_teacher())
WITH CHECK (public.is_admin_or_teacher());

-- Index pour accélérer les requêtes
CREATE INDEX idx_hifz_config_student_id ON public.hifz_config(student_id);
CREATE INDEX idx_hifz_sessions_student_id ON public.hifz_sessions(student_id);
CREATE INDEX idx_hifz_sessions_date ON public.hifz_sessions(session_date);
CREATE INDEX idx_hifz_evaluations_student_id ON public.hifz_evaluations(student_id);
CREATE INDEX idx_hifz_evaluations_session_id ON public.hifz_evaluations(session_id);
