'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import type { Profile, Role } from '@/lib/database.types';

type Supabase = Awaited<ReturnType<typeof createClient>>;

async function requireAdmin(): Promise<Profile> {
  const me = await getCurrentProfile();
  if (!me || !hasRole(me, 'admin')) throw new Error('Admins only');
  return me;
}

async function getAdminsGroupId(supabase: Supabase, creatorId: string): Promise<string> {
  const { data: existing } = await supabase.from('chat_groups').select('id').eq('name', 'Admins').maybeSingle();
  if (existing) return existing.id as string;

  const { data: created, error } = await supabase
    .from('chat_groups')
    .insert({ name: 'Admins', is_dm: false, created_by: creatorId })
    .select('id')
    .single();
  if (error || !created) throw new Error(error?.message ?? 'Could not create the Admins group');
  return created.id as string;
}

export async function updateUserRole(formData: FormData) {
  const me = await requireAdmin();
  const supabase = await createClient();

  const targetId = String(formData.get('target_id') ?? '');
  const role = String(formData.get('role') ?? '') as Role;
  if (!targetId || !['parent', 'power_user', 'admin'].includes(role)) throw new Error('Invalid role');
  if (targetId === me.id) throw new Error("You can't change your own role");

  const { data: before } = await supabase.from('profiles').select('role').eq('id', targetId).single();

  const { error } = await supabase.from('profiles').update({ role }).eq('id', targetId);
  if (error) throw new Error(error.message);

  const wasAdmin = before?.role === 'admin';
  const isAdmin = role === 'admin';
  if (wasAdmin !== isAdmin) {
    const groupId = await getAdminsGroupId(supabase, me.id);
    if (isAdmin) {
      await supabase
        .from('chat_group_members')
        .upsert({ group_id: groupId, user_id: targetId }, { onConflict: 'group_id,user_id' });
    } else {
      await supabase.from('chat_group_members').delete().eq('group_id', groupId).eq('user_id', targetId);
    }
  }

  revalidatePath('/admin');
  revalidatePath('/biography');
  revalidatePath('/chat');
}

export async function setUserDisabled(formData: FormData) {
  const me = await requireAdmin();
  const supabase = await createClient();

  const targetId = String(formData.get('target_id') ?? '');
  const disabled = formData.get('disabled') === 'true';
  if (!targetId) throw new Error('Missing target');
  if (targetId === me.id) throw new Error("You can't disable your own account");

  const { error } = await supabase
    .from('profiles')
    .update({ disabled_at: disabled ? new Date().toISOString() : null })
    .eq('id', targetId);
  if (error) throw new Error(error.message);

  revalidatePath('/admin');
  revalidatePath('/biography');
}

export async function deleteArticle(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const { error } = await supabase.from('articles').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/articles');
}

export async function deleteScheduleEvent(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const { error } = await supabase.from('schedule_events').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/schedule');
}

export async function deleteLesson(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/lessons');
}

export async function deletePoll(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const { error } = await supabase.from('polls').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/polls');
}

export async function deleteTechRecommendation(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const { error } = await supabase.from('tech_recommendations').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/admin');
  revalidatePath('/technology');
}
