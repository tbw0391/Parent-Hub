import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { Poll, PollVote } from '@/lib/database.types';
import { DismissibleBanner } from '@/components/DismissibleBanner';

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

  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      {polls.map((poll) => (
        <DismissibleBanner key={poll.id} storageKey={`poll-banner-dismissed-${today}-${poll.id}`}>
          <Link href="/polls" className="flex flex-col gap-1 pr-6">
            <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">Poll open</span>
            <span className="text-sm text-ink underline-offset-2 hover:underline">🗳️ {poll.question}</span>
          </Link>
        </DismissibleBanner>
      ))}
    </>
  );
}
