'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { hasRole } from '@/lib/auth';
import type { Profile } from '@/lib/database.types';

async function resolveTargetId(formData: FormData, userId: string): Promise<string> {
  const targetId = String(formData.get('target_id') ?? '').trim();
  if (!targetId || targetId === userId) return userId;

  const supabase = await createClient();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (hasRole(profile as Profile, 'admin')) return targetId;
  return userId;
}

export async function updateMyDetails(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const targetId = await resolveTargetId(formData, user.id);

  const display_name = String(formData.get('display_name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim() || null;
  const address_line1 = String(formData.get('address_line1') ?? '').trim() || null;
  const city = String(formData.get('city') ?? '').trim() || null;
  const state = String(formData.get('state') ?? '').trim() || null;
  const zip = String(formData.get('zip') ?? '').trim() || null;
  const birthday = String(formData.get('birthday') ?? '').trim() || null;
  const profession = String(formData.get('profession') ?? '').trim() || null;
  const anniversary = String(formData.get('anniversary') ?? '').trim() || null;
  const is_married = formData.get('is_married') === 'yes';
  const spouseNameInput = String(formData.get('spouse_name') ?? '').trim();

  let spouse_id: string | null = null;
  let spouse_name: string | null = null;

  if (is_married && spouseNameInput) {
    spouse_name = spouseNameInput;
    const { data: candidates } = await supabase
      .from('profiles')
      .select('id, display_name')
      .neq('id', targetId)
      .ilike('display_name', spouseNameInput);
    if (candidates && candidates.length === 1) {
      spouse_id = candidates[0].id;
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...(display_name ? { display_name } : {}),
      phone,
      address_line1,
      city,
      state,
      zip,
      birthday,
      profession,
      anniversary,
      is_married,
      spouse_name,
      spouse_id,
    })
    .eq('id', targetId);

  if (error) throw new Error(error.message);
  revalidatePath('/biography', 'layout');
}

export async function uploadPhoto(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const targetId = await resolveTargetId(formData, user.id);

  const file = formData.get('photo');
  if (!(file instanceof File) || file.size === 0) throw new Error('Choose an image first');

  const path = `${targetId}/avatar`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });
  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ photo_path: path })
    .eq('id', targetId);
  if (updateError) throw new Error(updateError.message);

  revalidatePath('/biography', 'layout');
}

export async function addChild(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const targetId = await resolveTargetId(formData, user.id);

  const name = String(formData.get('name') ?? '').trim();
  const birth_date = String(formData.get('birth_date') ?? '').trim();
  if (!name || !birth_date) throw new Error('Name and birth date are required');

  const { error } = await supabase.from('children').insert({ parent_id: targetId, name, birth_date });
  if (error) throw new Error(error.message);
  revalidatePath('/biography', 'layout');
}

export async function deleteChild(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const childId = String(formData.get('child_id') ?? '');
  if (!childId) return;

  const { error } = await supabase.from('children').delete().eq('id', childId);
  if (error) throw new Error(error.message);
  revalidatePath('/biography', 'layout');
}
