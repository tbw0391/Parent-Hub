import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { getCurrentProfile } from '@/lib/auth';
import { getUnreadChatCount } from '@/lib/chat';
import { CHAT_COLOR } from '@/lib/nav';
import { SignOutButton } from '@/components/SignOutButton';
import { UpcomingBanner } from '@/components/UpcomingBanner';
import { Logo } from '@/components/Logo';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  const unreadCount = profile ? await getUnreadChatCount(profile.id) : 0;

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <header className="relative flex items-center justify-between border-b border-acidDim/20 px-4 py-4">
        <Link href="/chat" aria-label="Chat" className="relative rounded-lg p-2 hover:bg-panel">
          <MessageCircle size={24} color={CHAT_COLOR} strokeWidth={2} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>

        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo height={32} href="/" />
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="hidden text-xs text-acidDim sm:inline">
              {profile.display_name} · {profile.role}
            </span>
          )}
          <SignOutButton />
        </div>
      </header>

      <UpcomingBanner />

      <main className="flex-1 px-4 pb-10">{children}</main>
    </div>
  );
}
