-- Ajoute audio_url à presentiel_courses pour upload de la voix du professeur
ALTER TABLE presentiel_courses ADD COLUMN IF NOT EXISTS audio_url TEXT;
