import { createClient } from '@/lib/supabase/server';
import type { PrayerPraise, Profile } from '@/lib/database.types';
import { createEntry } from './actions';

export default async function PrayerPraisePage() {
  const supabase = await createClient();
  const { data: entries } = await supabase
    .from('prayer_praise')
    .select('*')
    .order('created_at', { ascending: false });

  const authorIds = Array.from(new Set((entries as PrayerPraise[] | null)?.map((e) => e.author_id) ?? []));
  const { data: authors } = authorIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', authorIds)
    : { data: [] as Pick<Profile, 'id' | 'display_name'>[] };
  const nameById = new Map((authors ?? []).map((a) => [a.id, a.display_name]));

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Prayer &amp; Praise</h1>

      <form action={createEntry} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
        <h2 className="text-sm font-medium text-acidDim">Share a prayer request or praise report</h2>
        <div className="flex gap-4 text-sm text-ink">
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" value="prayer" defaultChecked /> Prayer request
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="kind" value="praise" /> Praise report
          </label>
        </div>
        <textarea
          name="body"
          required
          rows={3}
          placeholder="What's on your heart?"
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
        />
        <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
          Share
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {(entries as PrayerPraise[] | null)?.length ? (
          (entries as PrayerPraise[]).map((entry) => (
            <div key={entry.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              <div className="flex items-center justify-between">
                <span
                  className={
                    'rounded-full px-2 py-0.5 text-xs font-medium ' +
                    (entry.kind === 'praise' ? 'bg-acid/20 text-acid' : 'bg-pumpkin/20 text-pumpkin')
                  }
                >
                  {entry.kind === 'praise' ? 'Praise' : 'Prayer'}
                </span>
                <span className="text-xs text-acidDim">{nameById.get(entry.author_id) ?? 'A parent'}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{entry.body}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-acidDim">No entries yet — be the first to share.</p>
        )}
      </div>
    </div>
  );
}
