'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createPoll(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const question = String(formData.get('question') ?? '').trim();
  const options = formData
    .getAll('options')
    .map((o) => String(o).trim())
    .filter(Boolean);

  if (!question) throw new Error('Question is required');
  if (options.length < 2) throw new Error('Add at least two options');

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ author_id: user.id, question })
    .select()
    .single();

  if (pollError || !poll) throw new Error(pollError?.message ?? 'Could not create poll');

  const { error: optionsError } = await supabase.from('poll_options').insert(
    options.map((label, position) => ({ poll_id: poll.id, label, position }))
  );

  if (optionsError) throw new Error(optionsError.message);
  revalidatePath('/polls');
}

export async function castVote(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const poll_id = String(formData.get('poll_id') ?? '');
  const option_id = String(formData.get('option_id') ?? '');
  if (!poll_id || !option_id) throw new Error('Missing vote');

  const { error } = await supabase
    .from('poll_votes')
    .upsert({ poll_id, option_id, voter_id: user.id }, { onConflict: 'poll_id,voter_id' });

  if (error) throw new Error(error.message);
  revalidatePath('/polls');
}
