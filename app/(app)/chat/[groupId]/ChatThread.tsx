'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { ChatGroup, Message } from '@/lib/database.types';
import { sendMessage, markChatRead } from '../actions';

export function ChatThread({
  group,
  initialMessages,
  nameById,
  currentUserId,
}: {
  group: ChatGroup;
  initialMessages: Message[];
  nameById: Record<string, string>;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [names, setNames] = useState(nameById);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages-${group.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${group.id}` },
        async (payload) => {
          const message = payload.new as Message;
          setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));

          if (!names[message.sender_id]) {
            const { data } = await supabase
              .from('profiles')
              .select('display_name')
              .eq('id', message.sender_id)
              .single();
            if (data) setNames((prev) => ({ ...prev, [message.sender_id]: data.display_name }));
          }

          if (message.sender_id !== currentUserId) {
            markChatRead(group.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.id]);

  useEffect(() => {
    markChatRead(group.id);
  }, [group.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSubmit(formData: FormData) {
    const body = String(formData.get('body') ?? '').trim();
    if (!body) return;
    const form = document.getElementById('chat-form') as HTMLFormElement | null;
    form?.reset();
    await sendMessage(formData);
  }

  return (
    <div className="flex h-[calc(100vh-260px)] flex-col py-6">
      <div className="mb-3 flex items-center gap-2">
        <Link href="/chat" className="text-sm text-acidDim hover:text-acid">
          ← Chats
        </Link>
        <h1 className="text-lg font-semibold text-acid">{group.name}</h1>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-acidDim/20 bg-panel p-4">
        {messages.length === 0 && <p className="text-sm text-acidDim">No messages yet — say hello.</p>}
        {messages.map((message) => {
          const mine = message.sender_id === currentUserId;
          return (
            <div key={message.id} className={'flex flex-col ' + (mine ? 'items-end' : 'items-start')}>
              <span className="text-[11px] text-acidDim">{names[message.sender_id] ?? '...'}</span>
              <span
                className={
                  'max-w-[80%] rounded-lg px-3 py-2 text-sm ' +
                  (mine ? 'bg-acid/20 text-ink' : 'bg-ground text-ink')
                }
              >
                {message.body}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form id="chat-form" action={handleSubmit} className="mt-3 flex gap-2">
        <input type="hidden" name="group_id" value={group.id} />
        <input
          name="body"
          required
          placeholder="Type a message..."
          autoComplete="off"
          className="flex-1 rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
        />
        <button type="submit" className="rounded-md bg-pumpkin px-4 py-2 text-sm font-medium text-ground">
          Send
        </button>
      </form>
    </div>
  );
}
