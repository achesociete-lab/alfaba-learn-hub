ALTER TABLE hifz_sessions
  ADD COLUMN IF NOT EXISTS reschedule_initiated_by text; -- 'eleve' | 'professeur'
