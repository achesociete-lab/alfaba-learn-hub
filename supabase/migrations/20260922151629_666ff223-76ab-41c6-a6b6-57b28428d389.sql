CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM auth.users WHERE lower(auth.users.email) = lower(get_user_id_by_email.email)
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO authenticated;