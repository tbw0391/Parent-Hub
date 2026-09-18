'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const kind = String(formData.get('kind') ?? 'prayer');
  const body = String(formData.get('body') ?? '').trim();

  if (!body) throw new Error('Please write something');
  if (kind !== 'prayer' && kind !== 'praise') throw new Error('Invalid type');

  const { error } = await supabase.from('prayer_praise').insert({ author_id: user.id, kind, body });

  if (error) throw new Error(error.message);
  revalidatePath('/prayer-praise');
  revalidatePath('/', 'layout');
}

export async function ackEntry(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const entry_id = String(formData.get('entry_id') ?? '');
  if (!entry_id) throw new Error('Missing entry');

  const { error } = await supabase
    .from('prayer_praise_acks')
    .insert({ entry_id, user_id: user.id });

  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}
