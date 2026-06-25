-- Replace family_members (invite system) with family_profiles (Kartable model)
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

ALTER TABLE public.family_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner manages own profiles"
ON public.family_profiles
USING (owner_id = auth.uid());

CREATE POLICY "Owner inserts profiles"
ON public.family_profiles FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owner deletes profiles"
ON public.family_profiles FOR DELETE
USING (owner_id = auth.uid());

CREATE POLICY "Admin sees all profiles"
ON public.family_profiles FOR ALL
USING (is_admin_or_teacher());

-- Allow family owner to read/write lesson_progress for their child profiles
CREATE POLICY "Family owner manages child lesson progress"
ON public.lesson_progress
USING (
  user_id IN (SELECT id FROM public.family_profiles WHERE owner_id = auth.uid())
)
WITH CHECK (
  user_id IN (SELECT id FROM public.family_profiles WHERE owner_id = auth.uid())
);

-- Allow family owner to read/write tutor_progress for their child profiles
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tutor_progress') THEN
    EXECUTE $policy$
      CREATE POLICY "Family owner manages child tutor progress"
      ON public.tutor_progress
      USING (user_id IN (SELECT id FROM public.family_profiles WHERE owner_id = auth.uid()))
      WITH CHECK (user_id IN (SELECT id FROM public.family_profiles WHERE owner_id = auth.uid()));
    $policy$;
  END IF;
END $$;
