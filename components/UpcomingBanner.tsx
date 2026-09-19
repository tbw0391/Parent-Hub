import { createClient } from '@/lib/supabase/server';
import { getUpcomingEvents } from '@/lib/upcoming';
import type { Child, Profile } from '@/lib/database.types';
import { DismissibleBanner } from '@/components/DismissibleBanner';
import { BirthdayConfetti } from '@/components/BirthdayConfetti';

export async function UpcomingBanner() {
  const supabase = await createClient();
  const { data: profilesData } = await supabase.from('profiles').select('*');
  const { data: childrenData } = await supabase.from('children').select('*');
  const profiles = (profilesData as Profile[]) ?? [];
  const children = (childrenData as Child[]) ?? [];

  const events = getUpcomingEvents(profiles, children);
  if (events.length === 0) return null;

  const today = new Date().toISOString().slice(0, 10);
  const storageKey = `upcoming-dismissed-${today}-${events.map((e) => e.id).join(',')}`;

  const iconFor = (id: string) => {
    if (id.startsWith('child-') || id.startsWith('birthday-')) return '🎈🎊';
    if (id.startsWith('anniversary-')) return '💍';
    return '🎉';
  };

  const nearestBirthday = events.find((e) => e.id.startsWith('child-') || e.id.startsWith('birthday-'));
  const hasBirthday = Boolean(nearestBirthday);

  let photoUrl: string | null = null;
  if (nearestBirthday?.id.startsWith('birthday-')) {
    const profileId = nearestBirthday.id.replace('birthday-', '');
    const photoPath = profiles.find((p) => p.id === profileId)?.photo_path;
    if (photoPath) {
      const { data } = await supabase.storage.from('avatars').createSignedUrl(photoPath, 3600);
      photoUrl = data?.signedUrl ?? null;
    }
  }

  return (
    <DismissibleBanner storageKey={storageKey} className="relative overflow-hidden">
      {hasBirthday && <BirthdayConfetti />}
      <div className="relative flex items-center gap-3 pr-6">
        {hasBirthday && (
          <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full border border-pumpkin/40 bg-panel text-2xl">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              '🥳'
            )}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">Coming up</span>
          {events.map((event) => (
            <span key={event.id} className="text-sm text-ink">
              {iconFor(event.id)} {event.label}
            </span>
          ))}
        </div>
      </div>
    </DismissibleBanner>
  );
}
