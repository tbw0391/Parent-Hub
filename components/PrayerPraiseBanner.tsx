import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { PrayerPraise, PrayerPraiseAck } from '@/lib/database.types';
import { PrayerPraiseBannerDismiss } from '@/components/PrayerPraiseBannerDismiss';

export async function PrayerPraiseBanner() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { data: entriesData } = await supabase
    .from('prayer_praise')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: myAcksData } = await supabase
    .from('prayer_praise_acks')
    .select('entry_id')
    .eq('user_id', profile.id);
  const ackedEntryIds = new Set((myAcksData as Pick<PrayerPraiseAck, 'entry_id'>[] | null)?.map((a) => a.entry_id));

  const entries = ((entriesData as PrayerPraise[] | null) ?? []).filter((e) => !ackedEntryIds.has(e.id));
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="relative mx-4 mt-4 rounded-lg border border-pumpkin/40 bg-pumpkin/10 px-4 py-3"
        >
          <PrayerPraiseBannerDismiss entryId={entry.id} />
          <div className="flex flex-col gap-1 pr-6">
            <span className="text-xs font-medium uppercase tracking-wide text-pumpkin">
              {entry.kind === 'praise' ? 'Praise report' : 'Prayer request'}
            </span>
            <span className="text-sm font-medium text-ink">
              {entry.kind === 'praise' ? '🙌' : '🙏'} {entry.body}
            </span>
          </div>
        </div>
      ))}
    </>
  );
}
