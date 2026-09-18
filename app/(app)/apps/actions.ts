'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createAppRecommendation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const name = String(formData.get('name') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const wantsIos = formData.get('ios') === 'on';
  const wantsAndroid = formData.get('android') === 'on';

  if (!name) throw new Error('App name is required');

  const apple_url = wantsIos ? await lookupAppleStoreUrl(name) : null;
  const android_url = wantsAndroid
    ? `https://play.google.com/store/search?q=${encodeURIComponent(name)}&c=apps`
    : null;

  const { error } = await supabase
    .from('app_recommendations')
    .insert({ author_id: user.id, name, description, apple_url, android_url });

  if (error) throw new Error(error.message);
  revalidatePath('/apps');
}

async function lookupAppleStoreUrl(name: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(name)}&entity=software&limit=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.results?.[0]?.trackViewUrl ?? null;
  } catch {
    return null;
  }
}

export async function deleteAppRecommendation(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const app_id = String(formData.get('app_id') ?? '');
  if (!app_id) throw new Error('Missing app');

  const { error } = await supabase.from('app_recommendations').delete().eq('id', app_id);
  if (error) throw new Error(error.message);
  revalidatePath('/apps');
}
