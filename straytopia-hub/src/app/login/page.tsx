'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function LoginPage() {
  const supabase = getSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/cases');
    });
  }, [router]);

  return (
    <div className="grid min-h-dvh place-items-center bg-[var(--paper)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-5 text-center">
          <div className="fredoka text-[34px] font-semibold tracking-tight">Ops Hub</div>
          <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Sign in to manage cases and tasks</div>
        </div>

        <Card className="p-5">
          <label className="block text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-4 py-3 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--jungle)]"
            placeholder="ops@straytopia.org"
          />

          <label className="mt-4 block text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            className="mt-2 w-full rounded-[16px] border border-[var(--hairline2)] bg-[var(--paper)] px-4 py-3 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--jungle)]"
            placeholder="••••••••"
          />

          {error && (
            <div className="mt-4 rounded-[16px] border border-[color-mix(in_srgb,var(--coral)_30%,transparent)] bg-[var(--coral-soft)] px-4 py-3 text-sm font-semibold text-[var(--coral-deep)]">
              {error}
            </div>
          )}

          <div className="mt-5">
            <Button
              size="lg"
              className="w-full"
              disabled={!email || !password || busy}
              onClick={async () => {
                setBusy(true);
                setError(null);
                const { error } = await supabase.auth.signInWithPassword({
                  email,
                  password,
                });
                setBusy(false);
                if (error) {
                  setError(error.message);
                  return;
                }
                router.replace('/cases');
              }}
            >
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </Card>

        <div className="mt-4 text-center text-xs font-semibold text-[var(--muted)]">
          Create an Ops user in Supabase Auth to sign in.
        </div>
      </div>
    </div>
  );
}
