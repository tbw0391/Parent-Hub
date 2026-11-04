-- Sign-in moved from email codes to SMS codes. Phone-only auth users have no
-- email, so profiles.email can be null and the signup trigger fills in the
-- phone number instead.
alter table profiles alter column email drop not null;

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, phone, display_name)
  values (
    new.id,
    new.email,
    case when new.phone is not null and new.phone <> '' then '+' || new.phone end,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1),
      'Parent ' || right(new.phone, 4),
      ''
    )
  );
  return new;
end;
$$ language plpgsql security definer;
