-- Allow parents to insert their own parent_links
-- Needed so ParentInviteActivator can activate invites from the client
CREATE POLICY IF NOT EXISTS "parent_insert_own_link" ON public.parent_links
  FOR INSERT WITH CHECK (parent_user_id = auth.uid());

-- Drop FK constraint: child_profile_id was requiring a profiles(user_id) entry.
-- Direct Nouraniya students live in nouraniya_students, not in profiles,
-- so this constraint silently blocked all invites for direct students.
ALTER TABLE public.parent_links
  DROP CONSTRAINT IF EXISTS parent_links_child_profile_id_fkey;
