'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ScheduleRecurrence } from '@/lib/database.types';

const RECURRENCE_VALUES: ScheduleRecurrence[] = ['none', 'weekly', 'monthly', 'yearly'];

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
  const recurrenceRaw = String(formData.get('recurrence') ?? 'none');
  const recurrence: ScheduleRecurrence = RECURRENCE_VALUES.includes(recurrenceRaw as ScheduleRecurrence)
    ? (recurrenceRaw as ScheduleRecurrence)
    : 'none';

  if (!title || !starts_at) throw new Error('Title and date/time are required');

  const { error } = await supabase
    .from('schedule_events')
    .insert({ author_id: user.id, title, description, starts_at, location, recurrence });

  if (error) throw new Error(error.message);
  revalidatePath('/schedule');
  revalidatePath('/', 'layout');
}

export async function deleteEvent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const event_id = String(formData.get('event_id') ?? '');
  if (!event_id) throw new Error('Missing event');

  const { error } = await supabase.from('schedule_events').delete().eq('id', event_id);
  if (error) throw new Error(error.message);
  revalidatePath('/schedule');
  revalidatePath('/', 'layout');
}
