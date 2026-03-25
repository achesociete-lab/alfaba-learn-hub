
CREATE TABLE public.homework_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level public.class_level NOT NULL,
  due_date DATE,
  file_url TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.homework_assignments ENABLE ROW LEVEL SECURITY;

-- Teachers can manage assignments
CREATE POLICY "Teachers can insert assignments"
  ON public.homework_assignments FOR INSERT
  WITH CHECK (public.is_admin_or_teacher());

CREATE POLICY "Teachers can update assignments"
  ON public.homework_assignments FOR UPDATE
  USING (public.is_admin_or_teacher());

CREATE POLICY "Teachers can delete assignments"
  ON public.homework_assignments FOR DELETE
  USING (public.is_admin_or_teacher());

-- Everyone authenticated can view assignments
CREATE POLICY "Authenticated users can view assignments"
  ON public.homework_assignments FOR SELECT
  USING (auth.uid() IS NOT NULL);
