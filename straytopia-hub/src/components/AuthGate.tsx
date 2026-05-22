'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [roleOk, setRoleOk] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      // UI-only preview mode.
      setAuthed(true);
      setReady(true);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const ok = !!data.session;
      setAuthed(ok);
      setReady(true);
      if (!ok && pathname !== '/login') router.replace('/login');
      if (ok && data.session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', data.session.user.id)
          .maybeSingle();
        if (!mounted) return;
        setRoleOk(profile?.role === 'ops');
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const ok = !!session;
      setAuthed(ok);
      setReady(true);
      if (!ok && pathname !== '/login') router.replace('/login');
      if (ok && session) {
        void supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data }) => setRoleOk(data?.role === 'ops'));
      } else {
        setRoleOk(true);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname, router, supabase]);

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--paper)]">
        <div className="rounded-[24px] border-[2.5px] border-b-[4px] border-[var(--hairline)] bg-[var(--surface)] p-6 text-center">
          <div className="fredoka text-[18px] font-semibold">Loading…</div>
          <div className="mt-1 text-sm font-semibold text-[var(--muted)]">Checking your session</div>
        </div>
      </div>
    );
  }

  if (!authed) return null;

  if (!roleOk) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[var(--paper)] px-4 py-10">
        <div className="w-full max-w-2xl">
          <div className="rounded-[24px] border border-[var(--border)] bg-white/70 p-6 shadow-[var(--shadow-sm)]">
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Access</div>
            <div className="fredoka mt-2 text-[22px] font-semibold">Ops role required</div>
            <div className="mt-2 text-sm font-semibold text-[var(--muted)]">
              Your Supabase user is authenticated, but it does not have an `ops` profile.
              Create a row in `public.user_profiles` with `user_id = auth.users.id` and `role = &apos;ops&apos;`.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
