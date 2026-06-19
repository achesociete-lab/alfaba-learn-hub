CREATE POLICY "Admin can insert subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_teacher());