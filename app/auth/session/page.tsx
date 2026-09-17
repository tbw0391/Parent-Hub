'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SessionFromHashPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) {
      setError('No session tokens found in the link.');
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) {
        setError(error.message);
      } else {
        router.replace('/');
      }
    });
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-sm text-acidDim">
      {error ? `Sign-in failed: ${error}` : 'Signing you in…'}
    </main>
  );
}
