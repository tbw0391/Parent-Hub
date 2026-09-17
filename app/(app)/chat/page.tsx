import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getCurrentProfile } from '@/lib/auth';
import type { ChatGroup, ChatGroupMember, Profile } from '@/lib/database.types';
import { createChat } from './actions';

export default async function ChatListPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const { data: memberships } = await supabase
    .from('chat_group_members')
    .select('group_id')
    .eq('user_id', profile.id);

  const groupIds = (memberships as Pick<ChatGroupMember, 'group_id'>[] | null)?.map((m) => m.group_id) ?? [];

  const { data: groups } = groupIds.length
    ? await supabase
        .from('chat_groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false })
    : { data: [] as ChatGroup[] };

  const { data: otherParents } = await supabase
    .from('profiles')
    .select('id, display_name')
    .neq('id', profile.id)
    .order('display_name', { ascending: true });

  return (
    <div className="flex flex-col gap-6 py-6">
      <h1 className="text-xl font-semibold text-acid">Chat</h1>

      <form action={createChat} className="flex flex-col gap-3 rounded-lg border border-acidDim/30 bg-panel p-4">
        <h2 className="text-sm font-medium text-acidDim">Start a new chat</h2>
        <input
          name="group_name"
          placeholder="Group name (leave blank for a 1:1 chat)"
          className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
        />
        <div className="flex max-h-40 flex-col gap-1 overflow-y-auto rounded-md border border-acidDim/40 bg-ground p-2">
          {(otherParents as Pick<Profile, 'id' | 'display_name'>[] | null)?.length ? (
            (otherParents as Pick<Profile, 'id' | 'display_name'>[]).map((p) => (
              <label key={p.id} className="flex items-center gap-2 px-1 py-1 text-sm text-ink">
                <input type="checkbox" name="member_ids" value={p.id} /> {p.display_name}
              </label>
            ))
          ) : (
            <p className="p-1 text-xs text-acidDim">No other parents yet.</p>
          )}
        </div>
        <button type="submit" className="self-start rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
          Start chat
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {(groups as ChatGroup[] | null)?.length ? (
          (groups as ChatGroup[]).map((group) => (
            <Link
              key={group.id}
              href={`/chat/${group.id}`}
              className="rounded-lg border border-acidDim/20 bg-panel px-4 py-3 text-sm text-ink hover:border-acid hover:text-acid"
            >
              {group.name} {group.is_dm && <span className="text-xs text-acidDim">· direct message</span>}
            </Link>
          ))
        ) : (
          <p className="text-sm text-acidDim">No chats yet — start one above.</p>
        )}
      </div>
    </div>
  );
}
