-- Storage bucket + RLS for profile avatar photos (biography page upload).
-- No prior migration ever created this bucket or its policies, so
-- uploadPhoto() in app/(app)/biography/actions.ts has always failed at the
-- storage.upload() call, leaving profiles.photo_path stuck at null.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

create policy "avatars select authenticated" on storage.objects
  for select using (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "avatars insert own or admin" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or current_role_is('admin'))
  );

create policy "avatars update own or admin" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and ((storage.foldername(name))[1] = auth.uid()::text or current_role_is('admin'))
  );
