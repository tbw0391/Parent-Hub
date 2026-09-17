-- 0006 added a trigger to stop a signed-in user from promoting themselves
-- via the app's client, but it also silently blocked role changes made
-- directly in the Supabase SQL editor / dashboard (auth.uid() is null
-- there, so current_role_is('admin') always evaluated false). This only
-- reverts the change when it's coming from an authenticated app session.
create or replace function prevent_role_escalation()
returns trigger as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not current_role_is('admin') then
    new.role := old.role;
  end if;
  return new;
end;
$$ language plpgsql security definer;
