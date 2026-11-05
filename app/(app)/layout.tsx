import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { getCurrentProfile } from '@/lib/auth';
import { getUnreadChatCount } from '@/lib/chat';
import { getNotifications } from '@/lib/notifications';
import { CHAT_COLOR } from '@/lib/nav';
import { SignOutButton } from '@/components/SignOutButton';
import { Logo } from '@/components/Logo';
import { NotificationBell } from '@/components/NotificationBell';
import { BackButton } from '@/components/BackButton';
import { PullToRefresh } from '@/components/PullToRefresh';
import { setDisplayName } from './actions';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (profile?.disabled_at) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <Logo height={72} />
        <p className="text-sm text-acidDim">
          Your account has been disabled. Contact an admin if you think this is a mistake.
        </p>
        <SignOutButton />
      </div>
    );
  }

  // New phone signups get a placeholder name ("Parent 1234"); ask for a real one first.
  if (profile && (!profile.display_name.trim() || /^Parent \d{4}$/.test(profile.display_name))) {
    return (
      <div className="mx-auto flex min-h-screen max-w-sm flex-col items-center justify-center gap-4 px-4 text-center">
        <Logo height={72} />
        <h1 className="text-lg font-semibold text-acid">Welcome to Parent Hub!</h1>
        <form action={setDisplayName} className="flex w-full flex-col gap-3">
          <label htmlFor="display_name" className="text-sm text-acidDim">
            What&apos;s your name?
          </label>
          <input
            id="display_name"
            name="display_name"
            required
            autoComplete="name"
            placeholder="First and last name"
            className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
          />
          <button type="submit" className="rounded-md bg-pumpkin px-4 py-2 font-medium text-ground">
            Continue
          </button>
        </form>
      </div>
    );
  }

  const unreadCount = profile ? await getUnreadChatCount(profile.id) : 0;
  const { items: notificationItems, totalCount: notificationCount } = profile
    ? await getNotifications(profile.id, unreadCount)
    : { items: [], totalCount: 0 };

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col">
      <PullToRefresh />
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
          <Logo height={64} href="/" />
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell items={notificationItems} totalCount={notificationCount} />
          {profile && (
            <span className="hidden text-xs text-acidDim sm:inline">
              {profile.display_name} · {profile.role}
            </span>
          )}
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 px-4 pb-10">
        <BackButton />
        {children}
      </main>
    </div>
  );
}
