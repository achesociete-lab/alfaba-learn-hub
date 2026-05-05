CREATE OR REPLACE FUNCTION public.auto_assign_courses_to_presentiel_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.type_eleve = 'presentiel' AND (
       TG_OP = 'INSERT'
       OR OLD.type_eleve IS DISTINCT FROM NEW.type_eleve
       OR OLD.level IS DISTINCT FROM NEW.level
  ) THEN
    -- Retire les assignations qui ne correspondent plus au niveau
    DELETE FROM public.presentiel_course_assignments a
    USING public.presentiel_courses c
    WHERE a.user_id = NEW.user_id
      AND a.course_id = c.id
      AND c.level <> NEW.level;

    -- Assigne tous les cours du niveau actuel
    INSERT INTO public.presentiel_course_assignments (course_id, user_id, assigned_by)
    SELECT c.id, NEW.user_id, NEW.user_id
    FROM public.presentiel_courses c
    WHERE c.level = NEW.level
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$function$;

-- Nettoyage immédiat : supprime les assignations existantes qui ne correspondent pas au niveau
DELETE FROM public.presentiel_course_assignments a
USING public.presentiel_courses c, public.profiles p
WHERE a.course_id = c.id
  AND a.user_id = p.user_id
  AND p.type_eleve = 'presentiel'
  AND c.level <> p.level;

-- Ré-assigne tous les cours du bon niveau aux élèves présentiel
INSERT INTO public.presentiel_course_assignments (course_id, user_id, assigned_by)
SELECT c.id, p.user_id, p.user_id
FROM public.presentiel_courses c
JOIN public.profiles p ON p.type_eleve = 'presentiel' AND p.level = c.level
ON CONFLICT DO NOTHING;