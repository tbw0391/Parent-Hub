'use client';

import { useTransition } from 'react';
import { ackEntry } from '@/app/(app)/prayer-praise/actions';

export function PrayerPraiseBannerDismiss({ entryId }: { entryId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      aria-label="Dismiss"
      disabled={pending}
      onClick={() => {
        const formData = new FormData();
        formData.set('entry_id', entryId);
        startTransition(() => {
          ackEntry(formData);
        });
      }}
      className="absolute right-3 top-3 text-xs text-acidDim hover:text-pumpkin disabled:opacity-60"
    >
      ✕
    </button>
  );
}
