UPDATE public.presentiel_courses
SET reorder_exercises = '[
  {"correct_order": ["هَلْ", "تَعْرِفُ", "فُصُولَ", "السَّنَةِ", "الْأَرْبَعَةَ"]},
  {"correct_order": ["لِكُلِّ", "فَصْلٍ", "جَمَالُهُ"]},
  {"correct_order": ["الرَّبِيعُ", "شَابُّ", "السَّنَةِ"]}
]'::jsonb
WHERE id = 'd1091443-94e2-4d8d-90c3-7b95230253a9'
  AND (reorder_exercises IS NULL OR jsonb_array_length(reorder_exercises::jsonb) = 0);