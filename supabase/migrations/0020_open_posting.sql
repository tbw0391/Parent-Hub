-- Every parent can post articles, technology recommendations, and polls.
-- Authors manage their own posts; admins can manage anyone's.

drop policy if exists "articles insert admin" on articles;
drop policy if exists "articles update admin" on articles;
drop policy if exists "articles delete admin" on articles;
create policy "articles insert self" on articles for insert with check (author_id = auth.uid());
create policy "articles update own or admin" on articles for update using (author_id = auth.uid() or current_role_is('admin'));
create policy "articles delete own or admin" on articles for delete using (author_id = auth.uid() or current_role_is('admin'));

drop policy if exists "tech insert admin" on tech_recommendations;
drop policy if exists "tech update admin" on tech_recommendations;
drop policy if exists "tech delete admin" on tech_recommendations;
create policy "tech insert self" on tech_recommendations for insert with check (author_id = auth.uid());
create policy "tech update own or admin" on tech_recommendations for update using (author_id = auth.uid() or current_role_is('admin'));
create policy "tech delete own or admin" on tech_recommendations for delete using (author_id = auth.uid() or current_role_is('admin'));

drop policy if exists "polls insert power_user" on polls;
create policy "polls insert self" on polls for insert with check (author_id = auth.uid());

drop policy if exists "poll_options insert power_user" on poll_options;
create policy "poll_options insert poll author" on poll_options for insert with check (
  exists (select 1 from polls p where p.id = poll_options.poll_id and p.author_id = auth.uid())
);
