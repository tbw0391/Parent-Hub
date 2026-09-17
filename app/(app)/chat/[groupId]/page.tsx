import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { ChatGroup, Message, Profile } from '@/lib/database.types';
import { ChatThread } from './ChatThread';

export default async function ChatThreadPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { data: membership } = await supabase
    .from('chat_group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', profile.id)
    .maybeSingle();

  if (!membership) notFound();

  const { data: group } = await supabase.from('chat_groups').select('*').eq('id', groupId).single();
  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true });

  const senderIds = Array.from(new Set((messages as Message[] | null)?.map((m) => m.sender_id) ?? []));
  const { data: senders } = senderIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', senderIds)
    : { data: [] as Pick<Profile, 'id' | 'display_name'>[] };
  const nameById = Object.fromEntries((senders ?? []).map((s) => [s.id, s.display_name]));

  return (
    <ChatThread
      group={group as ChatGroup}
      initialMessages={(messages as Message[]) ?? []}
      nameById={nameById}
      currentUserId={profile.id}
    />
  );
}
