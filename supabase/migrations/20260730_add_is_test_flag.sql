-- Add is_test flag to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_test BOOLEAN DEFAULT FALSE;

-- Mark Abdelkrim Housni's account as test
UPDATE public.profiles
SET is_test = TRUE
WHERE first_name = 'Abdelkrim' AND last_name = 'Housni';

-- Create index for faster filtering
CREATE INDEX idx_profiles_is_test ON public.profiles(is_test);
