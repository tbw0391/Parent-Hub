import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import { RoleGate } from '@/components/RoleGate';
import type { Poll, PollOption, PollVote, Profile } from '@/lib/database.types';
import { createPoll, castVote, setPollClosed, deletePoll } from './actions';

export default async function PollsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: polls } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
  const { data: options } = await supabase.from('poll_options').select('*').order('position', { ascending: true });
  const { data: votes } = await supabase.from('poll_votes').select('*');
  const { data: profiles } = await supabase.from('profiles').select('id, display_name');

  const nameById = new Map<string, string>();
  (profiles as Pick<Profile, 'id' | 'display_name'>[] | null)?.forEach((p) => nameById.set(p.id, p.display_name));

  const optionsByPoll = new Map<string, PollOption[]>();
  (options as PollOption[] | null)?.forEach((o) => {
    optionsByPoll.set(o.poll_id, [...(optionsByPoll.get(o.poll_id) ?? []), o]);
  });

  const votersByOption = new Map<string, string[]>();
  const myVotesByPoll = new Map<string, Set<string>>();
  (votes as PollVote[] | null)?.forEach((v) => {
    votersByOption.set(v.option_id, [...(votersByOption.get(v.option_id) ?? []), v.voter_id]);
    if (v.voter_id === profile?.id) {
      const set = myVotesByPoll.get(v.poll_id) ?? new Set<string>();
      set.add(v.option_id);
      myVotesByPoll.set(v.poll_id, set);
    }
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
          <label className="flex items-center gap-2 text-sm text-acidDim">
            <input type="checkbox" name="allow_multiple" className="h-4 w-4" />
            Let people pick more than one option
          </label>
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Create poll
          </button>
        </form>
      </RoleGate>

      <div className="flex flex-col gap-4">
        {(polls as Poll[] | null)?.length ? (
          (polls as Poll[]).map((poll) => {
            const pollOptions = optionsByPoll.get(poll.id) ?? [];
            const totalVotes = pollOptions.reduce((sum, o) => sum + (votersByOption.get(o.id)?.length ?? 0), 0);
            const myVotes = myVotesByPoll.get(poll.id) ?? new Set<string>();
            const isClosed = Boolean(poll.closed_at);
            const canManage = profile?.id === poll.author_id || hasRole(profile, 'admin');

            return (
              <div key={poll.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium text-ink">{poll.question}</h3>
                  <div className="flex shrink-0 items-center gap-2">
                    {isClosed && (
                      <span className="whitespace-nowrap rounded-full bg-acidDim/20 px-2 py-0.5 text-[10px] font-medium uppercase text-acidDim">
                        Closed
                      </span>
                    )}
                    {poll.allow_multiple && (
                      <span className="whitespace-nowrap rounded-full bg-acid/10 px-2 py-0.5 text-[10px] font-medium uppercase text-acid">
                        Pick multiple
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {pollOptions.map((option) => {
                    const voterIds = votersByOption.get(option.id) ?? [];
                    const count = voterIds.length;
                    const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
                    const isMine = myVotes.has(option.id);
                    const voterNames = voterIds.map((id) => nameById.get(id) ?? 'Someone').join(', ');

                    const bar = (
                      <>
                        <span
                          className="absolute inset-y-0 left-0 bg-acid/10"
                          style={{ width: `${pct}%` }}
                          aria-hidden
                        />
                        <span className="relative flex justify-between">
                          <span className="flex items-center gap-2">
                            <span
                              className={
                                'flex h-3.5 w-3.5 shrink-0 items-center justify-center border ' +
                                (poll.allow_multiple ? 'rounded' : 'rounded-full') + ' ' +
                                (isMine ? 'border-acid bg-acid' : 'border-acidDim/50')
                              }
                              aria-hidden
                            >
                              {isMine && (
                                <span
                                  className={
                                    'bg-ground ' + (poll.allow_multiple ? 'h-1.5 w-1.5 rounded-sm' : 'h-1.5 w-1.5 rounded-full')
                                  }
                                />
                              )}
                            </span>
                            {option.label}
                          </span>
                          <span className="text-acidDim">
                            {count} {count === 1 ? 'vote' : 'votes'} ({pct}%)
                          </span>
                        </span>
                      </>
                    );

                    return (
                      <div key={option.id} className="flex flex-col gap-1">
                        {isClosed ? (
                          <div
                            className={
                              'relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm ' +
                              (isMine ? 'border-acid text-acid' : 'border-acidDim/40 text-ink')
                            }
                          >
                            {bar}
                          </div>
                        ) : (
                          <form action={castVote}>
                            <input type="hidden" name="poll_id" value={poll.id} />
                            <input type="hidden" name="option_id" value={option.id} />
                            <button
                              type="submit"
                              className={
                                'relative w-full overflow-hidden rounded-md border px-3 py-2 text-left text-sm ' +
                                (isMine ? 'border-acid text-acid' : 'border-acidDim/40 text-ink')
                              }
                            >
                              {bar}
                            </button>
                          </form>
                        )}
                        {voterNames && <p className="pl-1 text-xs text-acidDim">{voterNames}</p>}
                      </div>
                    );
                  })}
                </div>

                {canManage && (
                  <div className="mt-3 flex gap-3 border-t border-acidDim/20 pt-3 text-xs">
                    <form action={setPollClosed}>
                      <input type="hidden" name="poll_id" value={poll.id} />
                      <input type="hidden" name="closed" value={isClosed ? 'false' : 'true'} />
                      <button type="submit" className="font-medium text-acidDim hover:text-ink">
                        {isClosed ? 'Reopen poll' : 'Close poll'}
                      </button>
                    </form>
                    <form action={deletePoll}>
                      <input type="hidden" name="poll_id" value={poll.id} />
                      <button type="submit" className="font-medium text-red-500 hover:text-red-600">
                        Delete poll
                      </button>
                    </form>
                  </div>
                )}
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
