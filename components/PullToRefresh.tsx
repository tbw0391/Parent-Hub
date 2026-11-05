'use client';

import { useEffect, useState } from 'react';

const THRESHOLD = 70;

// Home-screen (standalone) installs have no browser refresh button or native
// pull-to-refresh, so add our own. Browsers already have one; skip it there.
export function PullToRefresh() {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (!standalone) return;

    let startY: number | null = null;
    let distance = 0;

    function onStart(e: TouchEvent) {
      startY = window.scrollY <= 0 ? e.touches[0].clientY : null;
      distance = 0;
    }
    function onMove(e: TouchEvent) {
      if (startY === null) return;
      distance = Math.max(0, e.touches[0].clientY - startY);
      setPull(Math.min(distance, THRESHOLD * 1.5));
    }
    function onEnd() {
      if (startY !== null && distance >= THRESHOLD) {
        setRefreshing(true);
        // A full reload (not router.refresh) so new deploys' code is picked up too.
        window.location.reload();
      } else {
        setPull(0);
      }
      startY = null;
    }

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
    };
  }, []);

  if (pull === 0 && !refreshing) return null;

  const ready = pull >= THRESHOLD || refreshing;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center"
      style={{ transform: `translateY(${refreshing ? 24 : pull / 2}px)` }}
    >
      <span className="rounded-full border border-acidDim/30 bg-ground px-3 py-1 text-xs text-acidDim shadow">
        {refreshing ? 'Refreshing…' : ready ? 'Release to refresh' : 'Pull to refresh'}
      </span>
    </div>
  );
}
