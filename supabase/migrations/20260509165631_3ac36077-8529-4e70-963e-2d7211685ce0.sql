-- Add 'lecture' step type, allow audio submissions
ALTER TYPE public.presentiel_step_type ADD VALUE IF NOT EXISTS 'lecture';
ALTER TABLE public.presentiel_submissions ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.presentiel_submissions ALTER COLUMN photo_url DROP NOT NULL;