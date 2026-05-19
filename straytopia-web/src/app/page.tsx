'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Screen, MissionStatus } from '@/store/app';
import { COLOR, getTheme, ThemeColors, withOpacity } from '@/lib/theme';
import {
  missions as mockMissions, badges as mockBadges,
  leaderboardUsers, careStories, weeklyCareData, communityImpact,
  missionChecklists,
} from '@/lib/mock';
import { ThemeModeSelector } from '@/components/ui';
import {
  MapPin, Flame, Zap, Heart, BookOpen, Trophy, User, Plus, Camera, AlertTriangle,
  Clock, Shield, ChevronRight, ArrowLeft, Droplets, Eye,
  X, Check, CheckCircle2, Loader2, Bell, RotateCcw, Settings,
  Award, TrendingUp, TrendingDown, Minus, Target,
  FileText, Home, PawPrint, AlertCircle, Star,
  Moon, Siren, Clipboard, Users, CheckCircle, Lock,
  Bookmark, Share2, Smartphone, MessageCircle,
} from 'lucide-react';
import { MascotView, Saathi, getMascotState, MascotScene } from '@/mascot';

// Dynamic theme - updated each render based on darkMode state
let C: ThemeColors = COLOR;

// Haptic feedback simulation
function haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'select' = 'light') {
  if (typeof navigator === 'undefined' || !navigator.vibrate) return;
  const patterns = {
    light: 10,
    medium: 20,
    heavy: 40,
    success: [30, 50, 60],
    error: [50, 30, 80],
    select: 8,
  };
  navigator.vibrate(patterns[type]);
}

// Skeleton loader component
function Skeleton({ width, height, borderRadius = 12 }: { width: string | number; height: string | number; borderRadius?: number }) {
  return (
    <div style={{ width, height, borderRadius, backgroundColor: C.paper2, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(90deg, transparent 0%, ${C.paper3 || C.hairline} 50%, transparent 100%)`, animation: 'shimmer 1.5s infinite' }} />
    </div>
  );
}

// Progress ring component
function ProgressRing({ progress, size = 48, strokeWidth = 4, color }: { progress: number; size?: number; strokeWidth?: number; color?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={C.paper2} strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color || C.jungle} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
    </svg>
  );
}

// Empty state component
function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }: { icon: any; title: string; subtitle: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 24px' }}>
      <div style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: C.jungleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
        <Icon size={36} color={C.jungle} />
      </div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 280, margin: '0 auto 20px', lineHeight: 1.6 }}>{subtitle}</div>
      {actionLabel && onAction && <Btn variant="jungle" size="md" onClick={onAction} style={{ maxWidth: 240, margin: '0 auto' }}>{actionLabel}</Btn>}
    </div>
  );
}

function AppBackdrop() {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          top: -72,
          left: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withOpacity(C.jungle, 0.18)} 0%, transparent 70%)`,
          filter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 180,
          right: -70,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withOpacity(C.sky, 0.14)} 0%, transparent 72%)`,
          filter: 'blur(12px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -80,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 300,
          height: 220,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${withOpacity(C.plum, 0.1)} 0%, transparent 72%)`,
          filter: 'blur(16px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg, ${withOpacity(C.background, 0)} 0%, ${withOpacity(C.background, 0.12)} 55%, ${withOpacity(C.background, 0.35)} 100%)`,
        }}
      />
    </div>
  );
}

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, padding: '8px 12px', backgroundColor: C.surfaceElevated, color: C.textPrimary, borderRadius: 10, fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', zIndex: 100, maxWidth: 200, border: `1px solid ${C.borderStrong}`, boxShadow: `0 8px 18px ${C.shadow}` }}>
          {text}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '6px solid transparent', borderTopColor: C.surfaceElevated }} />
        </div>
      )}
    </div>
  );
}

function TourBubble({
  title,
  body,
  stepLabel,
  isLast = false,
  onNext,
  onSkip,
}: {
  title: string;
  body: string;
  stepLabel: string;
  isLast?: boolean;
  onNext: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: C.ink,
        color: C.paper,
        borderRadius: 20,
        padding: 16,
        boxShadow: `0 10px 22px ${C.shadow}`,
      }}
    >
      <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity(C.paper, 0.64), textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 6 }}>{stepLabel}</div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.paper, marginBottom: 6 }}>{title}</div>
      <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: withOpacity(C.paper, 0.82), lineHeight: 1.55, marginBottom: 14 }}>{body}</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={() => { haptic('light'); onSkip(); }}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 14,
            border: `1px solid ${withOpacity(C.paper, 0.16)}`,
            background: 'transparent',
            color: withOpacity(C.paper, 0.82),
            fontFamily: 'Nunito',
            fontWeight: 800,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Skip
        </button>
        <button
          onClick={() => { haptic('medium'); onNext(); }}
          style={{
            flex: 1,
            minHeight: 44,
            borderRadius: 14,
            border: 'none',
            backgroundColor: C.jungle,
            color: '#fff',
            fontFamily: 'Fredoka',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            boxShadow: `0 4px 0 0 ${C.jungleDeep}`,
          }}
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </motion.div>
  );
}

// Buddy avatar component
function BuddyAvatar({ name, online, tone = 'sky' }: { name: string; online: boolean; tone?: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    sky: { bg: C.sky, fg: '#fff' }, jungle: { bg: C.jungle, fg: '#fff' },
    coral: { bg: C.coral, fg: '#fff' }, gold: { bg: C.gold, fg: C.goldInk },
  };
  const c = colors[tone] || colors.sky;
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, border: `2.5px solid ${C.paper}` }}>{name[0]}</div>
      {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: C.jungle, border: `2px solid ${C.paper}` }} />}
    </div>
  );
}

// Setting toggle component
function SettingToggle({ icon: Icon, label, description, checked, onChange }: { icon: any; label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={() => { haptic('select'); onChange(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', backgroundColor: C.surfaceElevated, borderRadius: 16, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.cardMuted, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={checked ? C.jungle : C.muted} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.textPrimary }}>{label}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.textSecondary }}>{description}</div>
        </div>
      </div>
      <div style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: checked ? C.primary : C.borderStrong, position: 'relative', transition: 'background-color 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 24, height: 24, borderRadius: 12, backgroundColor: C.surfaceElevated, boxShadow: `0 4px 10px ${C.shadow}`, transition: 'left 0.2s' }} />
      </div>
    </motion.button>
  );
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function Card({ children, tone = 'surface', style = {}, onClick }: { children: React.ReactNode; tone?: string; style?: React.CSSProperties; onClick?: () => void }) {
  const surfaceLike = tone === 'surface' || tone === 'paper';
  const bg = tone === 'surface'
    ? `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.surface} 100%)`
    : tone === 'paper'
    ? `linear-gradient(180deg, ${C.card} 0%, ${C.cardMuted} 100%)`
    : C[tone as keyof typeof C] || C.paper2;
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} style={{ background: bg, borderRadius: 26, padding: 16, ...(surfaceLike ? { border: `1px solid ${C.border}`, boxShadow: `0 10px 22px ${withOpacity(C.shadow, 0.12)}` } : { boxShadow: `0 12px 24px ${withOpacity(C.shadow, 0.16)}` }), cursor: onClick ? 'pointer' : undefined, ...style }}>{children}</div>
  );
}

function Pill({ children, tone = 'paper', variant = 'soft' }: { children: React.ReactNode; tone?: string; variant?: 'soft' | 'solid' }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    jungle: { bg: C.jungleSoft, fg: C.jungleDeep }, coral: { bg: C.coralSoft, fg: C.coralDeep },
    gold: { bg: C.goldSoft, fg: C.goldInk }, sky: { bg: C.skySoft, fg: C.skyDeep },
    plum: { bg: C.plumSoft, fg: C.plumDeep }, ink: { bg: C.paper2, fg: C.ink },
    paper: { bg: C.paper2, fg: C.ink2 },
  };
  const c = colors[tone] || colors.paper;
  const bg = variant === 'solid' ? C[tone as keyof typeof C] || C.paper2 : c.bg;
  const fg = variant === 'solid' ? (tone === 'gold' ? C.goldInk : '#fff') : c.fg;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', borderRadius: 9999, backgroundColor: bg, fontSize: 13, fontWeight: 800, fontFamily: 'Nunito, sans-serif', color: fg }}>{children}</span>
  );
}

function Avatar({ name, size = 40, tone = 'sky' }: { name: string; size?: number; tone?: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    sky: { bg: C.sky, fg: '#fff' }, jungle: { bg: C.jungle, fg: '#fff' },
    coral: { bg: C.coral, fg: '#fff' }, gold: { bg: C.gold, fg: C.goldInk },
    plum: { bg: C.plum, fg: '#fff' }, paper: { bg: C.paper2, fg: C.ink2 },
  };
  const c = colors[tone] || colors.sky;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: size * 0.42, border: `2.5px solid ${C.paper}`, flexShrink: 0 }}>{name[0]}</div>
  );
}

function Btn({ children, variant = 'jungle', size = 'md', disabled = false, onClick, style = {}, leftIcon, rightIcon }: { children: React.ReactNode; variant?: string; size?: string; disabled?: boolean; onClick?: () => void; style?: React.CSSProperties; leftIcon?: React.ReactNode; rightIcon?: React.ReactNode }) {
  const colors: Record<string, { bg: string; shadow: string; fg: string }> = {
    jungle: { bg: C.jungle, shadow: C.jungleDeep, fg: '#fff' }, coral: { bg: C.coral, shadow: C.coralDeep, fg: '#fff' },
    gold: { bg: C.gold, shadow: C.goldDeep, fg: C.goldInk }, sky: { bg: C.sky, shadow: C.skyDeep, fg: '#fff' },
    plum: { bg: C.plum, shadow: C.plumDeep, fg: '#fff' }, ink: { bg: C.ink, shadow: '#000', fg: C.paper },
    paper: { bg: C.surface, shadow: C.hairline2, fg: C.ink }, ghost: { bg: 'transparent', shadow: 'transparent', fg: C.ink2 },
  };
  const c = colors[variant] || colors.jungle;
  const isGhost = variant === 'ghost';
  const sz = size === 'lg' ? { py: 18, px: 24, fs: 16 } : size === 'sm' ? { py: 10, px: 16, fs: 14 } : { py: 16, px: 22, fs: 16 };
  return (
    <motion.button whileTap={!disabled && !isGhost ? { y: 4 } : {}} onClick={() => { haptic('medium'); onClick?.(); }} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      padding: `${sz.py}px ${sz.px}px`, minHeight: 54, borderRadius: 20,
      background: isGhost ? withOpacity(C.surfaceElevated, 0.72) : c.bg,
      color: isGhost ? C.textPrimary : c.fg, fontSize: sz.fs, fontWeight: 600,
      fontFamily: 'Fredoka, sans-serif', letterSpacing: 0.01, textTransform: 'uppercase',
      border: isGhost ? `1px solid ${C.borderStrong}` : `1px solid ${withOpacity('#FFFFFF', variant === 'paper' ? 0.08 : 0.14)}`,
      opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      marginBottom: isGhost ? 0 : 4,
      backdropFilter: isGhost ? 'blur(12px)' : undefined,
      boxShadow: isGhost ? `0 8px 16px ${withOpacity(C.shadow, 0.12)}` : `0 8px 16px ${withOpacity(c.bg, 0.14)}, 0 4px 0 0 ${c.shadow}`,
      width: '100%', ...style,
    }}>{leftIcon}{children}{rightIcon}</motion.button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={() => { haptic('select'); onClick(); }} aria-label="Go back" style={{ backgroundColor: withOpacity(C.surfaceElevated, 0.9), border: `1px solid ${C.border}`, borderRadius: 14, padding: 8, cursor: 'pointer', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 12px ${withOpacity(C.shadow, 0.12)}`, backdropFilter: 'blur(12px)' }}><ArrowLeft size={20} color={C.ink2} /></button>;
}

function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 35, margin: '0 -16px 20px', padding: '12px 16px 16px', background: `linear-gradient(180deg, ${withOpacity(C.background, 0.97)} 0%, ${withOpacity(C.background, 0.86)} 72%, ${withOpacity(C.background, 0)} 100%)`, backdropFilter: 'blur(18px)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '44px 1fr 44px', alignItems: 'center', minHeight: 44, gap: 12 }}>
        {onBack ? <BackBtn onClick={onBack} /> : <div />}
        <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, textAlign: 'center' }}>{title}</span>
        <div style={{ display: 'flex', justifyContent: 'flex-end', minWidth: 44 }}>{right}</div>
      </div>
    </div>
  );
}

function Confetti({ disabled = false }: { disabled?: boolean }) {
  if (disabled) return null;
  const colors = ['#2DC653', '#FFC83D', '#FF5A4A', '#1CB0F6', '#A560E8'];
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div key={i} initial={{ y: -20, opacity: 0, rotate: 0 }} animate={{ y: 900, opacity: 0.6, rotate: 720 }} transition={{ duration: 1.6, delay: (i % 10) * 0.08, ease: [0.22, 1, 0.36, 1] }} style={{ position: 'absolute', left: `${(i * 137) % 100}%`, top: 0, width: 10, height: 14, borderRadius: 2, backgroundColor: colors[i % colors.length] }} />
      ))}
    </div>
  );
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: C.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: C.surfaceElevated, borderRadius: 24, padding: 24, width: '85%', maxWidth: 380, maxHeight: '80vh', overflowY: 'auto', border: `1px solid ${C.borderStrong}`, boxShadow: `0 14px 26px ${C.shadow}` }}>{children}</motion.div>
    </div>
  );
}

function ConfirmationDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel, confirmVariant = 'jungle' }: { open: boolean; title: string; body: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void; confirmVariant?: string }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: C.overlay, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: C.surfaceElevated, borderRadius: 24, padding: 24, width: '85%', maxWidth: 380, border: `1px solid ${C.borderStrong}`, boxShadow: `0 14px 26px ${C.shadow}` }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 12, textAlign: 'center' }}>{title}</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, marginBottom: 24, textAlign: 'center', lineHeight: 1.6 }}>{body}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant={confirmVariant} size="lg" onClick={onConfirm}>{confirmLabel}</Btn>
          <Btn variant="ghost" size="md" onClick={onCancel}>{cancelLabel}</Btn>
        </div>
      </motion.div>
    </div>
  );
}

function SuccessToast({ message, sub, onClose }: { message: string; sub?: string; onClose: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    setProgress(100);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / 3000) * 100);
      setProgress(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 16);
    const t = setTimeout(onClose, 3000);
    return () => { clearTimeout(t); clearInterval(interval); };
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ position: 'fixed', top: 16, left: 16, right: 16, zIndex: 400, maxWidth: 500, margin: '0 auto' }}>
      <div style={{ backgroundColor: C.success, borderRadius: 16, padding: '14px 20px', boxShadow: `0 10px 20px ${C.shadow}`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={22} color="#fff" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: '#fff' }}>{message}</div>
            {sub && <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: withOpacity('#FFFFFF', 0.85) }}>{sub}</div>}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: withOpacity('#FFFFFF', 0.2) }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: withOpacity('#FFFFFF', 0.8), borderRadius: '0 0 16px 16px', transition: 'width 0.016s linear' }} />
        </div>
      </div>
    </motion.div>
  );
}

function TabBar({ active, onChange }: { active: string; onChange: (t: string) => void }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'stories', label: 'Impact', icon: BookOpen },
    { id: 'league', label: 'Ranks', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];
  const safeBottom = 'env(safe-area-inset-bottom, 0px)';
  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 500, margin: '0 auto', padding: `10px 12px calc(${safeBottom} + 10px)` }}>
        <div style={{ position: 'relative' }}>
          <div style={{ height: 74, paddingRight: 96, backgroundColor: withOpacity(C.navBackground, 0.92), backdropFilter: 'blur(18px)', borderRadius: 26, border: `1px solid ${withOpacity(C.border, 0.9)}`, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', alignItems: 'center', padding: '8px 10px', boxShadow: `0 14px 34px ${withOpacity(C.shadow, 0.14)}` }}>
          {tabs.map((t) => {
            const isActive = active === t.id;
            const pillBg = isActive ? withOpacity(C.sky, 0.16) : 'transparent';
            const iconColor = isActive ? C.navActive : withOpacity(C.navInactive, 0.96);
            const labelColor = isActive ? C.navActive : withOpacity(C.navInactive, 0.92);

            return (
              <motion.button
                key={t.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => { haptic('select'); onChange(t.id); }}
                aria-label={t.label}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                  minHeight: 58,
                }}
              >
                <div style={{ width: 48, height: 36, borderRadius: 999, backgroundColor: pillBg, border: isActive ? `1px solid ${withOpacity(C.sky, 0.2)}` : '1px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <t.icon size={22} color={iconColor} />
                </div>
                <div style={{ fontFamily: 'Nunito', fontWeight: isActive ? 800 : 700, fontSize: 12, color: labelColor, lineHeight: 1 }}>
                  {t.label}
                </div>
              </motion.button>
            );
          })}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { haptic('heavy'); onChange('action'); }}
            aria-label="Quick actions"
            style={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56,
              height: 56,
              borderRadius: 18,
              background: `linear-gradient(180deg, ${C.danger} 0%, ${C.coralDeep} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: `1px solid ${withOpacity('#FFFFFF', 0.18)}`,
              boxShadow: `0 14px 30px ${withOpacity(C.danger, 0.22)}`,
            }}
          >
            <Plus size={26} color="#fff" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function StatStrip({ points, streak, hearts }: { points: number; streak: number; hearts: number }) {
  return (
    <div style={{ marginBottom: 18, overflow: 'hidden', borderRadius: 26, background: `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.cardMuted} 100%)`, border: `1px solid ${C.border}`, boxShadow: `0 12px 24px ${withOpacity(C.shadow, 0.12)}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', paddingTop: 6 }}>
        {[
          { icon: Flame, label: 'Streak', value: streak, color: C.coral, tone: C.coralDeep },
          { icon: Zap, label: 'Points', value: points, color: C.gold, tone: C.goldDeep },
          { icon: Heart, label: 'Hearts', value: hearts, color: C.coral, tone: C.coralDeep },
        ].map((item, index) => (
          <div key={item.label} style={{ padding: '14px 10px 16px', textAlign: 'center', borderLeft: index === 0 ? 'none' : `1px solid ${C.border}` }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, borderRadius: 13, backgroundColor: withOpacity(item.color, 0.12), marginBottom: 8 }}>
              <item.icon size={18} color={item.color} fill={item.color} />
            </div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 22, color: item.tone, lineHeight: 1 }}>{item.value}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 4 }}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', gap: 24, background: `radial-gradient(circle at top, ${withOpacity('#FFFFFF', 0.14)} 0%, transparent 36%), linear-gradient(180deg, ${C.jungle} 0%, ${C.jungleDeep} 100%)` }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <MascotView scene="onboarding_welcome" size="lg" showBubble={false} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 44, color: '#fff', letterSpacing: -0.02, lineHeight: 1 }}>
          {'Straytopia'.split('').map((letter, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.06, ease: 'easeOut' }}
              style={{ display: 'inline-block' }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16, color: withOpacity('#FFFFFF', 0.88), maxWidth: 260, lineHeight: 1.5 }}
      >
        Spot a stray. Do one small thing. Make their day better.
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.2 }}
        style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <PawPrint size={16} color={withOpacity('#FFFFFF', 0.5)} />
        <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: withOpacity('#FFFFFF', 0.5), textTransform: 'uppercase', letterSpacing: 0.1 }}>Care starts here</span>
      </motion.div>
    </div>
  );
}

function OnboardingIntroScreen() {
  const { onboardingPhase, advanceOnboarding, skipOnboarding } = useApp();
  const reducedMotion = useReducedMotion();
  const totalSteps = 3;
  const heroIconSize = 32;

  const slides = [
    {
      icon: PawPrint,
      title: 'Your neighborhood needs you',
      subtitle: 'Food, water, and small acts of care, right where you live.',
      features: [
        { icon: PawPrint, label: 'Feed a stray', desc: 'Leave safe food where animals gather', color: 'jungle' as const },
        { icon: Droplets, label: 'Leave water', desc: 'A small bowl saves lives in summer heat', color: 'sky' as const },
        { icon: AlertTriangle, label: 'Report danger', desc: 'Alert rescuers about injured animals', color: 'coral' as const },
      ],
    },
    {
      icon: Users,
      title: 'You are not alone',
      subtitle: 'Join a community that shows up, every day.',
      features: [
        { icon: Heart, label: '12,400+ animals saved', desc: 'By regular people like you', color: 'coral' as const },
        { icon: MapPin, label: '340+ neighborhoods', desc: 'Active care zones across India', color: 'sky' as const },
        { icon: Users, label: '8,200+ helpers', desc: 'Feeding, watering, and reporting daily', color: 'jungle' as const },
      ],
    },
  ];

  const slide = slides[onboardingPhase] || slides[0];
  const isLast = onboardingPhase === slides.length - 1;
  const Icon = slide.icon;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={skipOnboarding} style={{ padding: '8px 14px', borderRadius: 12, border: `1px solid ${C.border}`, backgroundColor: withOpacity(C.surfaceElevated, 0.84), backdropFilter: 'blur(10px)', fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.ink2, cursor: 'pointer', boxShadow: `0 6px 12px ${withOpacity(C.shadow, 0.1)}` }}>Skip</motion.button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 16px', textAlign: 'center', gap: 16, overflowY: 'auto' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={onboardingPhase}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -14 }}
            transition={{ duration: reducedMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
          >
            <motion.div initial={reducedMotion ? { opacity: 1 } : { scale: 0.84, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}>
              <div style={{ width: 72, height: 72, borderRadius: 24, background: `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.surface} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 14px ${withOpacity(C.shadow, 0.08)}`, border: `1px solid ${C.border}` }}>
                <Icon size={heroIconSize} color={C.jungle} />
              </div>
            </motion.div>

            <motion.div initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.34, delay: reducedMotion ? 0 : 0.08 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 32, color: C.ink, lineHeight: 1.08, maxWidth: 320 }}>{slide.title}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, marginTop: 10, maxWidth: 300, lineHeight: 1.65 }}>{slide.subtitle}</div>
            </motion.div>

            <motion.div initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.34, delay: reducedMotion ? 0 : 0.14 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
              {slide.features.map((f, i) => (
                <motion.div key={f.label} initial={reducedMotion ? { opacity: 1 } : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reducedMotion ? 0 : 0.28, delay: reducedMotion ? 0 : 0.18 + i * 0.08 }} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.cardMuted} 100%)`, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: `0 8px 16px ${withOpacity(C.shadow, 0.06)}` }}>
                  <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: C[f.color + 'Soft' as keyof typeof C] || C.jungleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${withOpacity(C[f.color as keyof typeof C] as string, 0.18)}` }}>
                    <f.icon size={22} color={C[f.color as keyof typeof C] || C.jungle} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 3 }}>{f.label}</div>
                    <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div style={{ padding: '16px 24px 28px', borderTop: `1px solid ${C.hairline}`, backgroundColor: withOpacity(C.paper, 0.94), backdropFilter: 'blur(14px)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={{ width: i === onboardingPhase ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === onboardingPhase ? C.jungle : C.paper2, transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <Btn variant="jungle" size="lg" onClick={advanceOnboarding} rightIcon={<ChevronRight size={18} />}>{isLast ? 'Choose My Care Zone' : 'Continue'}</Btn>
      </div>
    </div>
  );
}

function SimpleOnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { neighborhood, setNeighborhood } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(neighborhood);
  const [detecting, setDetecting] = useState(false);
  const reducedMotion = useReducedMotion();
  const totalSteps = 3;

  const neighborhoods = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City', 'Jayanagar', 'BTM Layout', 'Marathahalli', 'MG Road', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Other'];
  const filtered = search ? neighborhoods.filter((n) => n.toLowerCase().includes(search.toLowerCase())) : neighborhoods;
  const canContinue = selected.trim().length > 0;

  const handleDetectLocation = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => { setSelected('Indiranagar'); setDetecting(false); },
        () => { setSelected('Indiranagar'); setDetecting(false); }
      );
    } else {
      setSelected('Indiranagar');
      setDetecting(false);
    }
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setNeighborhood(selected);
    onComplete();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 24px 12px', textAlign: 'center', gap: 14 }}>
        <motion.div initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : 0.35 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <motion.div initial={reducedMotion ? { opacity: 1 } : { scale: 0.84, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: reducedMotion ? 0 : 0.45, ease: 'easeOut' }}>
            <div style={{ width: 72, height: 72, borderRadius: 24, background: `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.surface} 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 14px ${withOpacity(C.shadow, 0.08)}`, border: `1px solid ${C.border}` }}>
              <MapPin size={32} color={C.jungle} />
            </div>
          </motion.div>

          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 32, color: C.ink, lineHeight: 1.08, maxWidth: 320 }}>Where do you care?</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 300, lineHeight: 1.65 }}>Pick your area so we can show nearby animals, missions, and local impact near you.</div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{ width: i === 2 ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === 2 ? C.jungle : C.paper2, transition: 'all 0.3s ease' }} />
            ))}
          </div>
        </motion.div>
      </div>

      <Card tone="surface" style={{ margin: '0 24px 24px', padding: 16, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, paddingBottom: 110 }}>
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Choose your care zone</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, minHeight: 0 }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleDetectLocation}
            disabled={detecting}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 16px', borderRadius: 16, border: `2px solid ${C.jungle}`,
              backgroundColor: C.jungleSoft, cursor: detecting ? 'not-allowed' : 'pointer',
              fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.jungleDeep,
              opacity: detecting ? 0.6 : 1,
            }}
          >
            <MapPin size={20} color={C.jungle} />
            {detecting ? 'Detecting...' : 'Auto-detect my location'}
          </motion.button>

          <div style={{ position: 'relative' }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your area..."
              style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: 16, border: `2px solid ${C.hairline}`, fontFamily: 'Fredoka', fontSize: 18, color: C.ink, backgroundColor: C.surface, outline: 'none' }}
            />
            <MapPin size={20} color={C.muted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 }}>
            {filtered.map((n) => (
              <motion.button key={n} whileTap={{ scale: 0.98 }} onClick={() => setSelected(n)} style={{
                padding: '12px 16px', borderRadius: 16, textAlign: 'left',
                backgroundColor: selected === n ? C.jungleSoft : C.surface,
                border: `1px solid ${selected === n ? C.jungle : C.border}`,
                fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: selected === n ? C.jungleDeep : C.ink,
                cursor: 'pointer', width: '100%',
              }}>{n}</motion.button>
            ))}
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 16, backgroundColor: selected ? C.primarySoft : C.cardMuted, border: `1px solid ${selected ? withOpacity(C.primary, 0.18) : C.border}` }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: selected ? C.jungleDeep : C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 4 }}>Selected zone</div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: selected ? C.jungleDeep : C.ink }}>{selected || 'Select your area'}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: selected ? C.jungleDeep : C.ink2, marginTop: 4 }}>{selected ? 'You can change this later from your profile.' : 'Choose an area to continue.'}</div>
          </div>
        </div>
      </Card>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px 28px', backgroundColor: withOpacity(C.paper, 0.94), borderTop: `1px solid ${C.hairline}`, maxWidth: 480, margin: '0 auto', backdropFilter: 'blur(14px)' }}>
        <Btn variant="jungle" size="lg" onClick={handleContinue} disabled={!canContinue} rightIcon={<ChevronRight size={18} />}>Start My Care Journey</Btn>
      </div>
    </div>
  );
}

function MissionPathNode({ mission, status, index, total, onPress }: { mission: typeof mockMissions[0]; status: string; index: number; total: number; onPress: () => void }) {
  const MI = mission.icon;
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isInProgress = status === 'in_progress';
  const isLast = index === total - 1;
  const toneColor = C[mission.tone as keyof typeof C] || C.jungle;
  const nodeBg = isCompleted ? C.completed : isInProgress ? C.warning : isLocked ? C.lockedSoft : toneColor;
  const nodeFg = isCompleted ? '#fff' : isInProgress ? C.goldInk : isLocked ? C.locked : mission.tone === 'gold' ? C.goldInk : '#fff';
  const connectorColor = isCompleted ? C.completed : isInProgress ? C.warning : isLocked ? C.borderStrong : C.border;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={!isLocked ? () => { haptic(isCompleted ? 'success' : 'medium'); onPress(); } : undefined}
        style={{
          width: 72, height: 72, borderRadius: 36, backgroundColor: nodeBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLocked ? 'default' : 'pointer',
          border: `3px solid ${isCompleted ? C.completedSoft : isInProgress ? C.goldDeep : isLocked ? C.borderStrong : nodeFg}`,
          boxShadow: isCompleted ? `0 4px 0 0 ${C.primaryHover}` : isInProgress ? `0 4px 0 0 ${C.goldDeep}` : isLocked ? 'none' : `0 4px 0 0 ${C[toneShadow(mission.tone)]}`,
          marginBottom: 8,
        }}
      >
        {isCompleted ? <CheckCircle2 size={32} color="#fff" /> : isLocked ? <Lock size={28} color={C.locked} /> : <MI size={32} color={nodeFg} />}
      </motion.div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: isLocked ? C.textSecondary : C.textPrimary, textAlign: 'center', maxWidth: 120 }}>{mission.title}</div>
      {!isLast && (
        <div style={{ width: 3, height: 32, backgroundColor: connectorColor, borderRadius: 2, margin: '4px 0' }} />
      )}
    </div>
  );
}

function toneShadow(tone: string): keyof typeof C {
  const map: Record<string, keyof typeof C> = { jungle: 'jungleDeep', sky: 'skyDeep', plum: 'plumDeep', coral: 'coralDeep', gold: 'goldDeep' };
  return map[tone] || 'jungleDeep';
}

function NeighborhoodEngagementStrip() {
  const activeNow = 12;
  const todayMissions = 34;
  const weekGrowth = 23;

  return (
    <Card tone="paper" style={{ marginBottom: 16, padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.jungle }} />
        <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>Active in Indiranagar</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.jungleDeep }}>{activeNow}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Active now</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.skyDeep }}>{todayMissions}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Missions today</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.coralDeep }}>+{weekGrowth}%</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>This week</div>
        </div>
      </div>
    </Card>
  );
}

function HomeScreen({ setScreen, missions, missionStatus, points, streak, hearts, missionsCompleted, animalsHelped, earnedBadges, onSelectMission, onLockedMission }: {
  setScreen: (s: Screen) => void; missions: typeof mockMissions; missionStatus: MissionStatus;
  points: number; streak: number; hearts: number; missionsCompleted: number; animalsHelped: number;
  earnedBadges: string[]; onSelectMission: (id: string) => void; onLockedMission: () => void;
}) {
  const { likedStories, bookmarkedStories, toggleLikeStory, toggleBookmarkStory, buddyMode, checkAndResetDaily, hasSeenHomeTour, completeHomeTour } = useApp();
  const [selectedStory, setSelectedStory] = useState<typeof careStories[0] | null>(null);
  const [tourStep, setTourStep] = useState<number | null>(null);
  const statsTourRef = useRef<HTMLDivElement | null>(null);
  const pathTourRef = useRef<HTMLDivElement | null>(null);
  const storiesTourRef = useRef<HTMLDivElement | null>(null);
  const pathTourBubbleRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkAndResetDaily();
  }, [checkAndResetDaily]);

  useEffect(() => {
    if (!hasSeenHomeTour) {
      const timer = setTimeout(() => setTourStep(0), 500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenHomeTour]);

  useEffect(() => {
    if (tourStep === null) return;
    const node = tourStep === 0
      ? statsTourRef.current
      : tourStep === 1
      ? (pathTourBubbleRef.current || pathTourRef.current)
      : tourStep === 2
      ? storiesTourRef.current
      : null;

    if (!node) return;
    const timer = setTimeout(() => {
      // Step 2 tooltip is rendered above the section, so align it to the top.
      node.scrollIntoView({ behavior: 'smooth', block: tourStep === 1 ? 'start' : 'center' });
    }, 120);
    return () => clearTimeout(timer);
  }, [tourStep]);

  const firstAvailable = missions.find((m) => missionStatus[m.id as keyof MissionStatus] === 'available');
  const activePathMission = missions.find((m) => {
    const state = missionStatus[m.id as keyof MissionStatus];
    return state === 'in_progress' || state === 'proof_required';
  });
  const featuredMission = activePathMission || firstAvailable;
  // Intentionally no CTA buttons in the hero card.
  const neighborhoodPulse = [
    { value: '12', label: 'Active now' },
    { value: '34', label: 'Missions today' },
    { value: '+23%', label: 'This week' },
  ];
  const mascotScene: MascotScene = missionsCompleted === 0 && !firstAvailable ? 'home_empty' : firstAvailable ? 'mission_available' : 'home_empty';
  const completedCount = missions.filter((m) => missionStatus[m.id as keyof MissionStatus] === 'completed').length;
  const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;
  const allDone = completedCount === missions.length && missions.length > 0;
  const closeTour = () => {
    setTourStep(null);
    completeHomeTour();
  };
  const nextTourStep = () => {
    if (tourStep === 3) {
      closeTour();
      return;
    }
    setTourStep((current) => (current === null ? 0 : current + 1));
  };

  return (
    <div style={{ padding: '0 16px 100px' }}>
      {tourStep !== null && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: C.overlay, backdropFilter: 'blur(4px)', zIndex: 40 }} />
      )}
      <div ref={statsTourRef} style={{ position: 'relative', zIndex: tourStep === 0 ? 120 : 'auto', marginBottom: tourStep === 0 ? 96 : 0 }}>
        <div>
          <StatStrip points={points} streak={streak} hearts={hearts} />
        </div>
        {tourStep === 0 && (
          <div style={{ position: 'absolute', top: 'calc(100% - 4px)', left: 0, right: 0, zIndex: 20 }}>
            <TourBubble
              stepLabel="Step 1 of 4"
              title="This is your daily score"
              body="Track your streak, care points, and hearts here. These go up as you complete missions."
              onNext={nextTourStep}
              onSkip={closeTour}
            />
          </div>
        )}
      </div>
      {missionsCompleted > 0 && (
        <Card tone="paper" style={{ marginBottom: 16, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>Today&apos;s progress</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: C.jungleDeep, textTransform: 'uppercase', letterSpacing: 0.08 }}>{completedCount}/{missions.length} done</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, backgroundColor: C.paper2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: C.jungle, borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
        </Card>
      )}
      <MascotView scene={mascotScene} compact={false} />
      <div style={{ marginBottom: 24, padding: '24px 20px', borderRadius: 30, background: `radial-gradient(circle at top right, ${withOpacity('#FFFFFF', 0.18)} 0%, transparent 28%), linear-gradient(135deg, ${C.jungle} 0%, ${C.jungleDeep} 100%)`, color: '#fff', boxShadow: `0 14px 24px ${withOpacity(C.jungle, 0.18)}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.72), textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 8 }}>Indiranagar care zone</div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 28, lineHeight: 1.05, marginBottom: 8 }}>Today, one small act can change an animal&apos;s day.</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, lineHeight: 1.65, color: withOpacity('#FFFFFF', 0.84), maxWidth: 280 }}>
              {missionsCompleted === 0 ? 'Start your first care mission and build your kindness streak.' : `${animalsHelped} animal${animalsHelped !== 1 ? 's' : ''} already helped near you. Keep the momentum going.`}
            </div>
            <div style={{ height: 14 }} />
          </div>
          <div style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: withOpacity('#FFFFFF', 0.16), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${withOpacity('#FFFFFF', 0.16)}` }}>
            <PawPrint size={28} color="#fff" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {neighborhoodPulse.map((item) => (
            <div key={item.label} style={{ padding: '12px 10px', borderRadius: 18, backgroundColor: withOpacity('#FFFFFF', 0.12), backdropFilter: 'blur(6px)', border: `1px solid ${withOpacity('#FFFFFF', 0.12)}`, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: '#fff' }}>{item.value}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.74), textTransform: 'uppercase', letterSpacing: 0.08 }}>{item.label}</div>
            </div>
          ))}
        </div>
        <div style={{ height: 14 }} />
        {buddyMode && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${withOpacity('#FFFFFF', 0.14)}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.7), textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 4 }}>Nearby helpers</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: withOpacity('#FFFFFF', 0.86) }}>Aisha, Rohan, and Meera are active nearby.</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <BuddyAvatar name="Aisha" online tone="jungle" />
              <BuddyAvatar name="Rohan" online tone="sky" />
              <BuddyAvatar name="Meera" online={false} tone="coral" />
            </div>
          </div>
        )}
      </div>
      {allDone ? (
        <div style={{ textAlign: 'center', padding: '24px 16px', marginBottom: 16 }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.jungleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={40} color={C.jungle} />
            </div>
          </motion.div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 8 }}>All tasks done for today!</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>You've completed all your care missions. Come back tomorrow for new tasks and keep your streak going.</div>
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Flame size={20} color={C.coral} fill={C.coral} />
            <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.coralDeep }}>Streak: {streak} days</span>
          </div>
        </div>
      ) : (
        <div ref={pathTourRef} style={{ position: 'relative', zIndex: tourStep === 1 ? 120 : 'auto', marginBottom: tourStep === 1 ? 110 : 0 }}>
          {tourStep === 1 && (
            <div ref={pathTourBubbleRef} style={{ marginBottom: 12 }}>
              <TourBubble
                stepLabel="Step 2 of 4"
                title="Your tasks reset every day"
                body="Follow this path to complete today's missions. Finish them all, then come back tomorrow for a fresh set."
                onNext={nextTourStep}
                onSkip={closeTour}
              />
            </div>
          )}
          <Card tone="surface" style={{ padding: 18 }}>
            <div>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 4 }}>Today&apos;s Care Path</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, lineHeight: 1.55 }}>Move from one simple act of care to the next. Finish the full path before tomorrow resets it.</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
                {missions.map((m, i) => (
                  <Tooltip key={m.id} text={m.title}>
                    <MissionPathNode
                      mission={m}
                      status={missionStatus[m.id as keyof MissionStatus] || 'locked'}
                      index={i}
                      total={missions.length}
                      onPress={() => {
                        const st = missionStatus[m.id as keyof MissionStatus];
                        if (st === 'locked') onLockedMission();
                        else onSelectMission(m.id);
                      }}
                    />
                  </Tooltip>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
      <div style={{ marginTop: 28 }}>
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 2 }}>Badges</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>Your growing record of care</div>
          </div>
          <button onClick={() => setScreen('profile')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: C.jungleDeep, textTransform: 'uppercase', letterSpacing: 0.08 }}>Profile</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {mockBadges.slice(0, 4).map((b) => {
            const earned = earnedBadges.includes(b.id);
            const toneColor = C[b.tone as keyof typeof C] as string;
            return (
              <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, backgroundColor: earned ? withOpacity(toneColor, 0.12) : C.lockedSoft, border: `1px solid ${earned ? withOpacity(toneColor, 0.2) : C.border}`, borderRadius: 16 }}>
                <b.icon size={22} color={earned ? toneColor : C.locked} />
                <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: earned ? C.ink : C.textSecondary, textAlign: 'center' }}>{b.title}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div ref={storiesTourRef} style={{ position: 'relative', zIndex: tourStep === 2 ? 120 : 'auto', marginTop: 28, marginBottom: tourStep === 2 ? 112 : 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 2 }}>Care Stories Near You</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>Real moments from your community</div>
          </div>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.jungleDeep }}>{careStories.length} stories</span>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '6px 2px 14px', margin: '0 -2px', scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {careStories.slice(0, 8).map((s) => {
            const isLiked = likedStories.includes(s.id);
            const isBookmarked = bookmarkedStories.includes(s.id);
            const shouldShowReadMore = (s.body?.length || 0) > 110;
            const fallbackImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop';
            const imageSrc = s.imageUrl || fallbackImage;
            return (
              <div key={s.id} style={{ minWidth: 260, scrollSnapAlign: 'start' }}>
                <motion.div whileTap={{ scale: 0.99 }}>
                  <div
                    onClick={() => setSelectedStory(s)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedStory(s); }}
                    style={{
                      borderRadius: 24,
                      background: `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.cardMuted} 100%)`,
                      border: `1px solid ${C.border}`,
                      boxShadow: 'none',
                      cursor: 'pointer',
                      overflow: 'visible',
                      height: 332,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ position: 'relative', height: 140, flexShrink: 0, backgroundColor: C.paper2 }}>
                        <img
                          src={imageSrc}
                          alt={s.title}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src !== fallbackImage) img.src = fallbackImage;
                          }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${withOpacity('#000000', 0.24)}, transparent 55%)` }} />
                        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 8 }}>
                          <Pill tone={s.badgeTone} variant="soft">{s.badge}</Pill>
                          {s.mediaType === 'video' && <Pill tone="sky" variant="soft">Video</Pill>}
                        </div>
                      </div>

                      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={(e) => { e.stopPropagation(); haptic('select'); toggleLikeStory(s.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              aria-label={isLiked ? 'Unlike story' : 'Like story'}
                            >
                              <Heart size={16} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
                            </motion.button>
                            <motion.button
                              whileTap={{ scale: 0.8 }}
                              onClick={(e) => { e.stopPropagation(); haptic('select'); toggleBookmarkStory(s.id); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
                            >
                              <Bookmark size={16} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
                            </motion.button>
                          </div>
                        </div>
                        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 6, lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{s.title}</div>
                        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 60 }}>{s.body}</div>
                        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted }}>{s.location}</span>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted }}>•</span>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted }}>{s.date}</span>
                        </div>

                        {shouldShowReadMore && (
                          <div style={{ marginTop: 'auto', paddingTop: 10, fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.jungleDeep, textTransform: 'uppercase', letterSpacing: 0.08 }}>
                            Read more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
        {tourStep === 2 && (
          <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 20 }}>
            <TourBubble
              stepLabel="Step 3 of 4"
              title="Stories keep the community connected"
              body="Open real care updates from your area, follow what happened, and see verified case outcomes in one place."
              onNext={nextTourStep}
              onSkip={closeTour}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedStory && (
          <Modal open={!!selectedStory} onClose={() => setSelectedStory(null)}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink }}>{selectedStory.title}</div>
              <div style={{ borderRadius: 18, overflow: 'hidden', border: `1px solid ${C.border}` }}>
                {(() => {
                  const fallbackImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop';
                  const imageSrc = selectedStory.imageUrl || fallbackImage;
                  return (
                    <img
                      src={imageSrc}
                      alt={selectedStory.title}
                      onError={(e) => {
                        const img = e.currentTarget;
                        if (img.src !== fallbackImage) img.src = fallbackImage;
                      }}
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    />
                  );
                })()}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Pill tone={selectedStory.badgeTone} variant="soft">{selectedStory.badge}</Pill>
                {selectedStory.mediaType === 'video' && <Pill tone="sky" variant="soft">Video</Pill>}
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => { haptic('select'); toggleLikeStory(selectedStory.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Like story">
                    <Heart size={18} color={likedStories.includes(selectedStory.id) ? C.coral : C.muted} fill={likedStories.includes(selectedStory.id) ? C.coral : 'none'} />
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={() => { haptic('select'); toggleBookmarkStory(selectedStory.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} aria-label="Bookmark story">
                    <Bookmark size={18} color={bookmarkedStories.includes(selectedStory.id) ? C.gold : C.muted} fill={bookmarkedStories.includes(selectedStory.id) ? C.gold : 'none'} />
                  </motion.button>
                </div>
              </div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, color: C.muted }}>{selectedStory.location} • {selectedStory.date}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{selectedStory.fullBody || selectedStory.body}</div>
              <Btn variant="ghost" size="md" onClick={() => setSelectedStory(null)} style={{ marginBottom: 0 }}>Close</Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>
      {tourStep === 3 && (
        <div style={{ position: 'fixed', left: 16, right: 16, bottom: 112, zIndex: 120, maxWidth: 480, margin: '0 auto' }}>
          <TourBubble
            stepLabel="Step 4 of 4"
            title="Use the + button for quick help"
            body="Tap the floating button anytime to report an animal, send an SOS, or invite a care buddy."
            isLast
            onNext={nextTourStep}
            onSkip={closeTour}
          />
        </div>
      )}
    </div>
  );
}

function MissionMap({ lat, lng, location, distance }: { lat: number; lng: number; location: string; distance: string }) {
  const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.003}%2C${lat - 0.002}%2C${lng + 0.003}%2C${lat + 0.002}&layer=mapnik&marker=${lat}%2C${lng}`;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ borderRadius: 20, overflow: 'hidden', border: `2px solid ${C.hairline}`, height: 180, position: 'relative', backgroundColor: C.paper2 }}>
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 'none', display: 'block', filter: 'saturate(0.8) brightness(1.05)' }}
          loading="lazy"
          title="Mission location map"
        />
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <div style={{ backgroundColor: C.surfaceElevated, backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: `0 4px 10px ${C.shadow}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: C.jungle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{location}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, color: C.muted }}>{distance} away</div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ backgroundColor: C.jungle, borderRadius: 10, padding: '8px 14px', textDecoration: 'none' }}
            >
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 13, color: '#fff' }}>Navigate</div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function MissionDetailScreen({ mission, onBack, onStart, status }: { mission: typeof mockMissions[0]; onBack: () => void; onStart: () => void; status: string }) {
  const MI = mission.icon;
  const statusConfig = status === 'completed'
    ? { label: 'Completed', tone: 'jungle' as const }
    : status === 'in_progress'
    ? { label: 'In Progress', tone: 'gold' as const }
    : status === 'locked'
    ? { label: 'Locked', tone: 'coral' as const }
    : { label: 'Ready Now', tone: 'sky' as const };
  const showStatusPill = statusConfig.label !== 'Ready Now';

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title={mission.title} onBack={onBack} />
      <MascotView scene="mission_detail" compact />
      <Card tone={mission.tone} style={{ marginBottom: 20, padding: 24, marginTop: 16, background: `radial-gradient(circle at top right, ${withOpacity('#FFFFFF', 0.18)} 0%, transparent 30%), ${C[mission.tone as keyof typeof C]}` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: withOpacity('#FFFFFF', 0.22), display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${withOpacity('#FFFFFF', 0.16)}` }}>
            <MI size={32} color="#fff" />
            </div>
            <div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.72), textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 6 }}>Today&apos;s mission</div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#fff', marginBottom: 4 }}>{mission.title}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: withOpacity('#FFFFFF', 0.8) }}>{mission.location}</div>
            </div>
          </div>
          {showStatusPill && <Pill tone={statusConfig.tone} variant="soft">{statusConfig.label}</Pill>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { value: `${mission.time} min`, label: 'Time' },
            { value: `+${mission.rewardPoints}`, label: 'Reward' },
            { value: mission.urgency, label: 'Urgency' },
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px 10px', borderRadius: 18, backgroundColor: withOpacity('#FFFFFF', 0.12), border: `1px solid ${withOpacity('#FFFFFF', 0.12)}`, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17, color: '#fff' }}>{item.value}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, color: withOpacity('#FFFFFF', 0.74), textTransform: 'uppercase', letterSpacing: 0.08 }}>{item.label}</div>
            </div>
          ))}
        </div>
      </Card>
      {mission.lat && mission.lng && (
        <MissionMap lat={mission.lat} lng={mission.lng} location={mission.location} distance={mission.distance} />
      )}
      <Card tone="surface" style={{ marginBottom: 24, padding: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[
          { icon: MapPin, label: mission.location },
          { icon: Clock, label: `${mission.time} min` },
          { icon: Zap, label: `+${mission.rewardPoints} pts` },
          { icon: Shield, label: 'Verified by AI' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', backgroundColor: C.cardMuted, borderRadius: 16, border: `1px solid ${C.border}` }}>
            <item.icon size={20} color={C.ink2} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, color: C.ink }}>{item.label}</span>
          </div>
        ))}
        </div>
      </Card>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>About this mission</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, lineHeight: 1.7 }}>{mission.description}</div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Safety Tips</div>
        <Card tone="paper" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} color={C.coral} />
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: C.ink2 }}>{mission.safety}</div>
        </Card>
      </div>
      <Btn variant="jungle" size="lg" onClick={onStart} disabled={status === 'completed'}>
        {status === 'completed' ? 'Completed' : status === 'in_progress' ? 'Continue Mission' : 'Start Mission'}
      </Btn>
    </div>
  );
}

function ActiveMissionScreen({ mission, onComplete, onBack, checklistItems, toggleChecklistItem }: {
  mission: typeof mockMissions[0]; onComplete: () => void; onBack: () => void;
  checklistItems: Record<string, boolean>; toggleChecklistItem: (item: string) => void;
}) {
  const checklist = missionChecklists[mission.id] || [];
  const allChecked = checklist.length > 0 && checklist.every((c) => checklistItems[c.key]);
  const completedSteps = checklist.filter((c) => checklistItems[c.key]).length;
  const checklistProgress = checklist.length ? Math.round((completedSteps / checklist.length) * 100) : 0;

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Active Mission" onBack={onBack} />
      <MascotView scene="mission_active" compact />
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 4 }}>{mission.title}</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2 }}>{mission.description}</div>
      </div>
      <Card tone="surface" style={{ marginBottom: 18, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ProgressRing progress={checklistProgress} size={56} strokeWidth={5} color={C.primary} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 4 }}>{completedSteps} of {checklist.length} steps complete</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>Finish each step below, then submit a photo so Straytopia can verify the action and award your points.</div>
          </div>
        </div>
      </Card>
      {mission.lat && mission.lng && (
        <MissionMap lat={mission.lat} lng={mission.lng} location={mission.location} distance={mission.distance} />
      )}
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Mission Steps</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {checklist.map((c) => (
          <motion.div
            key={c.key}
            whileTap={{ scale: 0.98 }}
            onClick={() => { haptic('select'); toggleChecklistItem(c.key); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
              backgroundColor: checklistItems[c.key] ? C.jungleSoft : C.surface,
              borderRadius: 16, border: `2px solid ${checklistItems[c.key] ? C.jungle : C.hairline}`,
              cursor: 'pointer',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              backgroundColor: checklistItems[c.key] ? C.jungle : C.paper2,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: checklistItems[c.key] ? 'none' : `2px solid ${C.hairline2}`,
            }}>
              {checklistItems[c.key] && <Check size={18} color="#fff" />}
            </div>
            <span style={{
              fontFamily: 'Nunito', fontWeight: 600, fontSize: 15,
              color: checklistItems[c.key] ? C.jungleDeep : C.ink,
              textDecoration: checklistItems[c.key] ? 'line-through' : 'none',
            }}>{c.label}</span>
          </motion.div>
        ))}
      </div>
      <Btn variant="jungle" size="lg" onClick={onComplete} disabled={!allChecked}>
        {allChecked ? 'Submit Proof' : 'Complete all steps first'}
      </Btn>
    </div>
  );
}

function ProofUploadScreen({ mission, onBack, onSuccess }: { mission: typeof mockMissions[0]; onBack: () => void; onSuccess: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const handleUpload = () => {
    setUploading(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onSuccess, 500);
          return 100;
        }
        return p + 10;
      });
    }, 200);
  };
  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Submit Proof" onBack={onBack} />
      <MascotView scene="proof_required" compact />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '24px 0' }}>
        <Card tone="surface" style={{ width: '100%', maxWidth: 340, padding: 18 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Proof checklist</div>
          <div style={{ display: 'grid', gap: 10 }}>
            {['One clear photo', 'Mission action visible', 'Safe distance maintained'].map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}>
                <CheckCircle2 size={16} color={C.primary} />
                <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.ink }}>{item}</span>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ width: 100, height: 100, borderRadius: 28, backgroundColor: C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px dashed ${C.hairline2}` }}>
          <Camera size={40} color={C.muted} />
        </div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, textAlign: 'center' }}>Take a photo of your care action</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>AI will verify your proof and award points</div>
        {uploading && (
          <div style={{ width: '100%', maxWidth: 280 }}>
            <div style={{ height: 8, borderRadius: 4, backgroundColor: C.paper2, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{ width: `${progress}%`, height: '100%', borderRadius: 4, backgroundColor: C.jungle, transition: 'width 0.2s ease' }} />
            </div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted, textAlign: 'center' }}>AI Verification: {progress}%</div>
          </div>
        )}
        <Btn variant="jungle" size="lg" onClick={handleUpload} disabled={uploading}>
          {uploading ? <Loader2 size={20} className="animate-spin" /> : 'Upload Photo'}
        </Btn>
      </div>
    </div>
  );
}

function BadgeUnlockAnimation({ badgeId, onComplete }: { badgeId: string; onComplete: () => void }) {
  const badge = mockBadges.find((b) => b.id === badgeId);
  if (!badge) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed', inset: 0, backgroundColor: C.overlay, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onComplete}
    >
      <motion.div
        initial={{ scale: 0.3, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.2 }}
        style={{
          width: 200, padding: 32, borderRadius: 32,
          backgroundColor: C[badge.tone as keyof typeof C],
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: `0 14px 34px ${C.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeInOut' }}
          style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: withOpacity('#FFFFFF', 0.2),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <badge.icon size={40} color="#fff" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#fff', textAlign: 'center' }}
        >
          Badge Unlocked!
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16, color: withOpacity('#FFFFFF', 0.9), textAlign: 'center' }}
        >
          {badge.title}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: withOpacity('#FFFFFF', 0.7), textAlign: 'center', maxWidth: 160, lineHeight: 1.5 }}
        >
          {badge.description}
        </motion.div>
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onComplete}
          style={{
            marginTop: 8, padding: '12px 32px', borderRadius: 16, border: 'none',
            backgroundColor: withOpacity('#FFFFFF', 0.25), color: '#fff',
            fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, cursor: 'pointer',
          }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function SuccessScreen({ mission, onHome, onViewImpact, newlyEarnedBadge }: { mission: typeof mockMissions[0]; onHome: () => void; onViewImpact: () => void; newlyEarnedBadge: string | null }) {
  const [showBadgeAnimation, setShowBadgeAnimation] = useState(!!newlyEarnedBadge);
  const [badgeDismissed, setBadgeDismissed] = useState(false);
  const nextMissionLabel = mission.id === 'm1' ? 'Refill Water' : mission.id === 'm2' ? 'Report Animal' : 'Next Mission';

  return (
    <div style={{ padding: '0 16px 100px', position: 'relative' }}>
      <Confetti />
      <ScreenHeader title="Mission Complete!" onBack={onHome} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '8px 0 0' }}>
        <div style={{ width: '100%', padding: '24px 20px', borderRadius: 30, background: `linear-gradient(135deg, ${C.jungle} 0%, ${C.jungleDeep} 100%)`, color: '#fff', boxShadow: `0 12px 24px ${withOpacity(C.jungle, 0.18)}`, textAlign: 'center' }}>
          <div style={{ marginBottom: 14 }}>
            <MascotView scene="mission_success" size="lg" showBubble={false} />
          </div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.7), textTransform: 'uppercase', letterSpacing: 0.1, marginBottom: 8 }}>Care mission verified</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 32, color: '#fff', textAlign: 'center', lineHeight: 1.05, marginBottom: 10 }}>You made this neighborhood kinder today.</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: withOpacity('#FFFFFF', 0.84), textAlign: 'center', maxWidth: 300, lineHeight: 1.65, margin: '0 auto 18px' }}>Your action has been counted, your rewards have been added, and the next act of care is ready when you are.</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { value: `+${mission.rewardPoints}`, label: 'Points', background: C.goldSoft, color: C.goldInk },
              { value: '+1', label: 'Heart', background: withOpacity('#FFFFFF', 0.14), color: '#fff' },
              { value: '+1', label: 'Streak', background: withOpacity('#FFFFFF', 0.14), color: '#fff' },
            ].map((item) => (
              <div key={item.label} style={{ padding: '12px 10px', borderRadius: 18, backgroundColor: item.background, color: item.color }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24 }}>{item.value}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.08, opacity: 0.82 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        {!badgeDismissed && newlyEarnedBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ width: '100%' }}
          >
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>New reward</div>
            <Card tone={newlyEarnedBadge === 'b1' ? 'gold' : 'sky'} style={{ width: '100%', textAlign: 'left', padding: 20, cursor: 'pointer' }} onClick={() => setShowBadgeAnimation(true)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 54, height: 54, borderRadius: 16, backgroundColor: withOpacity('#FFFFFF', 0.22), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Award size={28} color={newlyEarnedBadge === 'b1' ? C.goldInk : '#fff'} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 19, color: newlyEarnedBadge === 'b1' ? C.goldInk : '#fff', marginBottom: 4 }}>{newlyEarnedBadge === 'b1' ? 'First Feeder' : 'Water Bearer'}</div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: newlyEarnedBadge === 'b1' ? C.goldDeep : withOpacity('#FFFFFF', 0.82) }}>Tap to open your badge celebration</div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
        <Card tone="surface" style={{ width: '100%', padding: 18 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 8 }}>Next unlock</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 6 }}>{nextMissionLabel} is now ready for you</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, lineHeight: 1.6 }}>Stay consistent, keep your streak alive, and turn today&apos;s small win into a lasting care habit.</div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
          <Btn variant="jungle" size="lg" onClick={onHome}>Continue to Home</Btn>
          <Btn
            variant="ghost"
            size="md"
            onClick={onViewImpact}
            style={{ background: C.surface, backdropFilter: 'none' }}
          >
            View Impact
          </Btn>
        </div>
      </div>
      <AnimatePresence>
        {showBadgeAnimation && newlyEarnedBadge && (
          <BadgeUnlockAnimation
            badgeId={newlyEarnedBadge}
            onComplete={() => { setShowBadgeAnimation(false); setBadgeDismissed(true); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ImpactScreen({ setScreen, impactEvents, profile }: { setScreen: (s: Screen) => void; impactEvents: string[]; profile: any }) {
  const { likedStories, bookmarkedStories, toggleLikeStory, toggleBookmarkStory, skeletonLoading } = useApp();
  const [filter, setFilter] = useState<'zone' | 'city' | 'state'>('zone');
  const [selectedStory, setSelectedStory] = useState<typeof careStories[0] | null>(null);
  const data = communityImpact[filter === 'state' ? 'national' : filter];
  const fallbackImage = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop';

  if (selectedStory) {
    const isLiked = likedStories.includes(selectedStory.id);
    const isBookmarked = bookmarkedStories.includes(selectedStory.id);
    const verifiedCaseMetrics = [
      { label: 'Verification', value: 'AI + local helper' },
      { label: 'Response time', value: selectedStory.respondent ? '14 min' : 'Pending' },
      { label: 'Helpers', value: `${Math.max(selectedStory.helpers.length, 1)}` },
    ];
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Story" onBack={() => setSelectedStory(null)} />
        <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
          <img
            src={selectedStory.imageUrl || fallbackImage}
            alt={selectedStory.title}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== fallbackImage) img.src = fallbackImage;
            }}
            style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }}
          />
            {selectedStory.mediaType === 'video' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: withOpacity('#000000', 0.3) }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: withOpacity('#FFFFFF', 0.9), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={C.jungle}><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              </div>
            )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Pill tone={selectedStory.badgeTone} variant="soft">{selectedStory.badge}</Pill>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic("select"); toggleLikeStory(selectedStory.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Heart size={18} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic("select"); toggleBookmarkStory(selectedStory.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Bookmark size={18} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
            </motion.button>
            <motion.button whileTap={{ scale: 0.8 }} onClick={() => { if (navigator.share) navigator.share({ title: selectedStory.title, text: selectedStory.body, url: window.location.href }); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <Share2 size={18} color={C.muted} />
            </motion.button>
          </div>
        </div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 8, lineHeight: 1.2 }}>{selectedStory.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>{selectedStory.date}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color={C.muted} /><span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>{selectedStory.location}</span></div>
        </div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, lineHeight: 1.75, marginBottom: 20 }}>{selectedStory.fullBody}</div>
        <div style={{ marginBottom: 20, padding: '16px 16px', background: `linear-gradient(180deg, ${C.surface} 0%, ${C.paper2} 100%)`, borderRadius: 20, border: `1px solid ${C.hairline}` }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Verified case metrics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {verifiedCaseMetrics.map((metric) => (
              <div key={metric.label} style={{ padding: '10px 8px', borderRadius: 16, backgroundColor: C.surface, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink, lineHeight: 1.25 }}>{metric.value}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 4 }}>{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '14px 16px', backgroundColor: C.surface, borderRadius: 16, border: `2px solid ${C.hairline}` }}>
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>Reported by</div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{selectedStory.reporter}</div></div>
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>Responded by</div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{selectedStory.respondent}</div></div>
        </div>
        {selectedStory.helpers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Helpers involved</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedStory.helpers.map((h) => (
                <div key={h} style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.sky, color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Fredoka', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${C.paper}` }}>{h}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (impactEvents.length === 0 && !skeletonLoading) {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Impact" />
        <EmptyState icon={Heart} title="No impact yet" subtitle="Complete your first mission to start making a difference in your community." actionLabel="Start Mission" onAction={() => setScreen('home')} />
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Impact" />
      <MascotView scene="impact_updated" compact />
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, padding: 6, borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}>
          {[{ key: 'zone' as const, label: 'Neighbourhood' }, { key: 'city' as const, label: 'City' }, { key: 'state' as const, label: 'National' }].map((f) => (
            <motion.button key={f.key} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f.key)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', background: filter === f.key ? `linear-gradient(180deg, ${C.primary} 0%, ${C.primaryHover} 100%)` : 'transparent', color: filter === f.key ? '#fff' : C.ink2, fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.06, cursor: 'pointer', boxShadow: filter === f.key ? `0 8px 14px ${withOpacity(C.primary, 0.12)}` : 'none' }}>{f.label}</motion.button>
          ))}
        </div>

        {skeletonLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            <Skeleton width="100%" height={120} />
            <Skeleton width="100%" height={180} />
            <Skeleton width="100%" height={180} />
          </div>
        ) : (
          <>
            <Card tone="surface" style={{ marginBottom: 20, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Heart size={24} color={C.primary} fill={withOpacity(C.primary, 0.12)} />
                </div>
                <div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.jungleDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 8 }}>{data.name}</div>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: C.ink, lineHeight: 1.1, marginBottom: 8 }}>Verified local care, visible in one place.</div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>Track how care actions, verified reports, and rescue follow-through are improving your area over time.</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.jungleDeep }}>{typeof data.helpers === 'number' ? data.helpers.toLocaleString() : data.helpers}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Helpers</div></div>
                <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.skyDeep }}>{typeof data.animalsHelped === 'number' ? data.animalsHelped.toLocaleString() : data.animalsHelped}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Animals</div></div>
                <div style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.goldDeep }}>{typeof data.missionsCompleted === 'number' ? data.missionsCompleted.toLocaleString() : data.missionsCompleted}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Missions</div></div>
              </div>
            </Card>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 2 }}>Care Feed</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>Verified stories, rescue moments, and community follow-up from your area.</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {careStories.map((s) => {
                const isLiked = likedStories.includes(s.id);
                const isBookmarked = bookmarkedStories.includes(s.id);
                const imageSrc = s.imageUrl || fallbackImage;
                return (
                  <motion.div key={s.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedStory(s)} style={{ cursor: 'pointer' }}>
                    <Card tone="surface" style={{ padding: 0, overflow: 'hidden' }}>
                      <div style={{ position: 'relative' }}>
                        <img
                          src={imageSrc}
                          alt={s.title}
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (img.src !== fallbackImage) img.src = fallbackImage;
                          }}
                          style={{ width: '100%', height: 184, objectFit: 'cover', display: 'block' }}
                        />
                        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${withOpacity('#000000', 0.28)}, transparent 55%)` }} />
                      </div>
                      <div style={{ padding: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <Pill tone={s.badgeTone} variant="soft">{s.badge}</Pill>
                          {s.mediaType === 'video' && <Pill tone="sky" variant="soft">Video</Pill>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); haptic("select"); toggleLikeStory(s.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Heart size={14} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
                            </motion.button>
                            <motion.button whileTap={{ scale: 0.8 }} onClick={(e) => { e.stopPropagation(); haptic("select"); toggleBookmarkStory(s.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                              <Bookmark size={14} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
                            </motion.button>
                          </div>
                        </div>
                        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>{s.title}</div>
                        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>{s.body}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>{s.date}</span>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>·</span>
                          <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>{s.location}</span>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        <Card tone="paper" style={{ marginTop: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Heart size={18} color={C.coral} />
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2 }}>Every mission you complete adds to your community's impact. Check your personal stats on the Ranks tab.</div>
        </Card>
      </div>
    </div>
  );
}

function LeaderboardScreen({ setScreen, users, profile, onJoin, onCancel, name, setName, phone, setPhone, gender, setGender, neighborhood }: {
  setScreen: (s: Screen) => void; users: any[]; profile: any;
  onJoin: () => void; onCancel: () => void;
  name: string; setName: (n: string) => void;
  phone: string; setPhone: (p: string) => void;
  gender: string; setGender: (g: string) => void;
  neighborhood: string;
}) {
  const [showRegister, setShowRegister] = useState(!profile.leaderboardOptIn);
  const [localName, setLocalName] = useState(name);
  const [localPhone, setLocalPhone] = useState(phone);
  const phoneValid = /^(\+91[\s]?)?[6-9]\d{9}$/.test(localPhone.replace(/\s/g, ''));
  const canJoin = localName.trim().length > 0 && phoneValid;

  const handleJoin = () => {
    if (!canJoin) return;
    setName(localName);
    setPhone(localPhone);
    onJoin();
    setShowRegister(false);
  };
  const handleCancel = () => {
    onCancel();
    setScreen('home');
  };

  if (!showRegister && profile.leaderboardOptIn) {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Ranks" />
        <MascotView scene="leaderboard_success" compact />
        <Card tone="surface" style={{ marginBottom: 18, marginTop: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: C.skySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Trophy size={24} color={C.skyDeep} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.skyDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 8 }}>Community leaderboard</div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 6 }}>{profile.name}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>Rank #{users.length + 1} in your care zone with {profile.points} points earned through verified action.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { value: users.length + 1, label: 'Your rank', tone: C.skyDeep },
              { value: users.length, label: 'Helpers', tone: C.jungleDeep },
              { value: users.reduce((sum, u) => sum + u.points, 0) + profile.points, label: 'Zone pts', tone: C.goldDeep },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: item.tone }}>{item.value}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} color={C.coral} />
          {profile.neighborhood || 'Indiranagar'} Care Zone
        </div>
        <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
          {users.slice(0, 3).map((u, index) => (
            <div key={u.id} style={{ padding: '14px 14px', borderRadius: 22, background: index === 0 ? `linear-gradient(135deg, ${C.goldSoft} 0%, ${C.surface} 100%)` : C.surface, border: `1px solid ${index === 0 ? C.gold : C.hairline}`, boxShadow: index === 0 ? `0 8px 16px ${withOpacity(C.gold, 0.14)}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 34, textAlign: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: index === 0 ? C.goldDeep : C.muted }}>{['🥇', '🥈', '🥉'][u.rank - 1]}</div>
                <Avatar name={u.name} size={40} tone={u.tone} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink }}>{u.name}</div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, color: C.muted }}>{u.zone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17, color: C.goldDeep }}>{u.points} pts</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink, marginBottom: 8 }}>All Helpers</div>
        {users.slice(3).map((u) => (
          <Card tone="surface" key={u.id} style={{ marginBottom: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.muted, width: 28, textAlign: 'center' }}>
                {u.rank}
              </div>
              <Avatar name={u.name} size={36} tone={u.tone} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink }}>{u.name}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.muted }}>{u.zone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.goldDeep }}>{u.points} pts</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2 }}>
                  {u.change === 'up' && <TrendingUp size={12} color={C.jungle} />}
                  {u.change === 'down' && <TrendingDown size={12} color={C.coral} />}
                  {u.change === 'same' && <Minus size={12} color={C.muted} />}
                  <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted }}>{u.change}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Ranks" onBack={handleCancel} />
      <MascotView scene="leaderboard_registration" compact />
      <Card tone="surface" style={{ marginTop: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: C.skySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1px solid ${withOpacity(C.sky, 0.18)}` }}>
            <Trophy size={24} color={C.skyDeep} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 6 }}>Join the community leaderboard</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, lineHeight: 1.65 }}>See your rank, track your progress, and get recognized for consistent care.</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
          {[
            { label: 'Your rank', value: 'Live' },
            { label: 'Points', value: 'Counted' },
            { label: 'Badges', value: 'Visible' },
          ].map((i) => (
            <div key={i.label} style={{ padding: '12px 10px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}`, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink }}>{i.value}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 4 }}>{i.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
          <div>
            <label style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6, display: 'block' }}>Display name *</label>
            <input value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: `2px solid ${C.hairline}`, fontFamily: 'Fredoka', fontSize: 18, color: C.ink, backgroundColor: C.surface, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6, display: 'block' }}>Phone number *</label>
            <input value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: `2px solid ${phoneValid || !localPhone ? C.hairline : C.coral}`, fontFamily: 'Fredoka', fontSize: 18, color: C.ink, backgroundColor: C.surface, outline: 'none' }} />
            {localPhone && !phoneValid && <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, color: C.coral, marginTop: 6 }}>Enter a valid 10-digit Indian number</div>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="sky" size="lg" onClick={handleJoin} disabled={!canJoin}>Join Ranks</Btn>
          <Btn variant="ghost" size="md" onClick={handleCancel}>Not Now</Btn>
        </div>
      </Card>
    </div>
  );
}

function ProfileScreen({ profile, badges, onReset, onStartMission }: { profile: any; badges: any[]; onReset: () => void; onStartMission: () => void }) {
  const { themeMode, setThemeMode, hapticEnabled, toggleHapticEnabled, buddyMode, toggleBuddyMode, pushNotifications, togglePushNotifications, streakFreeze, toggleStreakFreeze, locationHistory } = useApp();
  const [showReset, setShowReset] = useState(false);
  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Profile" />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Avatar name={profile.name} size={72} tone={profile.avatarTone} />
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink }}>{profile.name}</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: C.muted }}>Indiranagar Care Zone</div>
        <Pill tone="jungle">{profile.careLevel}</Pill>
      </div>
      <MascotView scene={profile.missionsCompleted === 0 ? 'profile_beginner' : 'profile_progress'} compact />
      {profile.missionsCompleted === 0 ? (
        <EmptyState icon={MapPin} title="Your journey starts here" subtitle="Complete your first mission to see your progress, badges, and impact grow." actionLabel="Start Mission" onAction={onStartMission} />
      ) : (
        <>
          <Card tone="surface" style={{ marginBottom: 20, marginTop: 12, padding: 20 }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.jungleDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Care snapshot</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {[
                { value: profile.missionsCompleted, label: 'Missions', tone: C.jungleDeep },
                { value: profile.points, label: 'Points', tone: C.goldDeep },
                { value: profile.streak, label: 'Streak', tone: C.coralDeep },
                { value: profile.badgesEarned, label: 'Badges', tone: C.skyDeep },
              ].map((item) => (
                <div key={item.label} style={{ padding: '14px 12px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: item.tone, marginBottom: 4 }}>{item.value}</div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted }}>{item.label}</div>
                </div>
              ))}
            </div>
          </Card>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>My Badges</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {badges.map((b) => {
                const earned = profile.earnedBadgeIds?.includes(b.id);
                const toneColor = C[b.tone as keyof typeof C] as string;
                return (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, backgroundColor: earned ? withOpacity(toneColor, 0.12) : C.lockedSoft, border: `1px solid ${earned ? withOpacity(toneColor, 0.2) : C.border}`, borderRadius: 16 }}>
                    <b.icon size={22} color={earned ? toneColor : C.locked} />
                    <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: earned ? C.ink : C.textSecondary, textAlign: 'center' }}>{b.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 6 }}>Preferences</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, marginBottom: 12 }}>Control how Straytopia feels and reminds you.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 12, borderRadius: 22, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}>
          <div style={{ padding: '4px 4px 10px' }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 4 }}>Theme</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, marginBottom: 12 }}>Choose Light, Dark, or follow your device setting.</div>
            <ThemeModeSelector mode={themeMode} onChange={setThemeMode} />
          </div>
          <SettingToggle icon={Smartphone} label="Haptic Feedback" description="Vibrate on interactions" checked={hapticEnabled} onChange={toggleHapticEnabled} />
          <SettingToggle icon={Bell} label="Push Notifications" description="Get mission reminders" checked={pushNotifications} onChange={togglePushNotifications} />
          <SettingToggle icon={Users} label="Buddy Mode" description="Show nearby helpers" checked={buddyMode} onChange={toggleBuddyMode} />
          <SettingToggle icon={Shield} label="Streak Protection" description="Freeze streak for a day" checked={streakFreeze} onChange={toggleStreakFreeze} />
        </div>
      </div>
      {locationHistory.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Location History</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {locationHistory.map((loc) => (
              <Pill key={loc} tone="sky">{loc}</Pill>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 16, borderRadius: 22, backgroundColor: C.coralSoft }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17, color: C.coralDeep }}>Danger Zone</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.coralInk, lineHeight: 1.55 }}>Clear your demo progress, badges, and journey data if you want to restart from the beginning.</div>
        <Btn variant="coral" size="md" leftIcon={<RotateCcw size={18} />} onClick={() => setShowReset(true)}>Reset Demo Journey</Btn>
      </div>
      <ConfirmationDialog open={showReset} title="Reset Demo Journey?" body="This will clear all progress, missions, and badges. You'll start fresh." confirmLabel="Reset" cancelLabel="Cancel" confirmVariant="coral" onConfirm={() => { onReset(); setShowReset(false); }} onCancel={() => setShowReset(false)} />
    </div>
  );
}

function ActionSheet({ open, onClose, onAction }: { open: boolean; onClose: () => void; onAction: (action: string) => void }) {
  if (!open) return null;
  const actions = [
    { icon: AlertTriangle, label: 'Report Animal', desc: 'File a rescue report', tone: 'coral' as const, action: 'report' },
    { icon: Siren, label: 'SOS Emergency', desc: 'Alert nearby authorities', tone: 'coral' as const, action: 'sos' },
    { icon: Users, label: 'Invite Care Buddy', desc: 'Share Straytopia', tone: 'gold' as const, action: 'invite' },
  ];
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: C.overlay, zIndex: 150 }} onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.surfaceElevated, borderRadius: '24px 24px 0 0', padding: '24px 16px 40px', borderTop: `1px solid ${C.borderStrong}`, boxShadow: `0 -12px 24px ${C.shadow}` }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.hairline2, margin: '0 auto 20px' }} />
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 20 }}>Quick Actions</div>
        {actions.map((a) => (
          <motion.button key={a.label} whileTap={{ scale: 0.98 }} onClick={() => { onAction(a.action); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: withOpacity(C[a.tone], 0.12), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a.icon size={24} color={C[a.tone]} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink }}>{a.label}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>{a.desc}</div>
            </div>
            <ChevronRight size={20} color={C.muted} style={{ marginLeft: 'auto' }} />
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}

function InviteBuddyScreen({ onBack }: { onBack: () => void }) {
  const shareText = encodeURIComponent('Join me on Straytopia! Help stray animals in our neighborhood. One small act of care at a time.');
  const shareUrl = encodeURIComponent('https://straytopia.vercel.app');

  const WhatsAppIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16c0 2.568.696 4.976 1.904 7.056L2.2 29.8l6.944-1.68A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2z" fill="#25D366"/>
      <path d="M22.4 20.16c-.32-.16-1.88-.92-2.16-1.04-.28-.12-.48-.16-.68.16s-.76 1.04-.92 1.24c-.16.2-.36.24-.68.08-.32-.16-1.36-.52-2.6-1.64-.96-.88-1.6-1.96-1.8-2.28-.2-.32-.04-.48.12-.68.12-.16.28-.4.44-.6.16-.2.2-.36.32-.6.12-.24.04-.44-.04-.6-.08-.16-.68-1.64-.92-2.24-.24-.6-.48-.52-.68-.52h-.56c-.2 0-.52.08-.76.36-.24.28-.92.92-.92 2.24s.96 2.6 1.08 2.76c.12.16 1.88 3.16 4.6 4.24.64.28 1.12.44 1.52.56.64.2 1.2.16 1.64.12.52-.08 1.6-.64 1.8-1.28.24-.64.24-1.16.16-1.28-.08-.12-.28-.2-.6-.36z" fill="#fff"/>
    </svg>
  );

  const TelegramIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#0088cc"/>
      <path d="M22.2 10.4l-2.4 12.4c-.2.8-.6 1-1.2.6l-3.2-2.4-1.6 1.6c-.2.2-.4.4-.8.4l.2-3.2 6-5.4c.2-.2 0-.4-.4-.2l-7.4 4.6-3.2-1c-.8-.2-.8-.8.2-1.2l12.4-4.8c.6-.2 1.2.2 1 1z" fill="#fff"/>
    </svg>
  );

  const SMSIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 7.8 2 15c0 3.6 1.6 6.8 4.2 9.2.2.2.4.4.4.8l.4 2.4c0 .4.4.6.8.4l2.8-1.4c.2-.2.4-.2.6-.2 1.2.4 2.4.6 3.8.6 7.732 0 14-5.8 14-13S23.732 2 16 2z" fill={C.jungle}/>
      <path d="M10 14h12M10 18h8" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  const GmailIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#EA4335"/>
      <path d="M8 12l8 5 8-5M8 12v8h16v-8M8 12l8 5 8-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const FacebookIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="#1877F2"/>
      <path d="M20 16h-3v8h-4v-8h-2v-3h2v-2.5c0-1.5.8-2.5 2.5-2.5h2.5v3h-1.5c-.5 0-.5.2-.5.5V13h3l-.5 3z" fill="#fff"/>
    </svg>
  );

  const InstagramIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <defs>
        <linearGradient id="ig" x1="2" y1="30" x2="30" y2="2">
          <stop offset="0%" stopColor="#FEDA75"/>
          <stop offset="25%" stopColor="#FA7E1E"/>
          <stop offset="50%" stopColor="#D62976"/>
          <stop offset="75%" stopColor="#962FBF"/>
          <stop offset="100%" stopColor="#4F5BD5"/>
        </linearGradient>
      </defs>
      <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z" fill="url(#ig)"/>
      <rect x="8" y="8" width="16" height="16" rx="4" stroke="#fff" strokeWidth="2" fill="none"/>
      <circle cx="16" cy="16" r="4" stroke="#fff" strokeWidth="2" fill="none"/>
      <circle cx="22" cy="10" r="1.5" fill="#fff"/>
    </svg>
  );

  const sharePlatforms = [
    { name: 'WhatsApp', icon: <WhatsAppIcon />, color: '#25D366', url: 'https://wa.me/?text=' },
    { name: 'Telegram', icon: <TelegramIcon />, color: '#0088cc', url: 'https://t.me/share/url?url=&text=' },
    { name: 'SMS', icon: <SMSIcon />, color: C.jungle, url: 'sms:?body=' },
    { name: 'Gmail', icon: <GmailIcon />, color: '#EA4335', url: 'mailto:?subject=&body=' },
    { name: 'Facebook', icon: <FacebookIcon />, color: '#1877F2', url: 'https://www.facebook.com/sharer/sharer.php?u=' },
    { name: 'Instagram', icon: <InstagramIcon />, color: '#E4405F', url: '' },
  ];

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Invite Care Buddy" onBack={onBack} />
      <MascotView scene="onboarding_welcome" compact={false} />
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Card tone="surface" style={{ padding: '24px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: C.plumSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={24} color={C.plumDeep} />
            </div>
            <div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.plumDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 8 }}>Grow your care circle</div>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, lineHeight: 1.1, color: C.ink, marginBottom: 10 }}>Bring one more kind human into the journey.</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, lineHeight: 1.65, color: C.ink2, maxWidth: 290 }}>Invite friends to join Straytopia, complete local missions together, and help more animals consistently.</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { value: '8.2k+', label: 'Helpers', tone: C.plumDeep },
              { value: '340+', label: 'Zones', tone: C.skyDeep },
              { value: '12.4k+', label: 'Saved', tone: C.jungleDeep },
            ].map((item) => (
              <div key={item.label} style={{ padding: '12px 8px', borderRadius: 18, backgroundColor: C.cardMuted, border: `1px solid ${C.border}` }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: item.tone }}>{item.value}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Card>
        <div style={{ textAlign: 'left', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 4 }}>Share Straytopia</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>Send a quick invite on the platform your buddy already uses.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 340, margin: '0 auto' }}>
          {sharePlatforms.map((p) => (
            <motion.button
              key={p.name}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (p.url) {
                  const fullUrl = p.name === 'Gmail'
                    ? `${p.url}${encodeURIComponent('Join Straytopia - Help stray animals')}&${encodeURIComponent(shareText)}`
                    : p.name === 'SMS'
                    ? `${p.url}${shareText}`
                    : `${p.url}${shareUrl}&text=${shareText}`;
                  window.open(fullUrl, '_blank');
                }
              }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                padding: '18px 10px', borderRadius: 18, border: `1px solid ${C.hairline}`, cursor: 'pointer',
                background: `linear-gradient(180deg, ${C.surface} 0%, ${C.paper2} 100%)`,
              }}
            >
              {p.icon}
              <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: p.color }}>{p.name}</div>
            </motion.button>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Btn variant="ghost" size="md" onClick={onBack}>Close</Btn>
        </div>
      </div>
    </div>
  );
}

function SOSScreen({ onBack }: { onBack: () => void }) {
  const reducedMotion = useReducedMotion();
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alerted, setAlerted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const caseIdRef = useRef(`SOS-${Math.floor(Math.random() * 9000 + 1000)}`);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const startPress = () => {
    if (pressing || alerted) return;
    haptic('heavy');
    setPressing(true);
    setProgress(0);
    const startTime = Date.now();
    animRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / 3000, 1);
      setProgress(p);
      if (p >= 1) {
        if (animRef.current) clearInterval(animRef.current);
        haptic('error');
        setAlerted(true);
        setPressing(false);
      }
    }, 16);
    timerRef.current = setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);
      haptic('error');
      setAlerted(true);
      setPressing(false);
    }, 3000);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (animRef.current) clearInterval(animRef.current);
    setPressing(false);
    setProgress(0);
  };

  const secondsLeft = Math.max(0, 3 - progress * 3);

  if (alerted) {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="SOS Sent" onBack={onBack} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, padding: '32px 0' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            style={{ width: 100, height: 100, borderRadius: 50, backgroundColor: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Siren size={48} color={C.coralDeep} />
          </motion.div>
          <Card tone="coral" style={{ width: '100%', maxWidth: 320, padding: 20, textAlign: 'center', background: `radial-gradient(circle at top right, ${withOpacity('#FFFFFF', 0.16)} 0%, transparent 32%), linear-gradient(135deg, ${C.coral} 0%, ${C.coralDeep} 100%)` }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.72), textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Emergency case active</div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff', marginBottom: 8 }}>Authorities Alerted</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: withOpacity('#FFFFFF', 0.86), lineHeight: 1.6 }}>Emergency services and nearby rescue coordinators have been notified. Help is on the way.</div>
          </Card>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ width: '100%', maxWidth: 320 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { label: 'Case', value: caseIdRef.current },
                { label: 'ETA', value: '8 min' },
                { label: 'Helpers', value: '3 en route' },
              ].map((item) => (
                <Card key={item.label} tone="surface" style={{ padding: '12px 10px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink, lineHeight: 1.25 }}>{item.value}</div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 4 }}>{item.label}</div>
                </Card>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card tone="surface" style={{ maxWidth: 320, padding: 16, textAlign: 'left' }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.coralDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 8 }}>Shared safely</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: C.ink2, lineHeight: 1.6 }}>Your live location and a high-priority alert were shared with the nearest animal rescue team. Stay safe and keep distance from the animal.</div>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}
          >
            <Btn variant="jungle" size="lg" onClick={onBack}>Back to Home</Btn>
            <Btn variant="coral" size="md" onClick={() => { setAlerted(false); setProgress(0); }}>Cancel SOS</Btn>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="SOS Emergency" onBack={onBack} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '32px 0' }}>
        <Card tone="coral" style={{ width: '100%', maxWidth: 320, padding: 20, textAlign: 'center', background: `radial-gradient(circle at top right, ${withOpacity('#FFFFFF', 0.16)} 0%, transparent 32%), linear-gradient(135deg, ${C.coral} 0%, ${C.coralDeep} 100%)` }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: withOpacity('#FFFFFF', 0.72), textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Only for immediate danger</div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff', marginBottom: 8 }}>Emergency Alert</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: withOpacity('#FFFFFF', 0.86), lineHeight: 1.65 }}>Press and hold for 3 seconds to alert nearby authorities and rescue teams right away.</div>
        </Card>

        <div style={{ position: 'relative', width: 220, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {!reducedMotion && [0, 1].map((ring) => (
            <motion.div
              key={ring}
              animate={pressing ? { scale: 1, opacity: 0.16 } : { scale: [1, 1.12 + ring * 0.08, 1], opacity: [0.18, 0.04, 0.18] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: ring * 0.35 }}
              style={{ position: 'absolute', width: 166 + ring * 24, height: 166 + ring * 24, borderRadius: '50%', border: `1px solid ${withOpacity(C.coral, 0.18)}` }}
            />
          ))}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onMouseDown={startPress}
            onMouseUp={endPress}
            onMouseLeave={endPress}
            onTouchStart={startPress}
            onTouchEnd={endPress}
            onTouchCancel={endPress}
            style={{
              width: 164, height: 164, borderRadius: 82, position: 'relative',
              backgroundColor: pressing ? C.coral : C.coralSoft,
              border: `1px solid ${pressing ? withOpacity('#FFFFFF', 0.18) : withOpacity(C.coral, 0.12)}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: pressing ? `0 0 26px ${withOpacity(C.coral, 0.28)}` : `0 12px 20px ${withOpacity(C.coral, 0.1)}`,
              transition: 'background-color 0.2s, box-shadow 0.2s',
            }}
          >
            <svg width="164" height="164" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
              <circle cx="82" cy="82" r="76" fill="none" stroke={withOpacity(C.coralDeep, 0.18)} strokeWidth="6" />
              <circle
                cx="82" cy="82" r="76" fill="none" stroke={pressing ? '#FFFFFF' : C.coralDeep} strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 76}`}
                strokeDashoffset={`${2 * Math.PI * 76 * (1 - progress)}`}
                style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }}
              />
            </svg>
            <Siren size={50} color={pressing ? '#fff' : C.coralDeep} />
            {pressing && (
              <div style={{ position: 'absolute', bottom: 26, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 17, color: '#fff' }}>
                {Math.round(progress * 100)}%
              </div>
            )}
          </motion.button>
        </div>

        <div style={{ textAlign: 'center', maxWidth: 300 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: pressing ? C.coralDeep : C.ink, marginBottom: 6 }}>{pressing ? `Keep holding... ${secondsLeft.toFixed(1)}s` : 'Press and hold to trigger SOS'}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, lineHeight: 1.6 }}>{pressing ? 'Release before 3 seconds to cancel safely.' : 'Use this only if the animal is in immediate danger, severe injury, or traffic risk.'}</div>
        </div>

        <Card tone="surface" style={{ width: '100%', maxWidth: 320, padding: 16 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.coralDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 4 }}>When to use SOS</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>Severe injury, heavy bleeding, road traffic exposure, or an animal trapped in immediate danger.</div>
            </div>
            <div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.coralDeep, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 4 }}>What gets shared</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>Your live location, emergency priority, and the nearest rescue context for faster response.</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportSuccessScreen({ condition, urgency, photo, onBack, onSuccess }: {
  condition: string;
  urgency: string;
  photo: string | null;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [phase, setPhase] = useState<'dispatching' | 'tracking'>('dispatching');
  const [dispatchStep, setDispatchStep] = useState(0);
  const reportId = Math.floor(Math.random() * 90000 + 10000);

  const dispatchSteps = [
    { icon: MapPin, label: 'Locating nearby shelters...', color: C.sky },
    { icon: Siren, label: 'Alerting rescue operators...', color: C.coral },
    { icon: Users, label: 'Notifying nearby helpers...', color: C.jungle },
    { icon: CheckCircle2, label: 'Report dispatched!', color: C.gold },
  ];

  useEffect(() => {
    if (phase !== 'dispatching') return;
    if (dispatchStep < 3) {
      const timer = setTimeout(() => setDispatchStep((s) => s + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setPhase('tracking'), 1000);
      return () => clearTimeout(timer);
    }
  }, [dispatchStep, phase]);

  const caseJourney = [
    { status: 'reported', label: 'Reported', time: 'Just now', done: true, icon: AlertTriangle },
    { status: 'dispatched', label: 'Alert Sent', time: 'Just now', done: true, icon: Siren },
    { status: 'rescued', label: 'Rescued', time: 'Pending', done: false, icon: Heart },
    { status: 'treated', label: 'Medical Care', time: 'Pending', done: false, icon: Droplets },
    { status: 'healed', label: 'Healed', time: 'Pending', done: false, icon: Star },
    { status: 'rehabilitated', label: 'Rehabilitated', time: 'Pending', done: false, icon: CheckCircle2 },
  ];

  if (phase === 'dispatching') {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80dvh', gap: 32 }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Siren size={56} color={C.coralDeep} />
          </motion.div>

          <div style={{ textAlign: 'center', maxWidth: 320 }}>
            <Pill tone="coral">Rescue dispatch in progress</Pill>
            <motion.div
              key={dispatchStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 8, marginTop: 12 }}
            >
              {dispatchSteps[dispatchStep].label}
            </motion.div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, lineHeight: 1.6 }}>Connecting you with the nearest rescue teams and helpers in your care zone.</div>
          </div>

          <Card tone="surface" style={{ width: '100%', maxWidth: 320, padding: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {dispatchSteps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= dispatchStep ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, backgroundColor: i <= dispatchStep ? withOpacity(s.color, 0.12) : 'transparent' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: i <= dispatchStep ? s.color : C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i < dispatchStep ? <Check size={16} color="#fff" /> : <s.icon size={16} color={i <= dispatchStep ? '#fff' : C.muted} />}
                </div>
                <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: i <= dispatchStep ? C.ink : C.muted }}>{s.label}</span>
              </motion.div>
            ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Case Tracking" onBack={onBack} />
      <MascotView scene="mission_success" compact={false} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: C.coralSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <CheckCircle2 size={40} color={C.coralDeep} />
        </motion.div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 4 }}>Rescue report verified and shared</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.muted }}>Case #{reportId} is now active in the local care network</div>
        </div>

        <Card tone="paper" style={{ width: '100%', maxWidth: 300, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>Condition</span>
            <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{condition}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>Urgency</span>
            <Pill tone={urgency === 'critical' ? 'coral' : urgency === 'high' ? 'coral' : urgency === 'medium' ? 'gold' : 'jungle'}>{urgency}</Pill>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>Photo</span>
            <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: photo ? C.jungleDeep : C.muted }}>{photo ? 'Attached' : 'None'}</span>
          </div>
        </Card>

        <div style={{ width: '100%', maxWidth: 300 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 10 }}>Verified case metrics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { label: 'Status', value: 'Verified' },
              { label: 'ETA', value: '14 min' },
              { label: 'Helpers', value: '4' },
            ].map((metric) => (
              <div key={metric.label} style={{ padding: '12px 8px', borderRadius: 16, background: `linear-gradient(180deg, ${C.surface} 0%, ${C.paper2} 100%)`, border: `1px solid ${C.hairline}`, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink }}>{metric.value}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.08, marginTop: 4 }}>{metric.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', maxWidth: 300 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 6 }}>Case Journey</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.55, marginBottom: 16 }}>You&apos;ll be able to follow what happens next, from dispatch to rescue follow-through.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {caseJourney.map((item, i) => {
              const isLast = i === caseJourney.length - 1;
              return (
                <div key={item.status} style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: item.done ? 1 : 0.7 }}
                      transition={{ delay: i * 0.15, type: 'spring', stiffness: 200 }}
                      style={{
                        width: 36, height: 36, borderRadius: 18, flexShrink: 0,
                        backgroundColor: item.done ? C.jungle : C.paper2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: item.done ? 'none' : `2px solid ${C.hairline}`,
                      }}
                    >
                      <item.icon size={16} color={item.done ? '#fff' : C.muted} />
                    </motion.div>
                    {!isLast && (
                      <div style={{ width: 2, height: 32, backgroundColor: item.done ? C.jungle : C.hairline, borderRadius: 1 }} />
                    )}
                  </div>
                  <div style={{ paddingTop: 6, paddingBottom: isLast ? 0 : 8 }}>
                    <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: item.done ? C.ink : C.muted }}>{item.label}</div>
                    <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: item.done ? C.jungleDeep : C.muted }}>{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Card tone="jungle" style={{ width: '100%', maxWidth: 300, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="#fff" />
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: withOpacity('#FFFFFF', 0.9) }}>You'll get updates as the case progresses. Stay safe and keep distance from the animal.</div>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
          <Btn variant="jungle" size="lg" onClick={onSuccess}>Back to Home</Btn>
          <Btn variant="ghost" size="md" onClick={onBack}>File Another Report</Btn>
        </div>
      </div>
    </div>
  );
}

function ReportAnimalScreen({ onBack, onSuccess }: { onBack: () => void; onSuccess: () => void }) {
  const [step, setStep] = useState(0);
  const [condition, setCondition] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const reducedMotion = useReducedMotion();

  const conditions = ['Injured', 'Sick', 'Trapped', 'Aggressive', 'Pregnant', 'Abandoned', 'In Danger'];
  const urgencies = [
    { key: 'low' as const, label: 'Low', desc: 'Animal is safe but needs attention', color: C.jungle },
    { key: 'medium' as const, label: 'Medium', desc: 'Animal may need help soon', color: C.gold },
    { key: 'high' as const, label: 'High', desc: 'Animal is in immediate danger', color: C.coral },
    { key: 'critical' as const, label: 'Critical', desc: 'Life-threatening situation', color: C.coralDeep },
  ];
  const steps = [
    { title: 'What condition is the animal in?', subtitle: 'Pick the closest description so responders understand the situation faster.' },
    { title: 'How urgent is this?', subtitle: 'Choose the urgency level carefully. Higher urgency sends faster alerts.' },
    { title: 'Add a photo', subtitle: 'A clear photo helps rescue teams identify the animal and assess the situation faster.' },
    { title: 'Add notes', subtitle: 'Share location clues, landmarks, behavior, or any other detail that helps rescuers.' },
  ];
  const currentStep = steps[step];
  const selectedUrgency = urgencies.find((item) => item.key === urgency);
  const canContinue = step === 0 ? Boolean(condition) : true;

  const goNext = () => {
    if (step === 0 && !condition) return;

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep(4);
    }, 1500);
  };

  if (step === 4) {
    return (
      <ReportSuccessScreen
        condition={condition}
        urgency={urgency}
        photo={photo}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Report Animal" onBack={onBack} />
      <MascotView scene="mission_detail" compact />
      <div style={{ marginTop: 16 }}>
        <Card tone="surface" style={{ marginBottom: 18, padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: C.coralDeep, textTransform: 'uppercase', letterSpacing: 0.08 }}>Step {step + 1} of 4</div>
            <Pill tone="coral">Rescue report</Pill>
          </div>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 6 }}>{currentStep.title}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, lineHeight: 1.6, marginBottom: 14 }}>{currentStep.subtitle}</div>
          <div style={{ height: 8, borderRadius: 9999, backgroundColor: C.cardMuted, overflow: 'hidden' }}>
            <motion.div
              animate={{ width: `${((step + 1) / 4) * 100}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              style={{ height: '100%', borderRadius: 9999, background: `linear-gradient(90deg, ${C.coral} 0%, ${C.gold} 100%)` }}
            />
          </div>
          {(condition || photo || notes) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
              {condition && <Pill tone="coral">{condition}</Pill>}
              {selectedUrgency && <Pill tone={selectedUrgency.key === 'low' ? 'jungle' : selectedUrgency.key === 'medium' ? 'gold' : 'coral'}>{selectedUrgency.label}</Pill>}
              {photo && <Pill tone="sky">Photo attached</Pill>}
              {notes.trim() && <Pill tone="plum">{notes.trim().length} chars</Pill>}
            </div>
          )}
        </Card>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
            transition={{ duration: reducedMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                {conditions.map((c) => (
                  <motion.button key={c} whileTap={{ scale: 0.96 }} onClick={() => setCondition(c)} style={{
                    padding: '12px 16px', borderRadius: 16, border: `1px solid ${condition === c ? C.coral : C.border}`,
                    background: condition === c ? `linear-gradient(180deg, ${C.coralSoft} 0%, ${withOpacity(C.coral, 0.08)} 100%)` : C.surface,
                    fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: condition === c ? C.coralDeep : C.ink,
                    cursor: 'pointer', boxShadow: condition === c ? `0 8px 14px ${withOpacity(C.coral, 0.08)}` : 'none',
                  }}>{c}</motion.button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                {urgencies.map((u) => (
                  <motion.div key={u.key} whileTap={{ scale: 0.98 }} onClick={() => setUrgency(u.key)} style={{
                    padding: '14px 16px', borderRadius: 18, border: `1px solid ${urgency === u.key ? u.color : C.border}`,
                    backgroundColor: urgency === u.key ? withOpacity(u.color, 0.12) : C.surfaceElevated, cursor: 'pointer',
                    boxShadow: urgency === u.key ? `0 8px 14px ${withOpacity(u.color, 0.08)}` : 'none',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: urgency === u.key ? u.color : C.cardMuted, border: urgency === u.key ? 'none' : `2px solid ${C.borderStrong}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {urgency === u.key && <Check size={14} color="#fff" />}
                      </div>
                      <div>
                        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: u.color }}>{u.label}</div>
                        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>{u.desc}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {step === 2 && (
              <div style={{ marginBottom: 24 }}>
                {photo ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ width: '100%', height: 220, borderRadius: 24, backgroundColor: C.paper2, overflow: 'hidden', position: 'relative', border: `1px solid ${C.border}`, boxShadow: `0 10px 18px ${withOpacity(C.shadow, 0.1)}` }}>
                      <img src={photo} alt="Animal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <motion.button
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setPhoto(null)}
                        style={{ position: 'absolute', top: 12, right: 12, width: 38, height: 38, borderRadius: 19, backgroundColor: withOpacity('#091018', 0.68), display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', backdropFilter: 'blur(10px)' }}
                      >
                        <X size={18} color="#fff" />
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.capture = 'environment';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setPhoto(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }
                      };
                      input.click();
                    }}
                    style={{
                      width: '100%', minHeight: 210, borderRadius: 24, border: `2px dashed ${C.borderStrong}`,
                      background: `linear-gradient(180deg, ${C.surfaceElevated} 0%, ${C.cardMuted} 100%)`, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', marginBottom: 16,
                    }}
                  >
                    <div style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}>
                      <Camera size={30} color={C.muted} />
                    </div>
                    <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink }}>Tap to take a photo</div>
                    <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.muted }}>or choose one from your gallery</div>
                  </motion.button>
                )}

                <Card tone="paper" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Camera size={18} color={C.skyDeep} />
                  <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2, lineHeight: 1.55 }}>No photo is still okay, but responders usually assess faster when they can see the animal clearly.</div>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div style={{ marginBottom: 24 }}>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe the location, animal appearance, nearby landmarks, or any safety detail..."
                  style={{
                    width: '100%', minHeight: 136, padding: 16, borderRadius: 18, border: `1px solid ${C.border}`,
                    fontFamily: 'Nunito', fontSize: 15, color: C.ink, backgroundColor: C.surfaceElevated,
                    resize: 'none', outline: 'none', marginBottom: 14, boxShadow: `0 8px 14px ${withOpacity(C.shadow, 0.06)}`,
                  }}
                />
                <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textAlign: 'right', marginBottom: 14 }}>{notes.trim().length} characters</div>
                <Card tone="paper" style={{ marginBottom: 0, padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <AlertCircle size={18} color={C.coral} />
                  <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2, lineHeight: 1.6 }}>Do not approach aggressive or injured animals. Report the case and let trained responders take over.</div>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: 'flex', gap: 10 }}>
          {step > 0 && (
            <Btn variant="ghost" size="md" onClick={() => setStep((current) => Math.max(0, current - 1))} style={{ flex: 1, marginBottom: 0 }}>
              Back
            </Btn>
          )}
          <Btn variant="coral" size="lg" onClick={goNext} disabled={!canContinue || submitting} style={{ flex: step > 0 ? 1.4 : 1, marginBottom: 0 }}>
            {step === 3 ? (submitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Report') : step === 2 ? 'Review Details' : 'Continue'}
          </Btn>
        </div>
      </div>
    </div>
  );
}

function LockedMissionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ textAlign: 'center' }}>
        <Saathi mood="thinking" trigger="blink" size={64} />
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginTop: 12, marginBottom: 8 }}>Mission Locked</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, lineHeight: 1.6, marginBottom: 20 }}>Complete Offer Food to unlock this mission.</div>
        <Btn variant="jungle" size="md" onClick={onClose}>Got it</Btn>
      </div>
    </Modal>
  );
}

export default function App() {
  const {
    screen, navigate, hasSeenSplash, hasSeenOnboarding, completeSplash, completeOnboarding, activeMission, missionStatus,
    resetDemo, points, streak, hearts, missionsCompleted, animalsHelped, earnedBadges, name, setName,
    phone, setPhone, gender, setGender, neighborhood,
    impactEvents, startMission, completeMission, toggleChecklistItem, checklistItems,
    setLeaderboardOptedIn, leaderboardOptedIn, logAnalytics, setActiveMission, lastCompletedMission,
    newlyEarnedBadge, onboardingPhase, darkMode, skipOnboarding, setSkeletonLoading, initializeTheme, syncSystemTheme,
  } = useApp();
  C = getTheme(darkMode);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  useEffect(() => {
    const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    const handleChange = () => syncSystemTheme();
    mediaQuery?.addEventListener('change', handleChange);
    return () => mediaQuery?.removeEventListener('change', handleChange);
  }, [syncSystemTheme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
  }, [darkMode]);

  // Simulate skeleton loading on initial load
  useEffect(() => {
    setSkeletonLoading(true);
    const timer = setTimeout(() => setSkeletonLoading(false), 800);
    return () => clearTimeout(timer);
  }, [setSkeletonLoading]);

  // Simulate push notification after first mission
  useEffect(() => {
    if (missionsCompleted === 1) {
      const timer = setTimeout(() => {
        setToast({ message: 'Mission Complete!', sub: 'You earned your first badge. Keep going!' });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [missionsCompleted]);

  const mascotScene = getMascotState({
    isNewUser: !hasSeenOnboarding || missionsCompleted === 0,
    hasActiveMission: !!activeMission,
    missionStatus: activeMission ? (missionStatus[activeMission as keyof MissionStatus] || 'available') : 'available',
    checklistProgress: Object.values(checklistItems).filter(Boolean).length / Object.keys(checklistItems).length,
    badgeUnlocked: earnedBadges.length > 0,
    rescueAlert: false,
    leaderboardVisible: screen === 'league',
    errorState: false,
    userInactive: false,
    screen,
    missionsCompleted,
    leaderboardOptedIn: false,
  });

  const handleStartMission = useCallback((id: string) => {
    logAnalytics('mission_started', { missionId: id });
    startMission(id);
    navigate('task');
  }, [logAnalytics, startMission, navigate]);

  const handleCompleteMission = useCallback(() => {
    logAnalytics('checklist_completed', { missionId: activeMission });
    navigate('proof');
  }, [activeMission, logAnalytics, navigate]);

  const handleProofSuccess = useCallback(() => {
    logAnalytics('proof_submitted', { missionId: activeMission });
    if (activeMission) {
      completeMission(activeMission);
      logAnalytics('mission_completed', { missionId: activeMission });
      logAnalytics('badge_earned', { badgeId: 'b1' });
      logAnalytics('second_mission_unlocked', { missionId: 'm2' });
    }
    navigate('success');
  }, [activeMission, completeMission, logAnalytics, navigate]);

  const handleReset = useCallback(() => {
    logAnalytics('demo_reset');
    resetDemo();
    navigate('home');
    setToast({ message: 'Journey Reset', sub: 'Start fresh with new missions' });
  }, [logAnalytics, resetDemo, navigate]);

  const handleJoinLeaderboard = useCallback(() => {
    logAnalytics('leaderboard_confirmed');
    setLeaderboardOptedIn(true);
    navigate('league');
  }, [logAnalytics, setLeaderboardOptedIn, navigate]);

  const handleCancelLeaderboard = useCallback(() => {
    logAnalytics('leaderboard_cancelled');
  }, [logAnalytics]);

  useEffect(() => {
    logAnalytics('mascot_scene_viewed', { scene: mascotScene });
  }, [mascotScene, logAnalytics]);

  const activeMissionData = mockMissions.find((m) => m.id === activeMission);
  const successMissionData = mockMissions.find((m) => m.id === (activeMission || lastCompletedMission));
  const profile = {
    points, streak, hearts, missionsCompleted, animalsHelped,
    badgesEarned: earnedBadges.length, leaderboardOptIn: leaderboardOptedIn,
    careLevel: missionsCompleted === 0 ? 'New Helper' : 'Kindness Keeper',
    name: name || 'Friend', avatarTone: 'jungle', earnedBadgeIds: earnedBadges,
  };

  if (!hasSeenSplash) {
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: C.primary, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.textPrimary }}>
        <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <SplashScreen onComplete={completeSplash} />
        </div>
      </div>
    );
  }

  if (!hasSeenOnboarding) {
    if (onboardingPhase < 2) {
      return (
        <div style={{ minHeight: '100dvh', backgroundColor: C.background, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.textPrimary }}>
          <AppBackdrop />
          <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
            <OnboardingIntroScreen />
          </div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: C.background, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.textPrimary }}>
        <AppBackdrop />
        <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          <SimpleOnboardingScreen onComplete={completeOnboarding} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: C.background, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.textPrimary }}>
      <AppBackdrop />
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ flex: 1, overflowY: 'auto', paddingTop: 8, paddingBottom: 100 }}>
          {screen === 'home' && (
            <HomeScreen
              setScreen={navigate} missions={mockMissions} missionStatus={missionStatus}
              points={points} streak={streak} hearts={hearts} missionsCompleted={missionsCompleted}
              animalsHelped={animalsHelped} earnedBadges={earnedBadges}
              onSelectMission={(id) => {
                const st = missionStatus[id as keyof MissionStatus];
                setActiveMission(id);
                if (st === 'in_progress') navigate('task');
                else if (st === 'proof_required') navigate('proof');
                else if (st === 'completed') navigate('success');
                else navigate('mission-detail');
              }}
              onLockedMission={() => { logAnalytics('mission_viewed', { status: 'locked' }); setShowLockedModal(true); }}
            />
          )}
          {screen === 'mission-detail' && activeMissionData && (
            <MissionDetailScreen
              mission={activeMissionData}
              onBack={() => navigate('home')}
              onStart={() => handleStartMission(activeMissionData.id)}
              status={missionStatus[activeMissionData.id as keyof MissionStatus] || 'available'}
            />
          )}
          {screen === 'task' && activeMissionData && (
            <ActiveMissionScreen
              mission={activeMissionData}
              onComplete={handleCompleteMission}
              onBack={() => navigate('home')}
              checklistItems={checklistItems}
              toggleChecklistItem={toggleChecklistItem}
            />
          )}
          {screen === 'proof' && activeMissionData && (
            <ProofUploadScreen mission={activeMissionData} onBack={() => navigate('home')} onSuccess={handleProofSuccess} />
          )}
          {screen === 'success' && successMissionData && (
            <SuccessScreen mission={successMissionData} onHome={() => navigate('home')} onViewImpact={() => navigate('stories')} newlyEarnedBadge={newlyEarnedBadge} />
          )}
          {screen === 'stories' && (
            <ImpactScreen setScreen={navigate} impactEvents={impactEvents} profile={profile} />
          )}
          {screen === 'league' && (
            <LeaderboardScreen
              setScreen={navigate} users={leaderboardUsers} profile={profile}
              onJoin={handleJoinLeaderboard} onCancel={handleCancelLeaderboard}
              name={name} setName={setName} phone={phone} setPhone={setPhone} gender={gender} setGender={setGender}
              neighborhood={neighborhood}
            />
          )}
          {screen === 'profile' && (
            <ProfileScreen profile={profile} badges={mockBadges} onReset={handleReset} onStartMission={() => navigate('home')} />
          )}
          {screen === 'action-report' && (
            <ReportAnimalScreen onBack={() => navigate('home')} onSuccess={() => navigate('home')} />
          )}
          {screen === 'action-sos' && (
            <SOSScreen onBack={() => navigate('home')} />
          )}
          {screen === 'action-invite' && (
            <InviteBuddyScreen onBack={() => navigate('home')} />
          )}
        </motion.div>
      </AnimatePresence>
      {['task', 'proof', 'success', 'onboarding', 'onboarding-2', 'onboarding-3', 'onboarding-4', 'action-report', 'action-sos', 'action-invite'].includes(screen) || (
        <TabBar active={screen} onChange={(t) => {
          if (t === 'action') setShowActionSheet(true);
          else navigate(t as Screen);
        }} />
      )}
      <ActionSheet open={showActionSheet} onClose={() => setShowActionSheet(false)} onAction={(action) => {
        if (action === 'report') navigate('action-report');
        else if (action === 'sos') navigate('action-sos');
        else if (action === 'invite') navigate('action-invite');
      }} />
      <LockedMissionModal open={showLockedModal} onClose={() => setShowLockedModal(false)} />
      <AnimatePresence>
        {toast && <SuccessToast key={toast.message} message={toast.message} sub={toast.sub} onClose={() => setToast(null)} />}
      </AnimatePresence>
      </div>
    </div>
  );
}
