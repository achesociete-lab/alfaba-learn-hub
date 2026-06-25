DROP TABLE IF EXISTS public.family_members CASCADE;

CREATE TABLE public.family_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT '🧒',
  level TEXT NOT NULL DEFAULT 'niveau_1' CHECK (level IN ('niveau_1', 'niveau_2')),
  pin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX family_profiles_owner_idx ON public.family_profiles(owner_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.family_profiles TO authenticated;
GRANT ALL ON public.family_profiles TO service_role;

ALTER TABLE public.family_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own profiles" ON public.family_profiles
  FOR ALL USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admin sees all profiles" ON public.family_profiles
  FOR ALL USING (is_admin_or_teacher()) WITH CHECK (is_admin_or_teacher());

CREATE POLICY "Family owner manages child lesson progress" ON public.lesson_progress
  FOR ALL
  USING (user_id IN (SELECT id FROM public.family_profiles WHERE owner_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM public.family_profiles WHERE owner_id = auth.uid()));
