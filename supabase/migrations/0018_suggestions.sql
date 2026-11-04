-- Suggestion box: anyone can submit; you see your own, admins see all.
create table if not exists suggestions (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table suggestions enable row level security;

create policy "suggestions insert self" on suggestions for insert with check (author_id = auth.uid());
create policy "suggestions select own or admin" on suggestions for select using (author_id = auth.uid() or current_role_is('admin'));
create policy "suggestions delete admin" on suggestions for delete using (current_role_is('admin'));
