CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invite_email TEXT NOT NULL,
  invite_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active')),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX family_members_owner_idx   ON public.family_members(owner_id);
CREATE INDEX family_members_member_idx  ON public.family_members(member_id);
CREATE INDEX family_members_token_idx   ON public.family_members(invite_token);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- Owner sees his family, member sees the row he belongs to
CREATE POLICY "Family members visibility"
ON public.family_members FOR SELECT
USING (owner_id = auth.uid() OR member_id = auth.uid());

-- Only owner can invite (insert)
CREATE POLICY "Owner can invite members"
ON public.family_members FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- Owner can remove a member
CREATE POLICY "Owner can delete members"
ON public.family_members FOR DELETE
USING (owner_id = auth.uid());

-- Admin sees everything
CREATE POLICY "Admin full access"
ON public.family_members FOR ALL
USING (is_admin_or_teacher());
