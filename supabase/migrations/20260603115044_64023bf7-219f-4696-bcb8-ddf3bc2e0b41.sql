ALTER TABLE public.presentiel_courses
  ADD COLUMN IF NOT EXISTS dictation_text text,
  ADD COLUMN IF NOT EXISTS dictation_word_audios jsonb NOT NULL DEFAULT '[]'::jsonb;