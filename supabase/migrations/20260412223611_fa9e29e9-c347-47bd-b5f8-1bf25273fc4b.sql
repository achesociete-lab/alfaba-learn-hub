CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'level')::class_level, 'niveau_1')
  );

  -- Create default subscription (découverte / free plan)
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'découverte', 'active');

  RETURN NEW;
END;
$$;