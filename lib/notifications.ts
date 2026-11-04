import { createClient } from '@/lib/supabase/server';
import { getUpcomingEvents } from '@/lib/upcoming';
import type { Child, Poll, PollVote, PrayerPraise, PrayerPraiseAck, Profile } from '@/lib/database.types';

export type NotificationCategory = 'chat' | 'prayer_praise' | 'poll' | 'upcoming';

export interface NotificationItem {
  id: string;
  category: NotificationCategory;
  title: string;
  subtitle?: string;
  href: string;
}

export interface NotificationResult {
  items: NotificationItem[];
  totalCount: number;
}

const PRAYER_PRAISE_CAP = 3;
const POLL_CAP = 3;
const UPCOMING_CAP = 3;
const UPCOMING_WITHIN_DAYS = 7;

function truncate(text: string, max = 80): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export async function getNotifications(
  userId: string,
  unreadChatCount: number
): Promise<NotificationResult> {
  const supabase = await createClient();
  const items: NotificationItem[] = [];

  if (unreadChatCount > 0) {
    items.push({
      id: 'chat',
      category: 'chat',
      title: 'New messages',
      subtitle: `${unreadChatCount} unread message${unreadChatCount === 1 ? '' : 's'}`,
      href: '/chat',
    });
  }

  const [{ data: entriesData }, { data: myAcksData }] = await Promise.all([
    supabase.from('prayer_praise').select('*').order('created_at', { ascending: false }),
    supabase.from('prayer_praise_acks').select('entry_id').eq('user_id', userId),
  ]);
  const ackedIds = new Set(
    (myAcksData as Pick<PrayerPraiseAck, 'entry_id'>[] | null)?.map((a) => a.entry_id)
  );
  const unackedEntries = ((entriesData as PrayerPraise[] | null) ?? []).filter(
    (e) => !ackedIds.has(e.id)
  );
  unackedEntries.slice(0, PRAYER_PRAISE_CAP).forEach((entry) => {
    items.push({
      id: `prayer-praise-${entry.id}`,
      category: 'prayer_praise',
      title: entry.kind === 'praise' ? 'Praise report' : 'Prayer request',
      subtitle: truncate(entry.body),
      href: '/prayer-praise',
    });
  });
  if (unackedEntries.length > PRAYER_PRAISE_CAP) {
    items.push({
      id: 'prayer-praise-more',
      category: 'prayer_praise',
      title: `+${unackedEntries.length - PRAYER_PRAISE_CAP} more`,
      href: '/prayer-praise',
    });
  }

  const [{ data: pollsData }, { data: myVotesData }] = await Promise.all([
    supabase.from('polls').select('*').is('closed_at', null).order('created_at', { ascending: false }),
    supabase.from('poll_votes').select('poll_id').eq('voter_id', userId),
  ]);
  const votedPollIds = new Set(
    (myVotesData as Pick<PollVote, 'poll_id'>[] | null)?.map((v) => v.poll_id)
  );
  const openPolls = ((pollsData as Poll[] | null) ?? []).filter((p) => !votedPollIds.has(p.id));
  openPolls.slice(0, POLL_CAP).forEach((poll) => {
    items.push({
      id: `poll-${poll.id}`,
      category: 'poll',
      title: 'Poll open',
      subtitle: truncate(poll.question),
      href: '/polls',
    });
  });
  if (openPolls.length > POLL_CAP) {
    items.push({
      id: 'poll-more',
      category: 'poll',
      title: `+${openPolls.length - POLL_CAP} more`,
      href: '/polls',
    });
  }

  const [{ data: profilesData }, { data: childrenData }] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('children').select('*'),
  ]);
  const upcoming = getUpcomingEvents(
    (profilesData as Profile[]) ?? [],
    (childrenData as Child[]) ?? [],
    UPCOMING_WITHIN_DAYS
  );
  upcoming.slice(0, UPCOMING_CAP).forEach((event) => {
    items.push({ id: event.id, category: 'upcoming', title: event.label, href: '/' });
  });

  const totalCount = unreadChatCount + unackedEntries.length + openPolls.length;

  return { items, totalCount };
}
