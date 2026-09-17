'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const title = String(formData.get('title') ?? '').trim();
  const body_richtext = String(formData.get('body') ?? '').trim();
  const image_url = String(formData.get('image_url') ?? '').trim() || null;

  if (!title || !body_richtext) throw new Error('Title and body are required');

  const { error } = await supabase
    .from('articles')
    .insert({ author_id: user.id, title, body_richtext, image_url });

  if (error) throw new Error(error.message);
  revalidatePath('/articles');
}
