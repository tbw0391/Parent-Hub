'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Logo } from '@/components/Logo';

// Accepts "(614) 555-1234", "614-555-1234", "+1 614 555 1234", etc. and returns
// E.164. Bare 10-digit numbers are assumed to be US.
function toE164(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (input.trim().startsWith('+')) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  return `+${digits}`;
}

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError('');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone: toE164(phone) });
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
    const { error } = await supabase.auth.verifyOtp({ phone: toE164(phone), token: code, type: 'sms' });
    if (error) {
      setPending(false);
      setError(error.message);
    } else {
      router.replace('/');
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm p-8">
        <div className="mb-6 flex justify-center motion-safe:animate-logo-in">
          <Logo height={120} />
        </div>

        {step === 'code' ? (
          <form onSubmit={handleVerifyCode} className="flex flex-col gap-3">
            <p className="mb-2 text-sm text-acidDim">
              We texted a 6-digit code to {phone}. Enter it below to sign in.
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
                setStep('phone');
                setCode('');
                setError('');
              }}
              className="text-xs text-acidDim underline"
            >
              Use a different number
            </button>
          </form>
        ) : (
          <>
            <p className="mb-6 text-sm text-acidDim">
              Enter your cell number and we&apos;ll text you a 6-digit code to sign in — no password needed.
            </p>
            <form onSubmit={handleSendCode} className="flex flex-col gap-3">
              <label htmlFor="phone" className="text-xs uppercase tracking-wide text-acidDim">
                Cell phone
              </label>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 555-1234"
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
