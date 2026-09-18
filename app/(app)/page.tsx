import Link from 'next/link';
import { getCurrentProfile, hasRole } from '@/lib/auth';
import { NAV } from '@/lib/nav';
import { PollBanner } from '@/components/PollBanner';
import { PrayerPraiseBanner } from '@/components/PrayerPraiseBanner';

export default async function HomePage() {
  const profile = await getCurrentProfile();
  const items = NAV.filter((item) => !item.minRole || hasRole(profile, item.minRole));

  return (
    <div className="flex flex-col gap-6 py-6">
      <PollBanner />
      <PrayerPraiseBanner />

      <div>
        <h1 className="text-xl font-semibold text-acid">
          Welcome{profile ? `, ${profile.display_name}` : ''}
        </h1>
        <p className="mt-2 text-sm text-acidDim">Pick a section to get started.</p>
      </div>

      <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-lg border border-acidDim/30 bg-panel px-3 py-4 text-center text-sm font-medium text-ink transition hover:border-acid"
            >
              <Icon size={22} color={item.color} strokeWidth={2} aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
