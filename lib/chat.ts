import { createClient } from '@/lib/supabase/server';
import type { ChatGroupMember, Message } from '@/lib/database.types';

export async function getUnreadChatCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { data: membershipsData } = await supabase
    .from('chat_group_members')
    .select('*')
    .eq('user_id', userId);
  const memberships = (membershipsData as ChatGroupMember[] | null) ?? [];
  if (memberships.length === 0) return 0;

  const groupIds = memberships.map((m) => m.group_id);
  const oldestReadAt = memberships.reduce(
    (min, m) => (m.last_read_at < min ? m.last_read_at : min),
    memberships[0].last_read_at
  );

  const { data: messagesData } = await supabase
    .from('messages')
    .select('*')
    .in('group_id', groupIds)
    .neq('sender_id', userId)
    .gt('created_at', oldestReadAt);
  const messages = (messagesData as Message[] | null) ?? [];

  const lastReadByGroup = new Map(memberships.map((m) => [m.group_id, m.last_read_at]));

  return messages.filter((m) => {
    const lastRead = lastReadByGroup.get(m.group_id);
    return !lastRead || m.created_at > lastRead;
  }).length;
}
