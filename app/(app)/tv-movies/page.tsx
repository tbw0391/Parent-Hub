import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { TvMovieRecommendation } from '@/lib/database.types';
import { createTvMovieRecommendation, deleteTvMovieRecommendation } from './actions';

export default async function TvMoviesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const { data: recsData } = await supabase
    .from('tv_movie_recommendations')
    .select('*')
    .order('created_at', { ascending: false });
  const recs = (recsData as TvMovieRecommendation[] | null) ?? [];
  const canManage = hasRole(profile, 'power_user');

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-acid">TV & Movies</h1>
        <p className="mt-2 text-sm text-acidDim">Shows and movies parents recommend, with streaming info.</p>
      </div>

      {profile && (
        <form
          action={createTvMovieRecommendation}
          className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4"
        >
          <h2 className="text-sm font-medium text-acidDim">Recommend a show or movie</h2>
          <input
            name="title"
            required
            placeholder="Title"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <p className="text-xs text-acidDim">We&apos;ll look up where it&apos;s streaming for you.</p>
          <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
            Recommend
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {recs.length ? (
          recs.map((rec) => (
            <div key={rec.id} className="flex gap-3 rounded-lg border border-acidDim/20 bg-panel p-4">
              {rec.poster_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w92${rec.poster_path}`}
                  alt=""
                  className="h-24 w-16 shrink-0 rounded object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="text-base font-medium text-ink">{rec.title}</h3>
                  {canManage && (
                    <form action={deleteTvMovieRecommendation}>
                      <input type="hidden" name="rec_id" value={rec.id} />
                      <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-600">
                        Delete
                      </button>
                    </form>
                  )}
                </div>
                <span className="text-xs uppercase text-teal-500">{rec.media_type === 'tv' ? 'TV Show' : 'Movie'}</span>
                {rec.providers.length ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {rec.providers.map((provider) => (
                      <span
                        key={provider}
                        className="rounded-full bg-acid/20 px-2 py-0.5 text-xs font-medium text-acid"
                      >
                        {provider}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-acidDim">Not currently streaming.</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-acidDim">No recommendations yet.</p>
        )}
      </div>
    </div>
  );
}
