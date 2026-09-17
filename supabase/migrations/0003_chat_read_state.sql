-- Track per-member read state so we can show an unread-message badge.
-- Run this in the Supabase SQL editor after 0002_family_details.sql.

alter table chat_group_members
  add column if not exists last_read_at timestamptz not null default now();

create policy "chat_members update self" on chat_group_members for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
