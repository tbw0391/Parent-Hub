import { createClient } from '@/lib/supabase/server';
import { getUpcomingEvents } from '@/lib/upcoming';
import type { Child, Profile } from '@/lib/database.types';
import { DismissibleBanner } from '@/components/DismissibleBanner';

export async function UpcomingBanner() {
  const supabase = await createClient();
  const { data: profilesData } = await supabase.from('profiles').select('*');
  const { data: childrenData } = await supabase.from('children').select('*');

  const events = getUpcomingEvents((profilesData as Profile[]) ?? [], (childrenData as Child[]) ?? []);
  if (events.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `upcoming-dismissed-${today}-${events.map((e) => e.id).join(',')}`;

  return (
    <DismissibleBanner storageKey={storageKey}>
      <div className="flex flex-col gap-1 pr-6">
        <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">Coming up</span>
        {events.map((event) => (
          <span key={event.id} className="text-sm text-ink">
            🎉 {event.label}
          </span>
        ))}
      </div>
    </DismissibleBanner>
  );
}
