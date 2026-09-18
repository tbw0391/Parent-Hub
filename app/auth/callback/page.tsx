'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const linkError = searchParams.get('error_description') || searchParams.get('error');
    if (linkError) {
      setError(linkError);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      setError('No sign-in code found in the link.');
      return;
    }

    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(error.message);
      } else {
        router.replace('/');
      }
    });
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-acidDim">
      {error ? `That sign-in link didn't work: ${error}. Request a new one from the login page.` : 'Signing you in…'}
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4 text-sm text-acidDim">
          Signing you in…
        </main>
      }
    >
      <CallbackHandler />
    </Suspense>
  );
}
