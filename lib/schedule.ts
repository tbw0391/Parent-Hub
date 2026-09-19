import type { Child, Profile, ScheduleEvent } from '@/lib/database.types';

export function nextOccurrence(event: Pick<ScheduleEvent, 'starts_at' | 'recurrence'>, now: Date = new Date()): Date {
  const start = new Date(event.starts_at);
  if (event.recurrence === 'none') return start;

  const next = new Date(start);
  while (next.getTime() < now.getTime()) {
    if (event.recurrence === 'weekly') next.setDate(next.getDate() + 7);
    else if (event.recurrence === 'monthly') next.setMonth(next.getMonth() + 1);
    else next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

export const RECURRENCE_LABEL: Record<ScheduleEvent['recurrence'], string> = {
  none: '',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

export interface LifeEvent {
  id: string;
  title: string;
  starts_at: string;
  recurrence: 'yearly';
}

/** Yearly recurring calendar entries for every birthday and anniversary on file. */
export function buildLifeEvents(profiles: Profile[], children: Child[]): LifeEvent[] {
  const events: LifeEvent[] = [];
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  for (const child of children) {
    events.push({
      id: `child-${child.id}`,
      title: `🎈 ${child.name}'s birthday`,
      starts_at: `${child.birth_date}T09:00:00`,
      recurrence: 'yearly',
    });
  }

  for (const profile of profiles) {
    if (!profile.birthday) continue;
    events.push({
      id: `birthday-${profile.id}`,
      title: `🎈 ${profile.display_name}'s birthday`,
      starts_at: `${profile.birthday}T09:00:00`,
      recurrence: 'yearly',
    });
  }

  const seenAnniversaryPairs = new Set<string>();
  for (const profile of profiles) {
    if (!profile.anniversary) continue;

    const spouseId = profile.spouse_id ?? profiles.find((p) => p.spouse_id === profile.id)?.id ?? null;
    const pairKey = [profile.id, spouseId ?? profile.id].sort().join('-');
    if (seenAnniversaryPairs.has(pairKey)) continue;
    seenAnniversaryPairs.add(pairKey);

    const spouseName = spouseId ? profileById.get(spouseId)?.display_name : null;
    const names = spouseName ? `${profile.display_name} & ${spouseName}` : profile.display_name;
    events.push({
      id: `anniversary-${pairKey}`,
      title: `💍 ${names}'s anniversary`,
      starts_at: `${profile.anniversary}T09:00:00`,
      recurrence: 'yearly',
    });
  }

  return events;
}
