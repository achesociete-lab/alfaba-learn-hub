DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (user_id, first_name, last_name, level)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'given_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', u.raw_user_meta_data->>'family_name', ''),
  COALESCE(
    CASE
      WHEN (u.raw_user_meta_data->>'level') IN ('niveau_1', 'niveau_2') THEN (u.raw_user_meta_data->>'level')::public.class_level
      ELSE NULL
    END,
    'niveau_1'::public.class_level
  )
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

INSERT INTO public.subscriptions (user_id, plan, status)
SELECT u.id, 'découverte', 'active'
FROM auth.users u
LEFT JOIN public.subscriptions s
  ON s.user_id = u.id
 AND s.plan = 'découverte'
 AND s.status = 'active'
WHERE s.user_id IS NULL;