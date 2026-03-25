
-- Role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'teacher', 'student');

-- User roles table (roles MUST be in separate table)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: check if current user is admin or teacher
CREATE OR REPLACE FUNCTION public.is_admin_or_teacher()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin', 'teacher')
  )
$$;

-- RLS on user_roles: users can see their own roles, admins see all
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Admin/teacher can view ALL profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin_or_teacher());

-- Admin/teacher can view ALL homework
CREATE POLICY "Admin can view all homework"
  ON public.homework_submissions FOR SELECT
  USING (public.is_admin_or_teacher());

-- Admin/teacher can UPDATE homework (for grading)
CREATE POLICY "Admin can update homework"
  ON public.homework_submissions FOR UPDATE
  USING (public.is_admin_or_teacher());

-- Admin/teacher can view ALL attendance
CREATE POLICY "Admin can view all attendance"
  ON public.attendance FOR SELECT
  USING (public.is_admin_or_teacher());

-- Admin/teacher can INSERT attendance
CREATE POLICY "Admin can insert attendance"
  ON public.attendance FOR INSERT
  WITH CHECK (public.is_admin_or_teacher());

-- Admin/teacher can UPDATE attendance
CREATE POLICY "Admin can update attendance"
  ON public.attendance FOR UPDATE
  USING (public.is_admin_or_teacher());

-- Admin can view homework files
CREATE POLICY "Admin can view all homework files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'homework' AND public.is_admin_or_teacher());
