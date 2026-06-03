-- Dictée niveau 2 : texte complet + enregistrements audio par phrase
ALTER TABLE presentiel_courses
  ADD COLUMN IF NOT EXISTS dictation_text text,
  ADD COLUMN IF NOT EXISTS dictation_sentence_audios jsonb DEFAULT '[]'::jsonb;
