-- Create enum for memorization status
CREATE TYPE public.memorization_status AS ENUM ('en_cours', 'mémorisée', 'à_réviser');

-- Create surah memorization tracking table
CREATE TABLE public.surah_memorization (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  status memorization_status NOT NULL DEFAULT 'en_cours',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, surah_number)
);

-- Enable RLS
ALTER TABLE public.surah_memorization ENABLE ROW LEVEL SECURITY;

-- Users can view their own memorization
CREATE POLICY "Users can view their own memorization"
ON public.surah_memorization FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own memorization
CREATE POLICY "Users can insert their own memorization"
ON public.surah_memorization FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own memorization
CREATE POLICY "Users can update their own memorization"
ON public.surah_memorization FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admin can view all
CREATE POLICY "Admin can view all memorization"
ON public.surah_memorization FOR SELECT
TO authenticated
USING (is_admin_or_teacher());

-- Trigger for updated_at
CREATE TRIGGER update_surah_memorization_updated_at
BEFORE UPDATE ON public.surah_memorization
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();