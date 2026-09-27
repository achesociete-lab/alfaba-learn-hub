create table if not exists public.nouraniya_students (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  level text default 'debutant',
  notes text,
  profile_id uuid references public.profiles(user_id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.nouraniya_students enable row level security;

grant select, insert, update, delete on public.nouraniya_students to authenticated;
grant all on public.nouraniya_students to service_role;

create policy "nouraniya_students_admin_teacher_all"
  on public.nouraniya_students
  for all
  to authenticated
  using (public.is_admin_or_teacher())
  with check (public.is_admin_or_teacher());

create policy "nouraniya_students_select_own"
  on public.nouraniya_students
  for select
  to authenticated
  using (profile_id = auth.uid());

create policy "nouraniya_students_parent_read"
  on public.nouraniya_students
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.parent_links pl
      where pl.child_profile_id = nouraniya_students.profile_id
        and pl.parent_user_id = auth.uid()
    )
  );