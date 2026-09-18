'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

const TMDB_API = 'https://api.themoviedb.org/3';

export async function createTvMovieRecommendation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const title = String(formData.get('title') ?? '').trim();
  if (!title) throw new Error('Title is required');

  const match = await lookupTitle(title);
  if (!match) throw new Error(`Couldn't find "${title}" — check the spelling and try again`);

  const { error } = await supabase.from('tv_movie_recommendations').insert({
    author_id: user.id,
    title: match.title,
    media_type: match.mediaType,
    poster_path: match.posterPath,
    providers: match.providers,
  });

  if (error) throw new Error(error.message);
  revalidatePath('/tv-movies');
}

export async function deleteTvMovieRecommendation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const rec_id = String(formData.get('rec_id') ?? '');
  if (!rec_id) throw new Error('Missing recommendation');

  const { error } = await supabase.from('tv_movie_recommendations').delete().eq('id', rec_id);
  if (error) throw new Error(error.message);
  revalidatePath('/tv-movies');
}

async function lookupTitle(query: string): Promise<{
  title: string;
  mediaType: 'movie' | 'tv';
  posterPath: string | null;
  providers: string[];
} | null> {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) throw new Error('TMDB_API_KEY is not configured');

  const searchRes = await fetch(
    `${TMDB_API}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}`
  );
  if (!searchRes.ok) throw new Error('Streaming lookup failed');
  const searchData = await searchRes.json();

  const result = (searchData?.results ?? []).find(
    (r: { media_type?: string }) => r.media_type === 'movie' || r.media_type === 'tv'
  );
  if (!result) return null;

  const mediaType: 'movie' | 'tv' = result.media_type;
  const providersRes = await fetch(`${TMDB_API}/${mediaType}/${result.id}/watch/providers?api_key=${apiKey}`);
  const providersData = providersRes.ok ? await providersRes.json() : null;
  const usProviders = providersData?.results?.US;
  const providerNames = new Set<string>();
  for (const bucket of ['flatrate', 'free', 'ads'] as const) {
    (usProviders?.[bucket] ?? []).forEach((p: { provider_name: string }) => providerNames.add(p.provider_name));
  }

  return {
    title: result.title ?? result.name ?? query,
    mediaType,
    posterPath: result.poster_path ?? null,
    providers: Array.from(providerNames),
  };
}
