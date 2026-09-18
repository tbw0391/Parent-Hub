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
  const url = String(formData.get('url') ?? '').trim() || null;
  const platform = String(formData.get('platform') ?? '').trim() || null;

  if (!name) throw new Error('App name is required');

  const { error } = await supabase
    .from('app_recommendations')
    .insert({ author_id: user.id, name, description, url, platform });

  if (error) throw new Error(error.message);
  revalidatePath('/apps');
}
