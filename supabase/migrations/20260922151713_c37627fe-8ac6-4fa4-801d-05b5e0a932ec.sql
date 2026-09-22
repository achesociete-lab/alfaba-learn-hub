CREATE OR REPLACE FUNCTION public.get_user_id_by_email(email TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM auth.users
  WHERE lower(auth.users.email) = lower(get_user_id_by_email.email)
    AND (
      auth.role() = 'service_role'
      OR public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'teacher')
    )
  LIMIT 1;
$$;

REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_id_by_email(TEXT) TO service_role;