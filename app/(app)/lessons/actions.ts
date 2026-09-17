'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createLesson(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const attachment_url = String(formData.get('attachment_url') ?? '').trim() || null;
  const attachment_type = String(formData.get('attachment_type') ?? '').trim() || null;

  if (!title) throw new Error('Title is required');

  const { error } = await supabase
    .from('lessons')
    .insert({ author_id: user.id, title, description, attachment_url, attachment_type });

  if (error) throw new Error(error.message);
  revalidatePath('/lessons');
}
