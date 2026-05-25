"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  FileBarChart,
  Handshake,
  Hospital,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map,
  Menu,
  PawPrint,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase/client';

type Role = 'ops' | 'dispatcher' | 'shelter' | 'city_lead' | 'ngo';
type NavItem = {
  href?: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  roles?: Role[];
};

const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: 'Command',
    items: [
      { href: '/overview', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/action-queue', label: 'Operational Queue', icon: ListChecks },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/cases', label: 'Active Rescue Cases', icon: ShieldAlert },
      { href: '/tasks', label: 'Field Work', icon: ClipboardList },
      { href: '/shelters', label: 'Shelter Coordination', icon: Hospital },
      { href: '/proofs', label: 'Evidence Review', icon: ClipboardList },
    ],
  },
  {
    label: 'Network',
    items: [
      { href: '/animals', label: 'Animal Lifecycles', icon: PawPrint },
      { href: '/blocks', label: 'Map Intelligence', icon: Map },
      { href: '/volunteers', label: 'Volunteer Intelligence', icon: Users },
      { href: '/partners', label: 'NGO Intelligence', icon: Handshake },
    ],
  },
  {
    label: 'Intelligence',
    items: [
      { href: '/mel', label: 'Analytics', icon: FileBarChart },
      { href: '/trust', label: 'Trust Systems', icon: Sparkles },
      { href: '/forecasts', label: 'Forecasts', icon: TrendingUp },
      { href: '/audit', label: 'Audit Logs', icon: Clock3 },
      { href: '/system-readiness', label: 'System Readiness', icon: ShieldCheck },
    ],
  },
];

const pageCopy: Record<string, string> = {
  Dashboard: 'Operational intelligence for rescue load, field work, evidence, partners, and city risk.',
  'Operational Queue': 'The fastest route to the next decision: triage, assign, verify, or escalate.',
  'Active Rescue Cases': 'Triage incoming citizen reports and turn verified cases into work.',
  'Field Work': 'Assign, monitor, and close operational work across shelters and blocks.',
  'Evidence Review': 'Review field evidence before crediting citizen and shelter actions.',
  'Animal Lifecycles': 'Follow each animal from sighting to rescue, treatment, adoption, release, or monitoring.',
  'Map Intelligence': 'Monitor coverage and risk by neighborhood from block-level operational records.',
  'Volunteer Intelligence': 'Read volunteer readiness from assignments, skills, locality, and reliability signals.',
  'NGO Intelligence': 'Coordinate partners by capacity, capability, intake status, and emergency readiness.',
  Analytics: 'Translate operations into measurable impact and funding evidence.',
  'Trust Systems': 'Track trust, reliability, safety, evidence quality, and reviewer accountability.',
  Forecasts: 'Generate and review block-level risk forecasts from operational rows.',
  'Audit Logs': 'Review operational mutations, status changes, and decision accountability.',
  'System Readiness': 'Separate live backend capability from planned integrations before making operational claims.',
};

function findActive(pathname: string | null) {
  const items = navGroups.flatMap((group) => group.items);
  if (pathname?.startsWith('/overview')) return items.find((item) => item.label === 'Dashboard');
  if (pathname?.startsWith('/action-queue')) return items.find((item) => item.href === '/action-queue');
  if (pathname?.startsWith('/animals')) return items.find((item) => item.label === 'Animal Lifecycles');
  if (pathname?.startsWith('/blocks')) return items.find((item) => item.label === 'Map Intelligence');
  if (pathname?.startsWith('/volunteers')) return items.find((item) => item.label === 'Volunteer Intelligence');
  if (pathname?.startsWith('/partners')) return items.find((item) => item.label === 'NGO Intelligence');
  if (pathname?.startsWith('/trust')) return items.find((item) => item.label === 'Trust Systems');
  if (pathname?.startsWith('/forecasts')) return items.find((item) => item.label === 'Forecasts');
  if (pathname?.startsWith('/audit')) return items.find((item) => item.label === 'Audit Logs');
  if (pathname?.startsWith('/system-readiness')) return items.find((item) => item.label === 'System Readiness');
  if (pathname?.startsWith('/mel')) return items.find((item) => item.label === 'Analytics');
  if (pathname?.startsWith('/cases')) return items.find((item) => item.label === 'Active Rescue Cases');
  if (pathname?.startsWith('/tasks')) return items.find((item) => item.label === 'Field Work');
  if (pathname?.startsWith('/proofs')) return items.find((item) => item.label === 'Evidence Review');
  if (pathname?.startsWith('/shelters')) return items.find((item) => item.label === 'Shelter Coordination');
  if (pathname?.startsWith('/citizens')) return items.find((item) => item.label === 'Volunteers');
  return items[0];
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = getSupabase();
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const role: Role = 'ops';

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

  const active = useMemo(() => findActive(pathname), [pathname]);
  const activeLabel = active?.label ?? 'Dashboard';
  const sidebarWidth = collapsed ? 'lg:pl-[104px]' : 'lg:pl-[308px]';

  const sidebar = (
    <div className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--sidebar)] shadow-[var(--shadow-sm)] backdrop-blur-2xl">
      <div className="flex items-center gap-3 border-b border-[var(--hairline)] p-4">
        <Link href="/overview" className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[var(--jungle-soft)] ring-1 ring-[color-mix(in_srgb,var(--jungle)_18%,transparent)]">
          <span className="fredoka text-[18px] font-semibold text-[var(--jungle-deep)]">S</span>
        </Link>
        {!collapsed && (
          <div className="min-w-0">
            <div className="fredoka truncate text-[19px] font-semibold leading-tight">Straytopia</div>
            <div className="text-[11px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Command Center</div>
          </div>
        )}
      </div>

      <div className="px-3 py-3">
        <Link
          href="/action-queue"
          className={clsx(
            'flex items-center gap-3 rounded-[18px] border border-[color-mix(in_srgb,var(--coral)_22%,transparent)] bg-[var(--coral-soft)] px-3 py-3 text-sm font-black text-[var(--coral-deep)] transition hover:bg-[color-mix(in_srgb,var(--coral-soft)_76%,white)]',
            collapsed && 'justify-center px-2'
          )}
        >
          <ShieldAlert size={18} />
          {!collapsed && <span>Review urgent work</span>}
        </Link>
      </div>

      <nav aria-label="Primary" className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <div className="grid gap-5">
          {navGroups.map((group) => {
            const visibleItems = group.items.filter((item) => !item.roles || item.roles.includes(role));
            return (
              <section key={group.label}>
                {!collapsed && <div className="px-3 pb-2 text-[10px] font-black tracking-[0.22em] uppercase text-[var(--muted)]">{group.label}</div>}
                <div className="grid gap-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = Boolean(item.href && (pathname === item.href || pathname?.startsWith(item.href + '/'))) || activeLabel === item.label;
                    const className = clsx(
                      'group flex min-h-10 items-center gap-3 rounded-[16px] px-3 py-2 text-sm font-extrabold outline-none transition focus-visible:ring-2 focus-visible:ring-[var(--jungle)]',
                      collapsed && 'justify-center px-2',
                      isActive ? 'bg-[var(--ink)] text-white shadow-[var(--shadow-sm)]' : 'text-[var(--ink2)] hover:bg-white/72 hover:text-[var(--ink)]'
                    );
                    const content = (
                      <>
                        <span className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-[12px]', isActive ? 'bg-white/12 text-white' : 'bg-[var(--paper2)] text-[var(--muted)] group-hover:text-[var(--ink)]')}>
                          <Icon size={16} />
                        </span>
                        {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
                      </>
                    );
                    if (!item.href) return <button key={item.label} type="button" className={className} title={item.label}>{content}</button>;
                    return <Link key={`${item.href}-${item.label}`} href={item.href} className={className} onClick={() => setMobileOpen(false)} title={item.label}>{content}</Link>;
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </nav>

      <div className="grid gap-3 border-t border-[var(--hairline)] p-3">
        {!collapsed && !isSupabaseConfigured() && (
          <div className="rounded-[20px] border border-[color-mix(in_srgb,var(--gold)_28%,transparent)] bg-[color-mix(in_srgb,var(--gold-soft)_48%,white)] p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-[11px] font-black tracking-widest uppercase text-[var(--gold-deep)]">Demo mode</div>
              <span className="h-2 w-2 rounded-full bg-[var(--gold)]" />
            </div>
            <div className="mt-1 text-xs font-semibold leading-5 text-[var(--ink2)]">Sample data only. Connect Supabase for realtime.</div>
          </div>
        )}

        <Button
          variant="paper"
          size="sm"
          className={clsx('w-full', collapsed && 'px-2')}
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
          {!collapsed && (isSupabaseConfigured() ? 'Sign out' : 'Demo workspace')}
        </Button>

        <button
          type="button"
          className="hidden items-center justify-center rounded-[14px] border border-[var(--border)] bg-white/62 px-3 py-2 text-sm font-black text-[var(--ink2)] transition hover:bg-white lg:flex"
          onClick={() => setCollapsed((value) => !value)}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh text-[var(--ink)]">
      <aside className={clsx('fixed top-0 bottom-0 left-0 z-40 hidden transition-[width] duration-200 lg:block', collapsed ? 'w-[84px]' : 'w-[288px]')}>
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close navigation" className="absolute inset-0 bg-[rgba(11,18,32,0.42)] backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 bottom-0 left-0 w-[88vw] max-w-[340px]">
            <div className="absolute top-4 right-4 z-10">
              <button type="button" aria-label="Close navigation" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white/78 text-[var(--ink)]" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className={clsx('transition-[padding] duration-200', sidebarWidth)}>
        <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--topbar)] backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 md:px-8">
            <button type="button" aria-label="Open navigation" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-white/70 text-[var(--ink)] lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Operations Hub</div>
              <h1 className="fredoka mt-1 truncate text-[30px] font-semibold tracking-tight md:text-[42px]">{activeLabel}</h1>
              <p className="mt-1 hidden max-w-3xl text-sm font-semibold leading-6 text-[var(--muted)] md:block">
                {pageCopy[activeLabel] ?? 'Coordinate Straytopia operations with one shared source of truth.'}
              </p>
            </div>

            <div className="hidden min-w-[240px] items-center gap-2 rounded-full border border-[var(--border)] bg-white/68 px-3 py-2 text-sm text-[var(--muted)] xl:flex">
              <Search size={16} />
              <span className="select-none">Jump to case, block, task</span>
              <span className="mono ml-auto rounded-full border border-[var(--border)] bg-white px-2 py-0.5 text-[11px] text-[var(--muted)]">⌘K</span>
            </div>

            <div className="hidden text-right md:block">
              <div className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[var(--muted)]">Signed in</div>
              <div className="max-w-[190px] truncate text-sm font-black text-[var(--ink2)]">{email ?? 'Unknown'}</div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
