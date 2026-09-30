-- Reset invite for ache.societe@gmail.com that was prematurely marked used
UPDATE public.parent_invites
  SET used_at = NULL
  WHERE parent_email = 'ache.societe@gmail.com'
    AND used_at IS NOT NULL;

-- INSERT policy (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'parent_links' AND policyname = 'parent_insert_own_link'
  ) THEN
    EXECUTE 'CREATE POLICY "parent_insert_own_link" ON public.parent_links
      FOR INSERT WITH CHECK (parent_user_id = auth.uid())';
  END IF;
END $$;

-- Drop FK to profiles (direct students are not in profiles)
ALTER TABLE public.parent_links
  DROP CONSTRAINT IF EXISTS parent_links_child_profile_id_fkey;
