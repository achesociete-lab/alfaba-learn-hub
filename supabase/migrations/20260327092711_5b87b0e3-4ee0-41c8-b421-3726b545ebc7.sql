
-- Create table for storing Quran recitation recordings and AI evaluations
CREATE TABLE public.quran_recitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surah_number INTEGER NOT NULL,
  ayah_start INTEGER NOT NULL DEFAULT 1,
  ayah_end INTEGER NOT NULL DEFAULT 1,
  audio_url TEXT,
  transcription TEXT,
  ai_feedback JSONB DEFAULT '{}'::jsonb,
  score NUMERIC(5,2),
  teacher_feedback TEXT,
  teacher_reviewed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quran_recitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own recitations" ON public.quran_recitations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own recitations" ON public.quran_recitations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admin can view all recitations" ON public.quran_recitations
  FOR SELECT TO authenticated USING (is_admin_or_teacher());

CREATE POLICY "Admin can update recitations" ON public.quran_recitations
  FOR UPDATE TO authenticated USING (is_admin_or_teacher());

-- Create table for vocal fingerprint
CREATE TABLE public.vocal_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  reference_audio_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vocal_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own vocal profile" ON public.vocal_profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all vocal profiles" ON public.vocal_profiles
  FOR SELECT TO authenticated USING (is_admin_or_teacher());
