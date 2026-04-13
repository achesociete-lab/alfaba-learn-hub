-- Create enum for student type
CREATE TYPE public.student_type AS ENUM ('en_ligne', 'presentiel');

-- Add column to profiles
ALTER TABLE public.profiles
ADD COLUMN type_eleve public.student_type NOT NULL DEFAULT 'en_ligne';