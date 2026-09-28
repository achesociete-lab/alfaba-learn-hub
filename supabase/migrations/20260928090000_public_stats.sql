-- Fonction publique pour les stats agrégées (sans exposer les données individuelles)
create or replace function get_public_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
begin
  return json_build_object(
    'student_count', (select count(*) from profiles),
    'lesson_count', 28,
    'level_count', 2
  );
end;
$$;

grant execute on function get_public_stats() to anon, authenticated;
