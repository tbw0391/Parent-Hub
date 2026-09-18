import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { AppRecommendation } from '@/lib/database.types';
import { createAppRecommendation } from './actions';

export default async function AppsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: appsData } = await supabase
    .from('app_recommendations')
    .select('*')
    .order('created_at', { ascending: false });
  const apps = (appsData as AppRecommendation[] | null) ?? [];

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-acid">Apps</h1>
        <p className="mt-2 text-sm text-acidDim">Apps parents like and recommend for kids.</p>
      </div>

      {profile && (
        <form
          action={createAppRecommendation}
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
            placeholder="Why it's good for kids (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            name="apple_url"
            placeholder="Apple App Store link (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <input
            name="android_url"
            placeholder="Google Play link (optional)"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Recommend
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {apps.length ? (
          apps.map((app) => (
            <div key={app.id} className="rounded-lg border border-acidDim/20 bg-panel p-4">
              <h3 className="text-base font-medium text-ink">{app.name}</h3>
              {app.description && <p className="mt-2 text-sm text-acidDim">{app.description}</p>}
              {(app.apple_url || app.android_url) && (
                <div className="mt-2 flex gap-4">
                  {app.apple_url && (
                    <a
                      href={app.apple_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-acid underline"
                    >
                      App Store →
                    </a>
                  )}
                  {app.android_url && (
                    <a
                      href={app.android_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-acid underline"
                    >
                      Google Play →
                    </a>
                  )}
                </div>
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
