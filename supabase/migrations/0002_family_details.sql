-- Extended parent/family details: contact info, spouse link, kids.
-- Run this in the Supabase SQL editor after 0001_init.sql.

alter table profiles
  add column if not exists phone text,
  add column if not exists address text,
  add column if not exists anniversary date,
  add column if not exists spouse_id uuid references profiles (id);

create table if not exists children (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references profiles (id) on delete cascade,
  name text not null,
  birth_date date not null,
  created_at timestamptz not null default now()
);

alter table children enable row level security;

create policy "children select all" on children for select using (true);
create policy "children insert self or admin" on children for insert with check (
  parent_id = auth.uid() or current_role_is('admin')
);
create policy "children update self or admin" on children for update using (
  parent_id = auth.uid() or current_role_is('admin')
);
create policy "children delete self or admin" on children for delete using (
  parent_id = auth.uid() or current_role_is('admin')
);

-- profiles previously only allowed self-updates; admins need to edit anyone's row too.
create policy "profiles update admin" on profiles for update using (current_role_is('admin'));
