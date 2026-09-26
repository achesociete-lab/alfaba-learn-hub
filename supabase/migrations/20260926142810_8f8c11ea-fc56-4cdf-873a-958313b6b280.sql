create table if not exists public.parent_invites (
  id uuid default gen_random_uuid() primary key,
  token uuid default gen_random_uuid() unique not null,
  parent_email text not null,
  child_profile_id uuid not null,
  child_name text not null,
  admin_note text,
  used_at timestamptz,
  expires_at timestamptz default (now() + interval '30 days'),
  created_at timestamptz default now()
);
grant select, insert, update, delete on public.parent_invites to authenticated;
grant all on public.parent_invites to service_role;
alter table public.parent_invites enable row level security;

create policy "Admins and teachers manage invites" on public.parent_invites
  for all to authenticated using (public.is_admin_or_teacher()) with check (public.is_admin_or_teacher());

create or replace function public.get_parent_invite(_token uuid)
returns table(token uuid, parent_email text, child_name text, used_at timestamptz, expires_at timestamptz)
language sql stable security definer set search_path = public as $$
  select token, parent_email, child_name, used_at, expires_at from public.parent_invites where token = _token limit 1;
$$;
grant execute on function public.get_parent_invite(uuid) to anon, authenticated;

create or replace function public.accept_parent_invite(_token uuid)
returns boolean language plpgsql security definer set search_path = public as $$
declare inv public.parent_invites;
begin
  if auth.uid() is null then return false; end if;
  select * into inv from public.parent_invites where token = _token for update;
  if not found or inv.used_at is not null or (inv.expires_at is not null and inv.expires_at < now()) then return false; end if;
  insert into public.parent_links (parent_user_id, child_profile_id)
  select auth.uid(), inv.child_profile_id
  where not exists (select 1 from public.parent_links where parent_user_id = auth.uid() and child_profile_id = inv.child_profile_id);
  update public.parent_invites set used_at = now() where id = inv.id;
  return true;
end; $$;
revoke execute on function public.accept_parent_invite(uuid) from public, anon;
grant execute on function public.accept_parent_invite(uuid) to authenticated;