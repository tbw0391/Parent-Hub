'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim() || null;
  const starts_at = String(formData.get('starts_at') ?? '');
  const location = String(formData.get('location') ?? '').trim() || null;

  if (!title || !starts_at) throw new Error('Title and date/time are required');

  const { error } = await supabase
    .from('schedule_events')
    .insert({ author_id: user.id, title, description, starts_at, location });

  if (error) throw new Error(error.message);
  revalidatePath('/schedule');
}
