'use client';

import { useEffect, useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
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
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploading(true);
    setUploadError('');
    try {
      const image = await shrinkImage(file);
      const path = `${group.id}/${currentUserId}/${crypto.randomUUID()}.jpg`;
      const supabase = createClient();
      const { error } = await supabase.storage.from('chat-images').upload(path, image, { contentType: 'image/jpeg' });
      if (error) throw error;

      const formData = new FormData();
      formData.set('group_id', group.id);
      formData.set('image_path', path);
      await sendMessage(formData);
    } catch {
      setUploadError("Couldn't send that photo. Please try again.");
    } finally {
      setUploading(false);
    }
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
              {message.image_path && <ChatImage path={message.image_path} />}
              {message.body && (
                <span
                  className={
                    'max-w-[80%] rounded-lg px-3 py-2 text-sm ' +
                    (mine ? 'bg-acid/20 text-ink' : 'bg-ground text-ink')
                  }
                >
                  {message.body}
                </span>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form id="chat-form" action={handleSubmit} className="mt-3 flex gap-2">
        <input type="hidden" name="group_id" value={group.id} />
        <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Add a photo"
          className="rounded-md border border-acidDim/40 px-3 text-acidDim hover:border-acid hover:text-acid disabled:opacity-50"
        >
          <ImagePlus size={20} />
        </button>
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
      {uploading && <p className="mt-1 text-xs text-acidDim">Sending photo…</p>}
      {uploadError && <p className="mt-1 text-xs text-red-400">{uploadError}</p>}
    </div>
  );
}

function ChatImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    createClient()
      .storage.from('chat-images')
      .createSignedUrl(path, 3600)
      .then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);

  if (!url) return <div className="h-40 w-40 animate-pulse rounded-lg bg-acidDim/10" />;

  return (
    <a href={url} target="_blank" rel="noreferrer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Photo" className="max-h-64 max-w-[80%] rounded-lg object-cover" />
    </a>
  );
}

// Phone photos are often 5-10MB; scale to at most 1600px and re-encode as JPEG.
async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))), 'image/jpeg', 0.85)
  );
}
