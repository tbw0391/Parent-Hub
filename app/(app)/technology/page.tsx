import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { TechRecommendation } from '@/lib/database.types';
import { createTechRecommendation, deleteTechRecommendation } from './actions';

export default async function TechnologyPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: appsData } = await supabase
    .from('tech_recommendations')
    .select('*')
    .order('created_at', { ascending: false });
  const apps = (appsData as TechRecommendation[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-acid">Technology</h1>
        <p className="mt-2 text-sm text-acidDim">Apps and tools recommended for parents.</p>
      </div>

        <form
          action={createTechRecommendation}
          className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4"
        >
          <h2 className="text-sm font-medium text-acidDim">Recommend an app</h2>
          <input
            name="name"
            required
            placeholder="App name"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <textarea
            name="description"
            rows={3}
            placeholder="Why it's useful (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            name="url"
            placeholder="Link (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <select
            name="platform"
            defaultValue=""
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          >
            <option value="">Platform (optional)</option>
            <option value="ios">iOS</option>
            <option value="android">Android</option>
            <option value="web">Web</option>
          </select>
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Recommend
          </button>
        </form>

      <div className="flex flex-col gap-3">
        {apps.length ? (
          apps.map((app) => (
            <div key={app.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-base font-medium text-ink">{app.name}</h3>
                {app.platform && (
                  <span className="whitespace-nowrap text-xs uppercase text-teal-500">{app.platform}</span>
                )}
              </div>
              {app.description && <p className="mt-2 text-sm text-acidDim">{app.description}</p>}
              {app.url && (
                <a
                  href={app.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-sm text-acid underline"
                >
                  Open →
                </a>
              )}
              {(profile?.id === app.author_id || hasRole(profile, 'admin')) && (
                <form action={deleteTechRecommendation} className="mt-2">
                  <input type="hidden" name="id" value={app.id} />
                  <button type="submit" className="text-xs text-red-500 hover:text-red-600">
                    Delete
                  </button>
                </form>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-acidDim">No recommendations yet.</p>
        )}
      </div>
    </div>
  );
}
