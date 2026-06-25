-- Allow admins/teachers to insert subscriptions for any student (needed for "Activer accès Hifd")
CREATE POLICY "Admin can insert subscriptions"
ON public.subscriptions FOR INSERT
WITH CHECK (is_admin_or_teacher());
