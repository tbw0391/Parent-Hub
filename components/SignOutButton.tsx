'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function SignOutButton() {
  const router = useRouter();

  async function handleClick() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-md border border-acidDim/40 px-3 py-1.5 text-xs text-acidDim hover:border-acid hover:text-acid"
    >
      Sign out
    </button>
  );
}
