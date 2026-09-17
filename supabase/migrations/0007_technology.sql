-- Recommended apps/tools for parents.
-- Run this in the Supabase SQL editor (or `supabase db push`) after 0006.

create table if not exists tech_recommendations (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  name text not null,
  description text,
  url text,
  platform text,
  created_at timestamptz not null default now()
);

alter table tech_recommendations enable row level security;

-- readable by all, insert/update/delete by admins only (same shape as articles).
create policy "tech select all" on tech_recommendations for select using (true);
create policy "tech insert admin" on tech_recommendations for insert with check (current_role_is('admin'));
create policy "tech update admin" on tech_recommendations for update using (current_role_is('admin'));
create policy "tech delete admin" on tech_recommendations for delete using (current_role_is('admin'));
