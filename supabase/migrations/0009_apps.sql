-- Apps recommended by parents for kids.
-- Run this in the Supabase SQL editor (or `supabase db push`) after 0008.

create table if not exists app_recommendations (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  name text not null,
  description text,
  url text,
  platform text,
  created_at timestamptz not null default now()
);

alter table app_recommendations enable row level security;

-- readable by all, any signed-in parent can add one (same shape as prayer_praise).
create policy "apps select all" on app_recommendations for select using (true);
create policy "apps insert self" on app_recommendations for insert with check (author_id = auth.uid());
create policy "apps update own or admin" on app_recommendations for update using (author_id = auth.uid() or current_role_is('admin'));
create policy "apps delete own or admin" on app_recommendations for delete using (author_id = auth.uid() or current_role_is('admin'));
