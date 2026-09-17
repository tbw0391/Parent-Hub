'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function createChat(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const memberIds = formData.getAll('member_ids').map(String).filter(Boolean);
  const groupName = String(formData.get('group_name') ?? '').trim();

  if (memberIds.length === 0) throw new Error('Pick at least one other parent');

  const allMembers = Array.from(new Set([user.id, ...memberIds]));
  const isDm = allMembers.length === 2 && !groupName;

  let name = groupName;
  if (!name) {
    if (isDm) {
      const { data: other } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', memberIds[0])
        .single();
      name = other?.display_name ?? 'Direct message';
    } else {
      name = 'New group';
    }
  }

  const { data: group, error: groupError } = await supabase
    .from('chat_groups')
    .insert({ name, is_dm: isDm, created_by: user.id })
    .select()
    .single();

  if (groupError || !group) throw new Error(groupError?.message ?? 'Could not create chat');

  const { error: memberError } = await supabase
    .from('chat_group_members')
    .insert(allMembers.map((id) => ({ group_id: group.id, user_id: id })));

  if (memberError) throw new Error(memberError.message);

  redirect(`/chat/${group.id}`);
}

export async function sendMessage(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');

  const group_id = String(formData.get('group_id') ?? '');
  const body = String(formData.get('body') ?? '').trim();
  if (!group_id || !body) return;

  const { error } = await supabase.from('messages').insert({ group_id, sender_id: user.id, body });
  if (error) throw new Error(error.message);
}

export async function markChatRead(groupId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('chat_group_members')
    .update({ last_read_at: new Date().toISOString() })
    .eq('group_id', groupId)
    .eq('user_id', user.id);
}
