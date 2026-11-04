import Link from 'next/link';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import { NAV } from '@/lib/nav';
import { PollBanner } from '@/components/PollBanner';
import { PrayerPraiseBanner } from '@/components/PrayerPraiseBanner';
import { UpcomingBanner } from '@/components/UpcomingBanner';
import { VerseOfTheDay } from '@/components/VerseOfTheDay';

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const items = NAV.filter((item) => !item.minRole || hasRole(profile, item.minRole));

  return (
    <div className="flex flex-col gap-6 py-6">
      <VerseOfTheDay />
      <PollBanner />
      <PrayerPraiseBanner />
      <UpcomingBanner />

      <div>
        <h1 className="text-xl font-semibold text-acid">
          Welcome{profile ? `, ${profile.display_name}` : ''}
        </h1>
        <p className="mt-2 text-sm text-acidDim">Pick a section to get started.</p>
      </div>

      <nav className="grid grid-cols-3 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              // Tint each button with its icon color: ~10% fill, ~25% border, solid border on hover.
              style={{ '--c': item.color, backgroundColor: `${item.color}1a`, borderColor: `${item.color}40` } as React.CSSProperties}
              className="flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center text-xs font-medium text-ink transition hover:!border-[color:var(--c)]"
            >
              <Icon size={18} color={item.color} strokeWidth={2} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 flex flex-col items-center gap-2 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/qr/parent-hub.svg" alt="QR code for Parent Hub" width={160} height={160} />
        <p className="text-xs text-acidDim">Scan to open Parent Hub</p>
      </div>
    </div>
  );
}
