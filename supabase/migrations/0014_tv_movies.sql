-- TV shows / movies recommended by parents, with streaming availability
-- looked up automatically from TMDB at post time.
create table if not exists tv_movie_recommendations (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  title text not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  poster_path text,
  providers text[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table tv_movie_recommendations enable row level security;

create policy "tv_movies select all" on tv_movie_recommendations for select using (true);
create policy "tv_movies insert self" on tv_movie_recommendations for insert with check (author_id = auth.uid());
create policy "tv_movies delete own or power_user" on tv_movie_recommendations for delete
  using (author_id = auth.uid() or current_role_is('power_user'));
