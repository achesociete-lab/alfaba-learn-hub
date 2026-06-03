ALTER TABLE hifz_evaluations
  ADD COLUMN IF NOT EXISTS surah_start  int,
  ADD COLUMN IF NOT EXISTS verse_start  int,
  ADD COLUMN IF NOT EXISTS surah_end    int,
  ADD COLUMN IF NOT EXISTS verse_end    int,
  ADD COLUMN IF NOT EXISTS page_start   int,
  ADD COLUMN IF NOT EXISTS page_end     int;
