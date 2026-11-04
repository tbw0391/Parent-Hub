import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { Profile, Suggestion } from '@/lib/database.types';
import { createSuggestion, deleteSuggestion } from './actions';

export default async function SuggestionsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const isAdmin = hasRole(profile, 'admin');

  // RLS returns only the viewer's own suggestions unless they're an admin.
  const { data: suggestions } = await supabase
    .from('suggestions')
    .select('*')
    .order('created_at', { ascending: false });

  const authorIds = Array.from(new Set((suggestions as Suggestion[] | null)?.map((s) => s.author_id) ?? []));
  const { data: authors } = authorIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', authorIds)
    : { data: [] as Pick<Profile, 'id' | 'display_name'>[] };
  const nameById = new Map((authors ?? []).map((a) => [a.id, a.display_name]));

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Suggestions</h1>

      <form action={createSuggestion} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
        <h2 className="text-sm font-medium text-acidDim">Have an idea to make Parent Hub better? Let us know.</h2>
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Your suggestion"
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
        />
        <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
          Send
        </button>
      </form>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-acidDim">{isAdmin ? 'All suggestions' : 'Your suggestions'}</h2>
        {(suggestions as Suggestion[] | null)?.length ? (
          (suggestions as Suggestion[]).map((s) => (
            <div key={s.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              <div className="flex items-center justify-between text-xs text-acidDim">
                <span>{nameById.get(s.author_id) ?? 'A parent'}</span>
                <span>{new Date(s.created_at).toLocaleDateString()}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{s.body}</p>
              {isAdmin && (
                <form action={deleteSuggestion} className="mt-2">
                  <input type="hidden" name="suggestion_id" value={s.id} />
                  <button type="submit" className="text-xs text-red-400 hover:underline">
                    Delete
                  </button>
                </form>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-acidDim">No suggestions yet.</p>
        )}
      </div>
    </div>
  );
}
