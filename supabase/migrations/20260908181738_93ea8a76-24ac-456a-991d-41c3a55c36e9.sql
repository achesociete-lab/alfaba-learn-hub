CREATE TABLE public.hifz_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prenom text NOT NULL,
  niveau_arabe text NOT NULL,
  disponibilites text NOT NULL,
  contact text NOT NULL,
  message text,
  status text NOT NULL DEFAULT 'en_attente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.hifz_applications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.hifz_applications TO authenticated;
GRANT ALL ON public.hifz_applications TO service_role;

ALTER TABLE public.hifz_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
ON public.hifz_applications FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Staff can view applications"
ON public.hifz_applications FOR SELECT TO authenticated USING (public.is_admin_or_teacher());

CREATE POLICY "Staff can update applications"
ON public.hifz_applications FOR UPDATE TO authenticated USING (public.is_admin_or_teacher()) WITH CHECK (public.is_admin_or_teacher());

CREATE TRIGGER update_hifz_applications_updated_at
BEFORE UPDATE ON public.hifz_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();