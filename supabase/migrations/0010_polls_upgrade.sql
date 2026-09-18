-- Poll upgrades: closing, multi-select voting, and deletion.
-- Run this in the Supabase SQL editor (or `supabase db push`) after 0009.

alter table polls add column if not exists closed_at timestamptz;
alter table polls add column if not exists allow_multiple boolean not null default false;

-- was unique (poll_id, voter_id); loosen to (poll_id, voter_id, option_id) so a
-- voter can hold votes on more than one option when a poll allows it.
alter table poll_votes drop constraint if exists poll_votes_poll_id_voter_id_key;
alter table poll_votes add constraint poll_votes_poll_id_voter_id_option_id_key unique (poll_id, voter_id, option_id);

create policy "polls update own or admin" on polls for update using (author_id = auth.uid() or current_role_is('admin'));
create policy "polls delete own or admin" on polls for delete using (author_id = auth.uid() or current_role_is('admin'));
create policy "poll_votes delete self" on poll_votes for delete using (voter_id = auth.uid());
