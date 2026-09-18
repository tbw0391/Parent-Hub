import { createClient } from '@/lib/supabase/server';
import { getUpcomingEvents } from '@/lib/upcoming';
import type { Child, Profile } from '@/lib/database.types';
import { DismissibleBanner } from '@/components/DismissibleBanner';
import { BirthdayConfetti } from '@/components/BirthdayConfetti';

export async function UpcomingBanner() {
  const supabase = await createClient();
  const { data: profilesData } = await supabase.from('profiles').select('*');
  const { data: childrenData } = await supabase.from('children').select('*');

  const events = getUpcomingEvents((profilesData as Profile[]) ?? [], (childrenData as Child[]) ?? []);
  if (events.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `upcoming-dismissed-${today}-${events.map((e) => e.id).join(',')}`;

  const iconFor = (id: string) => {
    if (id.startsWith('child-') || id.startsWith('birthday-')) return '🎈🎊';
    if (id.startsWith('anniversary-')) return '💍';
    return '🎉';
  };

  const hasBirthday = events.some((e) => e.id.startsWith('child-') || e.id.startsWith('birthday-'));

  return (
    <DismissibleBanner storageKey={storageKey} className="relative mx-4 mt-4 overflow-hidden">
      {hasBirthday && <BirthdayConfetti />}
      <div className="relative flex flex-col gap-1 pr-6">
        <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">Coming up</span>
        {events.map((event) => (
          <span key={event.id} className="text-sm text-ink">
            {iconFor(event.id)} {event.label}
          </span>
        ))}
      </div>
    </DismissibleBanner>
  );
}
