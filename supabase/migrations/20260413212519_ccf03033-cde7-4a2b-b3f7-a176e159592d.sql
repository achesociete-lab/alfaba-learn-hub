-- Create enum for recitation status
CREATE TYPE public.recitation_status AS ENUM ('en_attente', 'corrigée', 'a_refaire');

-- Add status column
ALTER TABLE public.quran_recitations
ADD COLUMN status public.recitation_status NOT NULL DEFAULT 'en_attente';

-- Set existing reviewed recitations to 'corrigée'
UPDATE public.quran_recitations SET status = 'corrigée' WHERE teacher_reviewed = true;