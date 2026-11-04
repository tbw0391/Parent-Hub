'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createSuggestion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const body = String(formData.get('body') ?? '').trim();
  if (!body) throw new Error('Please write something');

  const { error } = await supabase.from('suggestions').insert({ author_id: user.id, body });

  if (error) throw new Error(error.message);
  revalidatePath('/suggestions');
}

export async function deleteSuggestion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const suggestion_id = String(formData.get('suggestion_id') ?? '');
  if (!suggestion_id) throw new Error('Missing suggestion');

  const { error } = await supabase.from('suggestions').delete().eq('id', suggestion_id);
  if (error) throw new Error(error.message);
  revalidatePath('/suggestions');
}
