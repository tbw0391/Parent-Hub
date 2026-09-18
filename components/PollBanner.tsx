import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import type { Poll } from '@/lib/database.types';
import { DismissibleBanner } from '@/components/DismissibleBanner';

export async function PollBanner() {
  const supabase = await createClient();
  const { data: pollsData } = await supabase
    .from('polls')
    .select('*')
    .is('closed_at', null)
    .order('created_at', { ascending: false })
    .limit(3);

  const polls = (pollsData as Poll[] | null) ?? [];
  if (polls.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `poll-banner-dismissed-${today}-${polls.map((p) => p.id).join(',')}`;

  return (
    <DismissibleBanner storageKey={storageKey}>
      <div className="flex flex-col gap-1 pr-6">
        <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">
          {polls.length > 1 ? 'Polls open' : 'Poll open'}
        </span>
        {polls.map((poll) => (
          <Link key={poll.id} href="/polls" className="text-sm text-ink underline-offset-2 hover:underline">
            🗳️ {poll.question}
          </Link>
        ))}
      </div>
    </DismissibleBanner>
  );
}
