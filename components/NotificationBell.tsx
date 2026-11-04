'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import type { NotificationCategory, NotificationItem } from '@/lib/notifications';
import { NOTIFICATION_COLOR } from '@/lib/nav';

const CATEGORY_ORDER: NotificationCategory[] = ['chat', 'prayer_praise', 'poll', 'upcoming'];
const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  chat: 'Messages',
  prayer_praise: 'Prayer & Praise',
  poll: 'Polls',
  upcoming: 'Coming up',
};

export function NotificationBell({
  items,
  totalCount,
}: {
  items: NotificationItem[];
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    entries: items.filter((i) => i.category === category),
  })).filter((g) => g.entries.length > 0);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 hover:bg-panel"
      >
        <Bell size={22} color={NOTIFICATION_COLOR} strokeWidth={2} />
        {totalCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {totalCount > 9 ? '9+' : totalCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-2 max-h-96 w-72 overflow-y-auto rounded-lg border border-acidDim/20 bg-ground shadow-lg"
        >
          {groups.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-acidDim">You&apos;re all caught up 🎉</p>
          ) : (
            groups.map((group) => (
              <div key={group.category} className="border-b border-acidDim/10 last:border-b-0">
                <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-acidDim">
                  {CATEGORY_LABELS[group.category]}
                </p>
                {group.entries.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex flex-col gap-0.5 px-4 py-2 hover:bg-panel"
                  >
                    <span className="text-sm font-medium text-ink">{item.title}</span>
                    {item.subtitle && <span className="text-xs text-acidDim">{item.subtitle}</span>}
                  </Link>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
