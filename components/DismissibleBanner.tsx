'use client';

import { useEffect, useState } from 'react';

export function DismissibleBanner({
  storageKey,
  className = 'mx-4 mt-4',
  children,
}: {
  storageKey: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(storageKey) === '1');
    } catch {
      setDismissed(false);
    }
  }, [storageKey]);

  if (dismissed) return null;

  return (
    <div className={`relative rounded-lg border border-pumpkin/40 bg-pumpkin/10 px-4 py-3 ${className}`}>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => {
          try {
            localStorage.setItem(storageKey, '1');
          } catch {
            // per-viewer convenience only; fine if storage is unavailable
          }
          setDismissed(true);
        }}
        className="absolute right-3 top-3 text-xs text-acidDim hover:text-pumpkin"
      >
        ✕
      </button>
      {children}
    </div>
  );
}
