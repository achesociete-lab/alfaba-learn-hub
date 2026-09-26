create table if not exists parent_invites (
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

alter table parent_invites enable row level security;

create policy "Anyone can read invite by token"
  on parent_invites for select using (true);

create policy "Authenticated users can insert invites"
  on parent_invites for insert with check (auth.role() = 'authenticated');

create policy "Authenticated users can update invites"
  on parent_invites for update using (auth.role() = 'authenticated');
