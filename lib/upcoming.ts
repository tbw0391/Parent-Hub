import type { Child, Profile } from '@/lib/database.types';

export interface UpcomingEvent {
  id: string;
  label: string;
  date: Date;
  daysAway: number;
}

function nextOccurrence(isoDate: string, today: Date): Date {
  const source = new Date(isoDate + 'T00:00:00');
  const next = new Date(today.getFullYear(), source.getMonth(), source.getDate());
  next.setHours(0, 0, 0, 0);
  if (next.getTime() < today.getTime()) {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

function formatMonthDay(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function getUpcomingEvents(
  profiles: Profile[],
  children: Child[],
  withinDays = 14,
  today: Date = new Date()
): UpcomingEvent[] {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const events: UpcomingEvent[] = [];

  const profileById = new Map(profiles.map((p) => [p.id, p]));

  for (const child of children) {
    const next = nextOccurrence(child.birth_date, start);
    const daysAway = daysBetween(start, next);
    if (daysAway <= withinDays) {
      const parentName = profileById.get(child.parent_id)?.display_name;
      events.push({
        id: `child-${child.id}`,
        label: `${child.name}'s birthday${parentName ? ` (${parentName}'s kid)` : ''} — ${formatMonthDay(next)}`,
        date: next,
        daysAway,
      });
    }
  }

  for (const profile of profiles) {
    if (!profile.birthday) continue;
    const next = nextOccurrence(profile.birthday, start);
    const daysAway = daysBetween(start, next);
    if (daysAway <= withinDays) {
      events.push({
        id: `birthday-${profile.id}`,
        label: `${profile.display_name}'s birthday — ${formatMonthDay(next)}`,
        date: next,
        daysAway,
      });
    }
  }

  const seenAnniversaryPairs = new Set<string>();
  for (const profile of profiles) {
    if (!profile.anniversary) continue;

    const spouseId =
      profile.spouse_id ?? profiles.find((p) => p.spouse_id === profile.id)?.id ?? null;
    const pairKey = [profile.id, spouseId ?? profile.id].sort().join('-');
    if (seenAnniversaryPairs.has(pairKey)) continue;
    seenAnniversaryPairs.add(pairKey);

    const next = nextOccurrence(profile.anniversary, start);
    const daysAway = daysBetween(start, next);
    if (daysAway <= withinDays) {
      const spouseName = spouseId ? profileById.get(spouseId)?.display_name : null;
      const names = spouseName ? `${profile.display_name} & ${spouseName}` : profile.display_name;
      events.push({
        id: `anniversary-${pairKey}`,
        label: `${names}'s anniversary — ${formatMonthDay(next)}`,
        date: next,
        daysAway,
      });
    }
  }

  return events.sort((a, b) => a.daysAway - b.daysAway);
}
