'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase/client';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const ok = !!data.session;
      setAuthed(ok);
      setReady(true);
      if (!ok && pathname !== '/login') router.replace('/login');
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const ok = !!session;
      setAuthed(ok);
      setReady(true);
      if (!ok && pathname !== '/login') router.replace('/login');
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname, router]);

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
  return <>{children}</>;
}
