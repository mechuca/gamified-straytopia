"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardList, Hospital, Layers3, LogOut, Map, Search, ShieldAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
    <div className="min-h-dvh text-[var(--ink)]">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] items-center gap-5 px-4 py-4 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[14px] bg-[var(--jungle-soft)] shadow-[var(--shadow-sm)]">
              <span className="fredoka text-[18px] font-semibold text-[var(--jungle-deep)]">S</span>
            </div>
            <div>
              <div className="fredoka text-[18px] font-semibold leading-tight">Straytopia</div>
              <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Operations</div>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-2 md:flex">
            {nav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'rounded-full px-4 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[var(--ink)] text-white shadow-[var(--shadow-md)]'
                      : 'text-[var(--ink2)] hover:bg-white/70'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-[var(--muted)] md:flex">
              <Search size={16} />
              <span className="select-none">Search</span>
              <span className="mono ml-2 rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-[11px] text-[var(--muted)]">⌘K</span>
            </div>

            <div className="hidden text-right md:block">
              <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Account</div>
              <div className="max-w-[220px] truncate text-sm font-semibold text-[var(--ink2)]">{email ?? 'Unknown'}</div>
            </div>

            <Button
              variant="paper"
              size="sm"
              onClick={async () => {
                if (!supabase) return;
                await supabase.auth.signOut();
                router.push('/login');
              }}
              disabled={!isSupabaseConfigured()}
              title={isSupabaseConfigured() ? 'Sign out' : 'Demo mode'}
              type="button"
            >
              <LogOut size={14} />
              {isSupabaseConfigured() ? 'Sign out' : 'Demo'}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">{active}</div>
            <h1 className="fredoka mt-2 text-[48px] font-semibold tracking-tight">{active}</h1>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--ink2)] shadow-[var(--shadow-sm)]">
              Jan 01 – Jul 31
            </div>
            <div className="text-sm font-semibold text-[var(--muted)]">compared to</div>
            <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--ink2)] shadow-[var(--shadow-sm)]">
              Aug 01 – Dec 31
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
