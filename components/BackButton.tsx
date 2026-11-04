'use client';

import { usePathname, useRouter } from 'next/navigation';

// Pages that already render their own back link.
const HAS_OWN_BACK_LINK = [/^\/biography\/[^/]+$/, /^\/chat\/[^/]+$/];

export function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/' || HAS_OWN_BACK_LINK.some((re) => re.test(pathname))) return null;

  function handleClick() {
    // Opened straight from a link or bookmark, there's no in-app page to go back to.
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <button onClick={handleClick} className="pt-4 text-sm text-acidDim hover:text-acid">
      ← Back
    </button>
  );
}
