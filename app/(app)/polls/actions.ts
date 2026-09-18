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
  const allowMultiple = formData.get('allow_multiple') === 'on';
  const options = formData
    .getAll('options')
    .map((o) => String(o).trim())
    .filter(Boolean);

  if (!question) throw new Error('Question is required');
  if (options.length < 2) throw new Error('Add at least two options');

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({ author_id: user.id, question, allow_multiple: allowMultiple })
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

  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('closed_at, allow_multiple')
    .eq('id', poll_id)
    .single();
  if (pollError || !poll) throw new Error(pollError?.message ?? 'Poll not found');
  if (poll.closed_at) throw new Error('This poll is closed');

  if (poll.allow_multiple) {
    const { data: existing } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', poll_id)
      .eq('option_id', option_id)
      .eq('voter_id', user.id)
      .maybeSingle();

    const { error } = existing
      ? await supabase.from('poll_votes').delete().eq('id', existing.id)
      : await supabase.from('poll_votes').insert({ poll_id, option_id, voter_id: user.id });
    if (error) throw new Error(error.message);
  } else {
    const { error: deleteError } = await supabase
      .from('poll_votes')
      .delete()
      .eq('poll_id', poll_id)
      .eq('voter_id', user.id);
    if (deleteError) throw new Error(deleteError.message);

    const { error: insertError } = await supabase
      .from('poll_votes')
      .insert({ poll_id, option_id, voter_id: user.id });
    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath('/polls');
  revalidatePath('/', 'layout');
}

export async function setPollClosed(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const poll_id = String(formData.get('poll_id') ?? '');
  const closed = formData.get('closed') === 'true';
  if (!poll_id) throw new Error('Missing poll');

  const { error } = await supabase
    .from('polls')
    .update({ closed_at: closed ? new Date().toISOString() : null })
    .eq('id', poll_id);

  if (error) throw new Error(error.message);
  revalidatePath('/polls');
  revalidatePath('/', 'layout');
}

export async function deletePoll(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const poll_id = String(formData.get('poll_id') ?? '');
  if (!poll_id) throw new Error('Missing poll');

  const { error } = await supabase.from('polls').delete().eq('id', poll_id);
  if (error) throw new Error(error.message);
  revalidatePath('/polls');
  revalidatePath('/', 'layout');
}
