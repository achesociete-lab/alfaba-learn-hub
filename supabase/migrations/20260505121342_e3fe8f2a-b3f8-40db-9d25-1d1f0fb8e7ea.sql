
-- 1) Backfill : assigner tous les cours existants aux élèves présentiel correspondants
INSERT INTO public.presentiel_course_assignments (course_id, user_id, assigned_by)
SELECT c.id, p.user_id, p.user_id
FROM public.presentiel_courses c
JOIN public.profiles p
  ON p.type_eleve = 'presentiel'
 AND p.level = c.level
WHERE NOT EXISTS (
  SELECT 1 FROM public.presentiel_course_assignments a
  WHERE a.course_id = c.id AND a.user_id = p.user_id
);

-- 2) Trigger : à la création d'un cours, l'assigner à tous les élèves présentiel du même niveau
CREATE OR REPLACE FUNCTION public.auto_assign_presentiel_course()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.presentiel_course_assignments (course_id, user_id, assigned_by)
  SELECT NEW.id, p.user_id, COALESCE(NEW.created_by, p.user_id)
  FROM public.profiles p
  WHERE p.type_eleve = 'presentiel'
    AND p.level = NEW.level
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_assign_presentiel_course ON public.presentiel_courses;
CREATE TRIGGER trg_auto_assign_presentiel_course
AFTER INSERT ON public.presentiel_courses
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_presentiel_course();

-- 3) Trigger : sur profil, quand l'élève devient présentiel ou change de niveau,
-- lui assigner tous les cours correspondants
CREATE OR REPLACE FUNCTION public.auto_assign_courses_to_presentiel_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type_eleve = 'presentiel' AND (
       TG_OP = 'INSERT'
       OR OLD.type_eleve IS DISTINCT FROM NEW.type_eleve
       OR OLD.level IS DISTINCT FROM NEW.level
  ) THEN
    INSERT INTO public.presentiel_course_assignments (course_id, user_id, assigned_by)
    SELECT c.id, NEW.user_id, NEW.user_id
    FROM public.presentiel_courses c
    WHERE c.level = NEW.level
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_assign_courses_to_presentiel_student ON public.profiles;
CREATE TRIGGER trg_auto_assign_courses_to_presentiel_student
AFTER INSERT OR UPDATE OF type_eleve, level ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.auto_assign_courses_to_presentiel_student();

-- 4) Contrainte d'unicité pour permettre ON CONFLICT DO NOTHING
CREATE UNIQUE INDEX IF NOT EXISTS uniq_presentiel_assignment
ON public.presentiel_course_assignments(course_id, user_id);
