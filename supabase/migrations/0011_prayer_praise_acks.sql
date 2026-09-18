-- Tracks which prayer/praise entries a user has dismissed from the banner.
create table if not exists prayer_praise_acks (
  id uuid primary key default uuid_generate_v4(),
  entry_id uuid not null references prayer_praise (id) on delete cascade,
  user_id uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  unique (entry_id, user_id)
);

alter table prayer_praise_acks enable row level security;

create policy "prayer_praise_acks select self" on prayer_praise_acks for select using (user_id = auth.uid());
create policy "prayer_praise_acks insert self" on prayer_praise_acks for insert with check (user_id = auth.uid());
