CREATE POLICY "Admin can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (is_admin_or_teacher())
WITH CHECK (is_admin_or_teacher());