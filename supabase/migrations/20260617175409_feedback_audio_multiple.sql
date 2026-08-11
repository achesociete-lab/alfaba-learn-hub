-- Support multiple voice corrections per submission
ALTER TABLE public.presentiel_submissions
  ADD COLUMN IF NOT EXISTS feedback_audio_urls jsonb NOT NULL DEFAULT '[]'::jsonb;
