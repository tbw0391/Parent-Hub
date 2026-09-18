-- Let power_users (not just admins) delete app recommendations, same as authors already could.
drop policy if exists "apps delete own or admin" on app_recommendations;
create policy "apps delete own or power_user" on app_recommendations for delete
  using (author_id = auth.uid() or current_role_is('power_user'));
