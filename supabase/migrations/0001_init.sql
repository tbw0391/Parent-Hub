-- Parent Hub schema + row level security
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null default 'parent' check (role in ('parent', 'power_user', 'admin')),
  created_at timestamptz not null default now()
);

-- auto-create a profile row whenever a new auth user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- helper: current user's role
create or replace function current_role_is(target text)
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and (
        (target = 'power_user' and role in ('power_user', 'admin'))
        or (target = 'admin' and role = 'admin')
        or (target = 'parent')
      )
  );
$$ language sql security definer stable;

-- ---------- content tables ----------
create table if not exists articles (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  title text not null,
  body_richtext text not null,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists schedule_events (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  title text not null,
  description text,
  starts_at timestamptz not null,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists lessons (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  title text not null,
  description text,
  attachment_url text,
  attachment_type text,
  created_at timestamptz not null default now()
);

create table if not exists prayer_praise (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  kind text not null check (kind in ('prayer', 'praise')),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists polls (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references profiles (id),
  question text not null,
  created_at timestamptz not null default now()
);

create table if not exists poll_options (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references polls (id) on delete cascade,
  label text not null,
  position int not null default 0
);

create table if not exists poll_votes (
  id uuid primary key default uuid_generate_v4(),
  poll_id uuid not null references polls (id) on delete cascade,
  option_id uuid not null references poll_options (id) on delete cascade,
  voter_id uuid not null references profiles (id),
  created_at timestamptz not null default now(),
  unique (poll_id, voter_id)
);

-- ---------- chat ----------
create table if not exists chat_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  is_dm boolean not null default false,
  created_by uuid not null references profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists chat_group_members (
  group_id uuid not null references chat_groups (id) on delete cascade,
  user_id uuid not null references profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists messages (
  id uuid primary key default uuid_generate_v4(),
  group_id uuid not null references chat_groups (id) on delete cascade,
  sender_id uuid not null references profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_group_created_idx on messages (group_id, created_at);

-- ---------- row level security ----------
alter table profiles enable row level security;
alter table articles enable row level security;
alter table schedule_events enable row level security;
alter table lessons enable row level security;
alter table prayer_praise enable row level security;
alter table polls enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;
alter table chat_groups enable row level security;
alter table chat_group_members enable row level security;
alter table messages enable row level security;

-- profiles: everyone can read all profiles (needed to pick chat members / show names);
-- only the row owner can update their own display_name (role changes happen via table editor).
create policy "profiles select all" on profiles for select using (true);
create policy "profiles update self" on profiles for update using (id = auth.uid())
  with check (id = auth.uid());

-- articles: readable by all, insert/update/delete by admins only
create policy "articles select all" on articles for select using (true);
create policy "articles insert admin" on articles for insert with check (current_role_is('admin'));
create policy "articles update admin" on articles for update using (current_role_is('admin'));
create policy "articles delete admin" on articles for delete using (current_role_is('admin'));

-- schedule: readable by all, insert/update/delete by admins only
create policy "schedule select all" on schedule_events for select using (true);
create policy "schedule insert admin" on schedule_events for insert with check (current_role_is('admin'));
create policy "schedule update admin" on schedule_events for update using (current_role_is('admin'));
create policy "schedule delete admin" on schedule_events for delete using (current_role_is('admin'));

-- lessons: readable by all, insert by power_user+admin
create policy "lessons select all" on lessons for select using (true);
create policy "lessons insert power_user" on lessons for insert with check (current_role_is('power_user'));
create policy "lessons update own or admin" on lessons for update using (author_id = auth.uid() or current_role_is('admin'));
create policy "lessons delete own or admin" on lessons for delete using (author_id = auth.uid() or current_role_is('admin'));

-- prayer & praise: readable by all, any signed-in parent can post their own
create policy "prayer select all" on prayer_praise for select using (true);
create policy "prayer insert self" on prayer_praise for insert with check (author_id = auth.uid());
create policy "prayer delete own or admin" on prayer_praise for delete using (author_id = auth.uid() or current_role_is('admin'));

-- polls: readable by all, insert by power_user+admin
create policy "polls select all" on polls for select using (true);
create policy "polls insert power_user" on polls for insert with check (current_role_is('power_user'));
create policy "poll_options select all" on poll_options for select using (true);
create policy "poll_options insert power_user" on poll_options for insert with check (current_role_is('power_user'));

-- poll votes: anyone can see aggregate votes, anyone can cast their own vote once
create policy "poll_votes select all" on poll_votes for select using (true);
create policy "poll_votes insert self" on poll_votes for insert with check (voter_id = auth.uid());
create policy "poll_votes update self" on poll_votes for update using (voter_id = auth.uid())
  with check (voter_id = auth.uid());

-- chat groups: a user can create a group, and can only see groups they belong to
create policy "chat_groups select member" on chat_groups for select using (
  exists (select 1 from chat_group_members m where m.group_id = id and m.user_id = auth.uid())
);
create policy "chat_groups insert self" on chat_groups for insert with check (created_by = auth.uid());

-- chat members: visible to other members of the same group; a user can add rows for a group they belong to
create policy "chat_members select fellow member" on chat_group_members for select using (
  exists (select 1 from chat_group_members m2 where m2.group_id = chat_group_members.group_id and m2.user_id = auth.uid())
);
create policy "chat_members insert by member or creator" on chat_group_members for insert with check (
  user_id = auth.uid()
  or exists (select 1 from chat_groups g where g.id = group_id and g.created_by = auth.uid())
);

-- messages: only members of a group can read/write its messages
create policy "messages select member" on messages for select using (
  exists (select 1 from chat_group_members m where m.group_id = messages.group_id and m.user_id = auth.uid())
);
create policy "messages insert member" on messages for insert with check (
  sender_id = auth.uid()
  and exists (select 1 from chat_group_members m where m.group_id = messages.group_id and m.user_id = auth.uid())
);

-- ---------- realtime ----------
alter publication supabase_realtime add table messages;
