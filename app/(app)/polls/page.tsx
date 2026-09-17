import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import { RoleGate } from '@/components/RoleGate';
import type { Poll, PollOption, PollVote } from '@/lib/database.types';
import { createPoll, castVote } from './actions';

export default async function PollsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: polls } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
  const { data: options } = await supabase.from('poll_options').select('*').order('position', { ascending: true });
  const { data: votes } = await supabase.from('poll_votes').select('*');

  const optionsByPoll = new Map<string, PollOption[]>();
  (options as PollOption[] | null)?.forEach((o) => {
    optionsByPoll.set(o.poll_id, [...(optionsByPoll.get(o.poll_id) ?? []), o]);
  });

  const voteCountByOption = new Map<string, number>();
  const myVoteByPoll = new Map<string, string>();
  (votes as PollVote[] | null)?.forEach((v) => {
    voteCountByOption.set(v.option_id, (voteCountByOption.get(v.option_id) ?? 0) + 1);
    if (v.voter_id === profile?.id) myVoteByPoll.set(v.poll_id, v.option_id);
  });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Polls</h1>

      <RoleGate profile={profile} minRole="power_user">
        <form action={createPoll} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
          <h2 className="text-sm font-medium text-acidDim">New poll</h2>
          <input
            name="question"
            required
            placeholder="Ask a question"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          {[0, 1, 2, 3].map((i) => (
            <input
              key={i}
              name="options"
              placeholder={`Option ${i + 1}${i < 2 ? ' (required)' : ' (optional)'}`}
              required={i < 2}
              className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
            />
          ))}
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Create poll
          </button>
        </form>
      </RoleGate>

      <div className="flex flex-col gap-4">
        {(polls as Poll[] | null)?.length ? (
          (polls as Poll[]).map((poll) => {
            const pollOptions = optionsByPoll.get(poll.id) ?? [];
            const totalVotes = pollOptions.reduce((sum, o) => sum + (voteCountByOption.get(o.id) ?? 0), 0);
            const myVote = myVoteByPoll.get(poll.id);

            return (
              <div key={poll.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
                <h3 className="text-base font-medium text-ink">{poll.question}</h3>
                <div className="mt-3 flex flex-col gap-2">
                  {pollOptions.map((option) => {
                    const count = voteCountByOption.get(option.id) ?? 0;
                    const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
                    const isMine = myVote === option.id;
                    return (
                      <form key={option.id} action={castVote}>
                        <input type="hidden" name="poll_id" value={poll.id} />
                        <input type="hidden" name="option_id" value={option.id} />
                        <button
                          type="submit"
                          className={
                            'relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm ' +
                            (isMine ? 'border-acid text-acid' : 'border-acidDim/40 text-ink')
                          }
                        >
                          <span
                            className="absolute inset-y-0 left-0 bg-acid/10"
                            style={{ width: `${pct}%` }}
                            aria-hidden
                          />
                          <span className="relative flex justify-between">
                            <span>{option.label}</span>
                            <span className="text-acidDim">
                              {count} {count === 1 ? 'vote' : 'votes'} ({pct}%)
                            </span>
                          </span>
                        </button>
                      </form>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-acidDim">No polls yet.</p>
        )}
      </div>
    </div>
  );
}
