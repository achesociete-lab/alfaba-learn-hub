-- Add teacher-recorded audio URLs for each dictation word
ALTER TABLE presentiel_courses
  ADD COLUMN IF NOT EXISTS dictation_word_audios jsonb DEFAULT '[]'::jsonb;
