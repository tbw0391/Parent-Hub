import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { Poll, PollOption, PollVote } from '@/lib/database.types';
import { DismissibleBanner } from '@/components/DismissibleBanner';
import { PollBannerVoteButton } from '@/components/PollBannerVote';

export async function PollBanner() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { data: pollsData } = await supabase
    .from('polls')
    .select('*')
    .is('closed_at', null)
    .order('created_at', { ascending: false });

  const { data: myVotesData } = await supabase.from('poll_votes').select('poll_id').eq('voter_id', profile.id);
  const answeredPollIds = new Set((myVotesData as Pick<PollVote, 'poll_id'>[] | null)?.map((v) => v.poll_id));

  const polls = ((pollsData as Poll[] | null) ?? []).filter((p) => !answeredPollIds.has(p.id));
  if (polls.length === 0) return null;

  const pollIds = polls.map((p) => p.id);
  const { data: optionsData } = await supabase
    .from('poll_options')
    .select('*')
    .in('poll_id', pollIds)
    .order('position', { ascending: true });

  const optionsByPoll = new Map<string, PollOption[]>();
  (optionsData as PollOption[] | null)?.forEach((o) => {
    optionsByPoll.set(o.poll_id, [...(optionsByPoll.get(o.poll_id) ?? []), o]);
  });

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {polls.map((poll) => (
        <DismissibleBanner key={poll.id} storageKey={`poll-banner-dismissed-${today}-${poll.id}`}>
          <div className="flex flex-col gap-2 pr-6">
            <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">Poll open</span>
            <span className="text-sm font-medium text-ink">🗳️ {poll.question}</span>
            <div className="flex flex-col gap-1.5">
              {(optionsByPoll.get(poll.id) ?? []).map((option) => (
                <PollBannerVoteButton
                  key={option.id}
                  pollId={poll.id}
                  optionId={option.id}
                  label={option.label}
                  allowMultiple={poll.allow_multiple}
                />
              ))}
            </div>
          </div>
        </DismissibleBanner>
      ))}
    </>
  );
}
