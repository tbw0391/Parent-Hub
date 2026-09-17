-- Fixes "infinite recursion detected in policy for relation chat_group_members".
-- The original "chat_members select fellow member" policy queried chat_group_members
-- from within its own policy, which Postgres can't evaluate. A SECURITY DEFINER
-- helper (same pattern as current_role_is()) bypasses RLS for the internal check,
-- breaking the self-reference.

create or replace function is_chat_member(gid uuid, uid uuid)
returns boolean as $$
  select exists (
    select 1 from chat_group_members where group_id = gid and user_id = uid
  );
$$ language sql security definer stable;

drop policy if exists "chat_members select fellow member" on chat_group_members;
create policy "chat_members select fellow member" on chat_group_members for select using (
  is_chat_member(group_id, auth.uid())
);
