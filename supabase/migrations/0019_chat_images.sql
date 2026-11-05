-- Photos in chat. Images live in the private chat-images bucket under
-- <group_id>/<sender_id>/<file>; only members of that group can see them.
alter table messages add column if not exists image_path text;
alter table messages alter column body set default '';

insert into storage.buckets (id, name, public)
values ('chat-images', 'chat-images', false)
on conflict (id) do nothing;

create policy "chat-images select member" on storage.objects
  for select using (
    bucket_id = 'chat-images'
    and exists (
      select 1 from chat_group_members m
      where m.group_id::text = (storage.foldername(name))[1] and m.user_id = auth.uid()
    )
  );

create policy "chat-images insert own in member group" on storage.objects
  for insert with check (
    bucket_id = 'chat-images'
    and (storage.foldername(name))[2] = auth.uid()::text
    and exists (
      select 1 from chat_group_members m
      where m.group_id::text = (storage.foldername(name))[1] and m.user_id = auth.uid()
    )
  );
