CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  meta jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  v_first text;
  v_last text;
  v_avatar text;
  v_full text;
  v_parts text[];
  v_type public.student_type := 'en_ligne'::public.student_type;
BEGIN
  v_first := COALESCE(NULLIF(meta->>'first_name',''), NULLIF(meta->>'given_name',''));
  v_last := COALESCE(NULLIF(meta->>'last_name',''), NULLIF(meta->>'family_name',''));
  v_avatar := COALESCE(NULLIF(meta->>'avatar_url',''), NULLIF(meta->>'picture',''));

  IF (v_first IS NULL OR v_last IS NULL) THEN
    v_full := COALESCE(NULLIF(meta->>'full_name',''), NULLIF(meta->>'name',''));
    IF v_full IS NOT NULL THEN
      v_parts := regexp_split_to_array(trim(v_full), '\s+');
      IF v_first IS NULL AND array_length(v_parts,1) >= 1 THEN
        v_first := v_parts[1];
      END IF;
      IF v_last IS NULL AND array_length(v_parts,1) >= 2 THEN
        v_last := array_to_string(v_parts[2:array_length(v_parts,1)], ' ');
      END IF;
    END IF;
  END IF;

  -- Detect presentiel signup from metadata flags
  IF COALESCE((meta->>'pending_presentiel')::boolean, false) = true
     OR meta->>'type_eleve' = 'presentiel'
     OR meta->>'signup_source' = 'presentiel' THEN
    v_type := 'presentiel'::public.student_type;
  END IF;

  INSERT INTO public.profiles (user_id, first_name, last_name, level, avatar_url, type_eleve)
  VALUES (
    NEW.id,
    COALESCE(v_first, ''),
    COALESCE(v_last, ''),
    COALESCE((meta->>'level')::class_level, 'niveau_1'),
    v_avatar,
    v_type
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'découverte', 'active');

  RETURN NEW;
END;
$function$;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();