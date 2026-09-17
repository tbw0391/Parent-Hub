-- Admin tools: close a role self-escalation hole, let admins disable
-- accounts instead of deleting them, add the missing polls delete policy,
-- and seed a private "Admins" chat group.
-- Run this in the Supabase SQL editor (or `supabase db push`) after 0005.

-- profiles.role is only meant to change via an admin action. RLS can't
-- restrict a single column, so a trigger enforces it: any update that
-- changes role, made by a non-admin, silently keeps the old role instead.
create or replace function prevent_role_escalation()
returns trigger as $$
begin
  if new.role is distinct from old.role and not current_role_is('admin') then
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_profiles_role_change on profiles;
create trigger on_profiles_role_change
  before update on profiles
  for each row execute procedure prevent_role_escalation();

-- soft-remove: admins can lock an account out of the app without deleting
-- their chat history / authored content (a hard delete would also violate
-- the foreign keys those tables hold on profiles.id).
alter table profiles add column if not exists disabled_at timestamptz;

-- polls could be created but never removed; poll_options/poll_votes cascade.
create policy "polls delete admin" on polls for delete using (current_role_is('admin'));

-- admins manage membership of any chat group, needed to keep the Admins
-- group in sync as roles change, and useful for moderation generally.
create policy "chat_members insert admin" on chat_group_members for insert with check (current_role_is('admin'));
create policy "chat_members delete self or admin" on chat_group_members for delete using (
  user_id = auth.uid() or current_role_is('admin')
);

-- seed a private "Admins" chat group with whoever currently holds the role.
insert into chat_groups (name, is_dm, created_by)
select 'Admins', false, p.id
from profiles p
where p.role = 'admin'
  and not exists (select 1 from chat_groups where name = 'Admins')
order by p.created_at
limit 1;

insert into chat_group_members (group_id, user_id)
select g.id, p.id
from chat_groups g
join profiles p on p.role = 'admin'
where g.name = 'Admins'
on conflict do nothing;
