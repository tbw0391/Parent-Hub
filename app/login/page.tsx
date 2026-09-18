'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setPending(false);
    if (error) {
      setError(error.message);
    } else {
      setStep('code');
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) {
      setPending(false);
      setError(error.message);
    } else {
      router.replace('/');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-acidDim/30 bg-panel p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <Logo height={120} />
        </div>

        {step === 'code' ? (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
            <p className="mb-2 text-sm text-acidDim">
              We sent a 6-digit code to {email}. Enter it below to sign in.
            </p>
            <label htmlFor="code" className="text-xs uppercase tracking-wide text-acidDim">
              Sign-in code
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
            />
            <button
              type="submit"
              disabled={pending}
              className="mt-2 rounded-md bg-pumpkin px-4 py-2 font-medium text-ground disabled:opacity-60"
            >
              {pending ? 'Verifying…' : 'Sign in'}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setCode('');
                setError('');
              }}
              className="text-xs text-acidDim underline"
            >
              Use a different email
            </button>
          </form>
        ) : (
          <>
            <p className="mb-6 text-sm text-acidDim">
              Enter your email and we&apos;ll send you a 6-digit code to sign in — no password needed.
            </p>
            <form onSubmit={handleSendCode} className="flex flex-col gap-3">
              <label htmlFor="email" className="text-xs uppercase tracking-wide text-acidDim">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-md border border-acidDim/40 bg-ground px-3 py-2 text-ink outline-none focus:border-acid"
              />
              <button
                type="submit"
                disabled={pending}
                className="mt-2 rounded-md bg-pumpkin px-4 py-2 font-medium text-ground disabled:opacity-60"
              >
                {pending ? 'Sending…' : 'Send code'}
              </button>
              {error && <p className="text-sm text-red-400">{error}</p>}
            </form>
          </>
        )}
      </div>
    </main>
  );
}
