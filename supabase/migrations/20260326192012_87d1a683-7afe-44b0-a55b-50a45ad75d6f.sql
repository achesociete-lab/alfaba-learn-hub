
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  level public.class_level NOT NULL,
  lesson_number integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (level, lesson_number)
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Everyone can read lessons
CREATE POLICY "Anyone can view lessons"
  ON public.lessons FOR SELECT
  TO public
  USING (true);

-- Only admin/teacher can insert
CREATE POLICY "Admin can insert lessons"
  ON public.lessons FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_teacher());

-- Only admin/teacher can update
CREATE POLICY "Admin can update lessons"
  ON public.lessons FOR UPDATE
  TO authenticated
  USING (is_admin_or_teacher());

-- Only admin/teacher can delete
CREATE POLICY "Admin can delete lessons"
  ON public.lessons FOR DELETE
  TO authenticated
  USING (is_admin_or_teacher());

-- Trigger for updated_at
CREATE TRIGGER update_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
