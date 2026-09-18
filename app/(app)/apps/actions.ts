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
  const apple_url = String(formData.get('apple_url') ?? '').trim() || null;
  const android_url = String(formData.get('android_url') ?? '').trim() || null;

  if (!name) throw new Error('App name is required');

  const { error } = await supabase
    .from('app_recommendations')
    .insert({ author_id: user.id, name, description, apple_url, android_url });

  if (error) throw new Error(error.message);
  revalidatePath('/apps');
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
