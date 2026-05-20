'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardList, Hospital, Layers3, LogOut, Map, ShieldAlert, Users } from 'lucide-react';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

const nav = [
  { href: '/overview', label: 'Overview', icon: BarChart3 },
  { href: '/cases', label: 'Cases', icon: ShieldAlert },
  { href: '/tasks', label: 'Tasks', icon: ClipboardList },
  { href: '/shelters', label: 'Shelters', icon: Hospital },
  { href: '/citizens', label: 'Citizens', icon: Users },
  { href: '/blocks', label: 'Blocks', icon: Map },
  { href: '/mel', label: 'MEL', icon: Layers3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured() || !supabase) {
      setEmail('demo@local');
      return;
    }
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  const active = useMemo(() => nav.find((n) => pathname?.startsWith(n.href))?.label ?? 'Ops Hub', [pathname]);

  return (
    <div className="min-h-dvh bg-[var(--paper)] text-[var(--ink)]">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-4 px-4 py-4 md:grid-cols-[260px_1fr] md:gap-6 md:px-6 md:py-6">
        <aside className="rounded-[28px] border-[2.5px] border-b-[4px] border-[var(--hairline)] bg-[var(--surface)] p-4 md:sticky md:top-6 md:h-[calc(100dvh-3rem)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[16px] bg-[var(--jungle-soft)]">
                <span className="fredoka text-[18px] font-semibold text-[var(--jungle-deep)]">S</span>
              </div>
              <div>
                <div className="fredoka text-[16px] font-semibold leading-tight">Straytopia</div>
                <div className="text-[12px] font-extrabold tracking-widest uppercase text-[var(--muted)]">Ops Hub</div>
              </div>
            </div>
          </div>

          <nav className="mt-4 grid gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 rounded-[16px] px-3 py-2.5 text-sm font-extrabold',
                    isActive
                      ? 'bg-[var(--paper2)] text-[var(--ink)]'
                      : 'text-[var(--ink2)] hover:bg-[var(--paper2)]/70'
                  )}
                >
                  <Icon size={18} className={clsx(isActive ? 'text-[var(--jungle-deep)]' : 'text-[var(--muted)]')} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 rounded-[18px] border border-[var(--hairline)] bg-[var(--paper)] p-3">
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">Signed in</div>
            <div className="mt-1 truncate text-sm font-bold text-[var(--ink2)]">{email ?? 'Unknown'}</div>
            <button
              onClick={async () => {
                if (!supabase) return;
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-[14px] border border-[var(--hairline)] bg-[var(--surface)] px-3 py-2 text-xs font-black tracking-widest uppercase text-[var(--ink2)] hover:bg-[var(--paper2)]"
              type="button"
            >
              <LogOut size={14} />
              {isSupabaseConfigured() ? 'Sign out' : 'Demo mode'}
            </button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="mb-4 flex flex-col gap-2 md:mb-6">
            <div className="text-[11px] font-black tracking-widest uppercase text-[var(--muted)]">{active}</div>
            <div className="fredoka text-[28px] font-semibold leading-tight text-[var(--ink)]">{active}</div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
