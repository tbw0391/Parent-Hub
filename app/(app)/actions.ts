'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function setDisplayName(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const display_name = String(formData.get('display_name') ?? '').trim();
  if (!display_name) throw new Error('Please enter your name');

  const { error } = await supabase.from('profiles').update({ display_name }).eq('id', user.id);

  if (error) throw new Error(error.message);
  revalidatePath('/', 'layout');
}
