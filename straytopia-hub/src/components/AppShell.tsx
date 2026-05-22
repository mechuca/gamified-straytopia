"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { BarChart3, ClipboardList, Hospital, Image, Layers3, ListChecks, LogOut, Map, Search, ShieldAlert, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

const nav = [
  { href: '/action-queue', label: 'Action Queue', icon: ListChecks },
  { href: '/overview', label: 'Command', icon: BarChart3 },
  { href: '/cases', label: 'Reports', icon: ShieldAlert },
  { href: '/tasks', label: 'Field Work', icon: ClipboardList },
  { href: '/proofs', label: 'Evidence', icon: Image },
  { href: '/shelters', label: 'Partners', icon: Hospital },
  { href: '/citizens', label: 'Community', icon: Users },
  { href: '/blocks', label: 'Map', icon: Map },
  { href: '/mel', label: 'Impact', icon: Layers3 },
];

const pageCopy: Record<string, string> = {
  'Action Queue': 'The fastest route to the next decision: triage, assign, verify, or escalate.',
  Command: 'Live health of the rescue network, backlog, and field outcomes.',
  Reports: 'Triage incoming citizen reports and turn verified cases into work.',
  'Field Work': 'Assign, monitor, and close operational work across shelters and blocks.',
  Evidence: 'Review field evidence before crediting citizen and shelter actions.',
  Partners: 'Manage capacity, coverage, and partner readiness.',
  Community: 'Track active citizen devices and community participation.',
  Map: 'Monitor local coverage and response density by neighborhood.',
  Impact: 'Translate operations into measurable impact and funding evidence.',
};

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
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-white/72 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1440px] items-center gap-5 px-4 py-3 md:px-8">
          <Link href="/action-queue" className="flex shrink-0 items-center gap-3 rounded-[18px] pr-2 transition hover:bg-white/50">
            <div className="grid h-11 w-11 place-items-center rounded-[16px] bg-[var(--jungle-soft)] ring-1 ring-[color-mix(in_srgb,var(--jungle)_16%,transparent)]">
              <span className="fredoka text-[18px] font-semibold text-[var(--jungle-deep)]">S</span>
            </div>
            <div>
              <div className="fredoka text-[19px] font-semibold leading-tight">Straytopia</div>
              <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Operations</div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {nav.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition',
                    isActive
                      ? 'bg-[var(--ink)] text-white shadow-[var(--shadow-sm)]'
                      : 'text-[var(--ink2)] hover:bg-white/70 hover:text-[var(--ink)]'
                  )}
                >
                  <Icon size={15} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-white/70 px-3 py-2 text-sm text-[var(--muted)] xl:flex">
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

      <div className="border-b border-[var(--border)] bg-white/35 lg:hidden">
        <nav className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 py-3 md:px-8">
          {nav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold transition',
                  isActive ? 'bg-[var(--ink)] text-white' : 'bg-white/60 text-[var(--ink2)]'
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-[1440px] px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Operations Hub</div>
            <h1 className="fredoka mt-2 text-[38px] font-semibold tracking-tight md:text-[48px]">{active}</h1>
            <p className="mt-1 max-w-2xl text-sm font-semibold leading-6 text-[var(--muted)] md:text-base">
              {pageCopy[active] ?? 'Coordinate Straytopia operations with one shared source of truth.'}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--ink2)] shadow-[var(--shadow-sm)]">
              Live workspace
            </div>
            <div className="rounded-full border border-[var(--border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--muted)] shadow-[var(--shadow-sm)]">
              {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
