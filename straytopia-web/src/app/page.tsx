'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp, Screen, MissionStatus } from '@/store/app';
import { COLOR, getTheme, ThemeColors } from '@/lib/theme';
import {
  missions as mockMissions, badges as mockBadges,
  leaderboardUsers, careStories, weeklyCareData, communityImpact,
  missionChecklists,
} from '@/lib/mock';
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

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex' }} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)} onFocus={() => setShow(true)} onBlur={() => setShow(false)}>
      {children}
      {show && (
        <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, padding: '8px 12px', backgroundColor: C.ink, color: C.paper, borderRadius: 10, fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, whiteSpace: 'nowrap', zIndex: 100, maxWidth: 200 }}>
          {text}
          <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', border: '6px solid transparent', borderTopColor: C.ink }} />
        </div>
      )}
    </div>
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
      <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, border: '2.5px solid #fff' }}>{name[0]}</div>
      {online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: '50%', backgroundColor: C.jungle, border: '2px solid #fff' }} />}
    </div>
  );
}

// Setting toggle component
function SettingToggle({ icon: Icon, label, description, checked, onChange }: { icon: any; label: string; description: string; checked: boolean; onChange: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} onClick={() => { haptic('select'); onChange(); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '14px 16px', backgroundColor: C.surface, borderRadius: 16, border: 'none', cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} color={checked ? C.jungle : C.muted} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink }}>{label}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>{description}</div>
        </div>
      </div>
      <div style={{ width: 48, height: 28, borderRadius: 14, backgroundColor: checked ? C.jungle : C.hairline2, position: 'relative', transition: 'background-color 0.2s' }}>
        <div style={{ position: 'absolute', top: 2, left: checked ? 22 : 2, width: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'left 0.2s' }} />
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
  const bg = tone === 'surface' ? C.surface : COLOR[tone as keyof typeof COLOR] || C.paper2;
  const bordered = tone === 'surface';
  return (
    <div onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} style={{ backgroundColor: bg, borderRadius: 24, padding: 16, ...(bordered ? { border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4 } : {}), ...style }}>{children}</div>
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
  const bg = variant === 'solid' ? COLOR[tone as keyof typeof COLOR] || C.paper2 : c.bg;
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
    <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: c.bg, color: c.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Fredoka, sans-serif', fontWeight: 600, fontSize: size * 0.42, border: '2.5px solid #fff', flexShrink: 0 }}>{name[0]}</div>
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
      padding: `${sz.py}px ${sz.px}px`, minHeight: 52, borderRadius: 18,
      backgroundColor: c.bg, color: c.fg, fontSize: sz.fs, fontWeight: 600,
      fontFamily: 'Fredoka, sans-serif', letterSpacing: 0.01, textTransform: 'uppercase',
      border: isGhost ? `2.5px solid ${C.hairline2}` : 'none',
      opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'pointer',
      marginBottom: isGhost ? 0 : 4, boxShadow: isGhost ? 'none' : `0 4px 0 0 ${c.shadow}`,
      width: '100%', ...style,
    }}>{leftIcon}{children}{rightIcon}</motion.button>
  );
}

function BackBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={() => { haptic('select'); onClick(); }} aria-label="Go back" style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer', display: 'flex', minHeight: 44, minWidth: 44, alignItems: 'center' }}><ArrowLeft size={22} color={C.ink2} /></button>;
}

function ScreenHeader({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, minHeight: 44 }}>
      {onBack && <BackBtn onClick={onBack} />}
      <div style={{ flex: 1 }} />
      <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink }}>{title}</span>
      <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: C.paper, borderRadius: 24, padding: 24, width: '85%', maxWidth: 380, maxHeight: '80vh', overflowY: 'auto' }}>{children}</motion.div>
    </div>
  );
}

function ConfirmationDialog({ open, title, body, confirmLabel, cancelLabel, onConfirm, onCancel, confirmVariant = 'jungle' }: { open: boolean; title: string; body: string; confirmLabel: string; cancelLabel: string; onConfirm: () => void; onCancel: () => void; confirmVariant?: string }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={onCancel}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} style={{ backgroundColor: C.paper, borderRadius: 24, padding: 24, width: '85%', maxWidth: 380 }}>
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
      <div style={{ backgroundColor: C.jungle, borderRadius: 16, padding: '14px 20px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)', overflow: 'hidden', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle size={22} color="#fff" />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: '#fff' }}>{message}</div>
            {sub && <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{sub}</div>}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.2)' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '0 0 16px 16px', transition: 'width 0.016s linear' }} />
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
    { id: 'profile', label: 'You', icon: User },
  ];
  return (
    <div style={{ position: 'fixed', left: 14, right: 14, bottom: 22, height: 76, backgroundColor: C.surface, borderRadius: 28, border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', alignItems: 'center', padding: '0 4px', zIndex: 50, maxWidth: 500, margin: '0 auto' }}>
      {tabs.map((t) => (
        <motion.button key={t.id} whileTap={{ scale: 0.9 }} onClick={() => { haptic('select'); onChange(t.id); }} aria-label={t.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: active === t.id ? C.jungleDeep : C.muted, minHeight: 44 }}>
          <t.icon size={24} fill={active === t.id ? C.jungleDeep : 'none'} color={active === t.id ? C.jungleDeep : C.muted} />
          <span style={{ fontSize: 10, fontWeight: 800, fontFamily: 'Nunito', textTransform: 'uppercase', letterSpacing: 0.06 }}>{t.label}</span>
        </motion.button>
      ))}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => { haptic('heavy'); onChange('action'); }} aria-label="Quick actions" style={{ width: 64, height: 64, borderRadius: 22, backgroundColor: C.coral, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: -28, boxShadow: `0 4px 0 0 ${C.coralDeep}`, cursor: 'pointer', border: '3px solid #fff' }}>
          <Plus size={30} color="#fff" />
        </motion.button>
      </div>
    </div>
  );
}

function StatStrip({ points, streak, hearts }: { points: number; streak: number; hearts: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16, padding: '12px 16px', backgroundColor: C.surface, borderRadius: 18, border: `2px solid ${C.hairline}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Flame size={22} color={C.coral} fill={C.coral} /><span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 20, color: C.coralDeep }}>{streak}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={22} color={C.gold} fill={C.gold} /><span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 20, color: C.goldDeep }}>{points}</span></div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={22} color={C.coral} fill={C.coral} /><span style={{ fontFamily: 'Fredoka', fontWeight: 700, fontSize: 20, color: C.coralDeep }}>{hearts}</span></div>
    </div>
  );
}

function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center', gap: 24, backgroundColor: C.jungle }}>
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
        style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16, color: 'rgba(255,255,255,0.85)', maxWidth: 260, lineHeight: 1.5 }}
      >
        Spot a stray. Do one small thing. Make their day better.
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 2.2 }}
        style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <PawPrint size={16} color="rgba(255,255,255,0.5)" />
        <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.1 }}>Care starts here</span>
      </motion.div>
    </div>
  );
}

function OnboardingIntroScreen() {
  const { onboardingPhase, advanceOnboarding, skipOnboarding } = useApp();

  const slides = [
    {
      icon: PawPrint,
      title: 'Your neighborhood needs you',
      subtitle: 'Every day, stray animals need food, water, and care. You can help — in just 2 minutes.',
      features: [
        { icon: PawPrint, label: 'Feed a stray', desc: 'Leave safe food where animals gather', color: 'jungle' as const },
        { icon: Droplets, label: 'Leave water', desc: 'A small bowl saves lives in summer heat', color: 'sky' as const },
        { icon: AlertTriangle, label: 'Report danger', desc: 'Alert rescuers about injured animals', color: 'coral' as const },
        { icon: Heart, label: 'Track your impact', desc: 'See how your care adds up over time', color: 'gold' as const },
      ],
    },
    {
      icon: Users,
      title: 'You are not alone',
      subtitle: 'Thousands of everyday heroes across India are already making a difference.',
      features: [
        { icon: Heart, label: '12,400+ animals saved', desc: 'By regular people like you', color: 'coral' as const },
        { icon: MapPin, label: '340+ neighborhoods', desc: 'Active care zones across India', color: 'sky' as const },
        { icon: Users, label: '8,200+ helpers', desc: 'Feeding, watering, and reporting daily', color: 'jungle' as const },
        { icon: Trophy, label: 'Compete for good', desc: 'Leaderboards that celebrate kindness', color: 'gold' as const },
      ],
    },
  ];

  const slide = slides[onboardingPhase] || slides[0];
  const isLast = onboardingPhase === slides.length - 1;
  const Icon = slide.icon;

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}>
        <motion.button whileTap={{ scale: 0.95 }} onClick={skipOnboarding} style={{ padding: '8px 14px', borderRadius: 12, border: 'none', backgroundColor: C.paper2, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.ink2, cursor: 'pointer' }}>Skip</motion.button>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 16px', textAlign: 'center', gap: 16, overflowY: 'auto' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: C.jungleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={36} color={C.jungle} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, color: C.ink, lineHeight: 1.2 }}>{slide.title}</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, marginTop: 6 }}>{slide.subtitle}</div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
          {slide.features.map((f, i) => (
            <motion.div key={f.label} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', backgroundColor: C.surface, borderRadius: 14, border: `2px solid ${C.hairline}` }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: C[f.color + 'Soft' as keyof typeof C] || C.jungleSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <f.icon size={20} color={C[f.color as keyof typeof C] || C.jungle} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{f.label}</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 12, color: C.ink2 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div style={{ padding: '16px 24px 28px', borderTop: `1px solid ${C.hairline}`, backgroundColor: C.paper }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
          {slides.map((_, i) => (
            <div key={i} style={{ width: i === onboardingPhase ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i === onboardingPhase ? C.jungle : C.paper2, transition: 'all 0.3s ease' }} />
          ))}
        </div>
        <Btn variant="jungle" size="lg" onClick={advanceOnboarding}>{isLast ? 'Get Started' : 'Continue'}</Btn>
      </div>
    </div>
  );
}

function SimpleOnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const { neighborhood, setNeighborhood } = useApp();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(neighborhood);
  const [detecting, setDetecting] = useState(false);

  const neighborhoods = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City', 'Jayanagar', 'BTM Layout', 'Marathahalli', 'MG Road', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur', 'Other'];
  const filtered = search ? neighborhoods.filter((n) => n.toLowerCase().includes(search.toLowerCase())) : neighborhoods;

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
    setNeighborhood(selected || 'Indiranagar');
    onComplete();
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 24px', textAlign: 'center', gap: 16 }}>
        <MascotView scene="onboarding_mission" size="lg" showBubble={false} />
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 26, color: C.ink, lineHeight: 1.2 }}>Where do you care?</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 280, lineHeight: 1.5 }}>Pick your area so we can show nearby animals and missions.</div>
      </div>

      <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 80 }}>
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
        <div style={{ maxHeight: 180, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {filtered.map((n) => (
            <motion.button key={n} whileTap={{ scale: 0.98 }} onClick={() => setSelected(n)} style={{
              padding: '12px 16px', borderRadius: 14, textAlign: 'left',
              backgroundColor: selected === n ? C.jungleSoft : 'transparent',
              border: `2px solid ${selected === n ? C.jungle : 'transparent'}`,
              fontFamily: 'Nunito', fontWeight: 700, fontSize: 15, color: selected === n ? C.jungleDeep : C.ink,
              cursor: 'pointer', width: '100%',
            }}>{n}</motion.button>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px 28px', backgroundColor: C.paper, borderTop: `1px solid ${C.hairline}`, maxWidth: 480, margin: '0 auto' }}>
        <Btn variant="jungle" size="lg" onClick={handleContinue}>Get Started</Btn>
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

  const nodeBg = isCompleted ? C.jungle : isInProgress ? C.gold : isLocked ? C.paper2 : COLOR[mission.tone as keyof typeof COLOR] || C.jungle;
  const nodeFg = isCompleted ? '#fff' : isInProgress ? C.goldInk : isLocked ? C.muted : '#fff';
  const opacity = isLocked ? 0.5 : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity }}>
      <motion.div
        whileTap={!isLocked ? { scale: 0.95 } : {}}
        onClick={!isLocked ? () => { haptic(isCompleted ? 'success' : 'medium'); onPress(); } : undefined}
        style={{
          width: 72, height: 72, borderRadius: 36, backgroundColor: nodeBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: isLocked ? 'default' : 'pointer',
          border: `3px solid ${isCompleted ? C.jungleDeep : isLocked ? C.hairline : nodeFg}`,
          boxShadow: isCompleted ? `0 4px 0 0 ${C.jungleDeep}` : isInProgress ? `0 4px 0 0 ${C.goldDeep}` : isLocked ? 'none' : `0 4px 0 0 ${C[toneShadow(mission.tone)]}`,
          marginBottom: 8,
        }}
      >
        {isCompleted ? <CheckCircle2 size={32} color="#fff" /> : isLocked ? <Lock size={28} color={C.muted} /> : <MI size={32} color={nodeFg} />}
      </motion.div>
      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: isLocked ? C.muted : C.ink, textAlign: 'center', maxWidth: 120 }}>{mission.title}</div>
      {!isLast && (
        <div style={{ width: 3, height: 32, backgroundColor: isCompleted ? C.jungle : isLocked ? C.hairline : C.paper3, borderRadius: 2, margin: '4px 0' }} />
      )}
    </div>
  );
}

function toneShadow(tone: string): keyof typeof COLOR {
  const map: Record<string, keyof typeof COLOR> = { jungle: 'jungleDeep', sky: 'skyDeep', plum: 'plumDeep', coral: 'coralDeep', gold: 'goldDeep' };
  return map[tone] || 'jungleDeep';
}

function NeighborhoodEngagementStrip() {
  const activeNow = 12;
  const todayMissions = 34;
  const weekGrowth = 23;

  return (
    <Card tone="paper" style={{ marginBottom: 16, padding: 14 }}>
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
  const { likedStories, bookmarkedStories, toggleLikeStory, toggleBookmarkStory, buddyMode, checkAndResetDaily, allTasksDoneToday } = useApp();

  useEffect(() => { checkAndResetDaily(); }, [checkAndResetDaily]);

  const firstAvailable = missions.find((m) => missionStatus[m.id as keyof MissionStatus] === 'available');
  const mascotScene: MascotScene = missionsCompleted === 0 && !firstAvailable ? 'home_empty' : firstAvailable ? 'mission_available' : 'home_empty';
  const completedCount = missions.filter((m) => missionStatus[m.id as keyof MissionStatus] === 'completed').length;
  const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;
  const allDone = completedCount === missions.length && missions.length > 0;

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <StatStrip points={points} streak={streak} hearts={hearts} />
      {missionsCompleted > 0 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: C.surface, borderRadius: 16, border: `2px solid ${C.hairline}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>Mission Progress</span>
            <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.jungleDeep }}>{completedCount}/{missions.length}</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, backgroundColor: C.paper2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, backgroundColor: C.jungle, borderRadius: 4, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}
      <NeighborhoodEngagementStrip />
      <MascotView scene={mascotScene} compact={false} />
      {buddyMode && (
        <div style={{ marginBottom: 16, padding: '12px 16px', backgroundColor: C.surface, borderRadius: 16, border: `2px solid ${C.hairline}` }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink, marginBottom: 8 }}>Nearby Helpers</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <BuddyAvatar name="Aisha" online tone="jungle" />
            <BuddyAvatar name="Rohan" online tone="sky" />
            <BuddyAvatar name="Meera" online={false} tone="coral" />
          </div>
        </div>
      )}
      <Card tone="jungle" style={{ marginBottom: 20, padding: 18 }} onClick={() => {}}>
        <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 4 }}>Indiranagar Care Zone</div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: '#fff' }}>
          {missionsCompleted === 0 ? 'No care actions yet. Start your first mission.' : `${animalsHelped} animal${animalsHelped !== 1 ? 's' : ''} helped near you.`}
        </div>
      </Card>
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
        <>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 16 }}>Today's Care Path</div>
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
        </>
      )}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Badges</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {mockBadges.slice(0, 4).map((b) => {
            const earned = earnedBadges.includes(b.id);
            return (
              <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, backgroundColor: earned ? COLOR[b.tone as keyof typeof COLOR] + '22' : C.paper2, borderRadius: 16, opacity: earned ? 1 : 0.4 }}>
                <b.icon size={22} color={earned ? COLOR[b.tone as keyof typeof COLOR] : C.muted} />
                <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 10, color: C.ink, textAlign: 'center' }}>{b.title}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink }}>Care Stories Near You</div>
          <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.jungleDeep }}>{careStories.length} stories</span>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {careStories.slice(0, 3).map((s) => {
            const isLiked = likedStories.includes(s.id);
            const isBookmarked = bookmarkedStories.includes(s.id);
            return (
              <div key={s.id} style={{ minWidth: 260, scrollSnapAlign: 'start' }}>
                <Card tone="surface" style={{ padding: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Pill tone={s.badgeTone} variant="soft">{s.badge}</Pill>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic("select"); toggleLikeStory(s.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Heart size={16} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic("select"); toggleBookmarkStory(s.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <Bookmark size={16} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
                      </motion.button>
                    </div>
                  </div>
                  <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: C.ink, marginBottom: 6, lineHeight: 1.3 }}>{s.title}</div>
                  <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2, lineHeight: 1.5 }}>{s.body}</div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
      <Card tone="paper" style={{ marginTop: 20, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Shield size={20} color={C.jungle} />
        <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2 }}>Always keep a safe distance from stray animals. Never force interaction.</div>
      </Card>
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
          <div style={{ backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
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
  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title={mission.title} onBack={onBack} />
      <MascotView scene="mission_detail" compact />
      <Card tone={mission.tone} style={{ marginBottom: 20, padding: 24, marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MI size={32} color="#fff" />
          </div>
          <div>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#fff', marginBottom: 4 }}>{mission.title}</div>
            <Pill tone="paper" variant="soft">{mission.urgency}</Pill>
          </div>
        </div>
      </Card>
      {mission.lat && mission.lng && (
        <MissionMap lat={mission.lat} lng={mission.lng} location={mission.location} distance={mission.distance} />
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {[
          { icon: MapPin, label: mission.location },
          { icon: Clock, label: `${mission.time} min` },
          { icon: Zap, label: `+${mission.rewardPoints} pts` },
          { icon: Shield, label: 'Verified by AI' },
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', backgroundColor: C.surface, borderRadius: 14, border: `2px solid ${C.hairline}` }}>
            <item.icon size={20} color={C.ink2} />
            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 15, color: C.ink }}>{item.label}</span>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>About this mission</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, lineHeight: 1.7 }}>{mission.description}</div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Safety Tips</div>
        <Card tone="paper" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
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

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Active Mission" onBack={onBack} />
      <MascotView scene="mission_active" compact />
      <div style={{ marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 4 }}>{mission.title}</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2 }}>{mission.description}</div>
      </div>
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
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 200,
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
          backgroundColor: COLOR[badge.tone as keyof typeof COLOR],
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          boxShadow: `0 20px 60px rgba(0,0,0,0.4)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 0.6, delay: 0.5, ease: 'easeInOut' }}
          style={{
            width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)',
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
          style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}
        >
          {badge.title}
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', maxWidth: 160, lineHeight: 1.5 }}
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
            backgroundColor: 'rgba(255,255,255,0.25)', color: '#fff',
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

  return (
    <div style={{ padding: '0 16px 100px', position: 'relative' }}>
      <Confetti />
      <ScreenHeader title="Mission Complete!" onBack={onHome} />
      <MascotView scene="mission_success" size="lg" showBubble={false} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '16px 0' }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 28, color: C.ink, textAlign: 'center' }}>First care mission completed</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 16, color: C.ink2, textAlign: 'center', maxWidth: 280, lineHeight: 1.6 }}>You helped one animal today.</div>
        <div style={{ display: 'flex', gap: 12, width: '100%', maxWidth: 300 }}>
          <Card tone="gold" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: C.goldInk }}>+{mission.rewardPoints}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.goldDeep }}>Care Points</div>
          </Card>
          <Card tone="coral" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff' }}>+1</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Kindness Heart</div>
          </Card>
          <Card tone="jungle" style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff' }}>+1</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>Day Streak</div>
          </Card>
        </div>
        {!badgeDismissed && newlyEarnedBadge && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card tone={newlyEarnedBadge === 'b1' ? 'gold' : 'sky'} style={{ width: '100%', maxWidth: 300, textAlign: 'center', padding: 20, cursor: 'pointer' }} onClick={() => setShowBadgeAnimation(true)}>
              <Award size={32} color={newlyEarnedBadge === 'b1' ? C.goldInk : C.sky} style={{ marginBottom: 8 }} />
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: newlyEarnedBadge === 'b1' ? C.goldInk : C.sky, marginBottom: 4 }}>
                {newlyEarnedBadge === 'b1' ? 'First Feeder' : 'Water Bearer'}
              </div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: newlyEarnedBadge === 'b1' ? C.goldDeep : C.skyDeep }}>Tap to view badge animation</div>
            </Card>
          </motion.div>
        )}
        <Card tone="jungle" style={{ width: '100%', maxWidth: 300, textAlign: 'center', padding: 16 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: '#fff', marginBottom: 4 }}>
            {mission.id === 'm1' ? 'Refill Water' : mission.id === 'm2' ? 'Report Animal' : 'Next Mission'} unlocked
          </div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>Your next care mission is now available.</div>
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 300 }}>
          <Btn variant="jungle" size="lg" onClick={onHome}>Continue to Home</Btn>
          <Btn variant="ghost" size="md" onClick={onViewImpact}>View Impact</Btn>
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

  if (selectedStory) {
    const isLiked = likedStories.includes(selectedStory.id);
    const isBookmarked = bookmarkedStories.includes(selectedStory.id);
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Story" onBack={() => setSelectedStory(null)} />
        {selectedStory.imageUrl && (
          <div style={{ borderRadius: 20, overflow: 'hidden', marginBottom: 16, position: 'relative' }}>
            <img src={selectedStory.imageUrl} alt={selectedStory.title} style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
            {selectedStory.mediaType === 'video' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={C.jungle}><polygon points="5,3 19,12 5,21" /></svg>
                </div>
              </div>
            )}
          </div>
        )}
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
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 8, lineHeight: 1.3 }}>{selectedStory.title}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>{selectedStory.date}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color={C.muted} /><span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.muted }}>{selectedStory.location}</span></div>
        </div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, lineHeight: 1.7, marginBottom: 20 }}>{selectedStory.fullBody}</div>
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: '14px 16px', backgroundColor: C.surface, borderRadius: 16, border: `2px solid ${C.hairline}` }}>
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>Reported by</div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{selectedStory.reporter}</div></div>
          <div style={{ flex: 1 }}><div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 4 }}>Responded by</div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink }}>{selectedStory.respondent}</div></div>
        </div>
        {selectedStory.helpers.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Helpers involved</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {selectedStory.helpers.map((h) => (
                <div key={h} style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: C.sky, color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Fredoka', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>{h}</div>
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
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[{ key: 'zone' as const, label: 'Neighbourhood' }, { key: 'city' as const, label: 'City' }, { key: 'state' as const, label: 'National' }].map((f) => (
            <motion.button key={f.key} whileTap={{ scale: 0.95 }} onClick={() => setFilter(f.key)} style={{ flex: 1, padding: '10px 8px', borderRadius: 12, border: 'none', backgroundColor: filter === f.key ? C.jungle : C.surface, color: filter === f.key ? '#fff' : C.ink2, fontFamily: 'Nunito', fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.06, cursor: 'pointer' }}>{f.label}</motion.button>
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
            <Card tone="jungle" style={{ marginBottom: 20, padding: 18 }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 800, fontSize: 11, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 0.08, marginBottom: 12 }}>{data.name}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#fff' }}>{typeof data.helpers === 'number' ? data.helpers.toLocaleString() : data.helpers}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Helpers</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#fff' }}>{typeof data.animalsHelped === 'number' ? data.animalsHelped.toLocaleString() : data.animalsHelped}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Animals</div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: '#fff' }}>{typeof data.missionsCompleted === 'number' ? data.missionsCompleted.toLocaleString() : data.missionsCompleted}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>Missions</div></div>
              </div>
            </Card>

            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Care Feed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              {careStories.map((s) => {
                const isLiked = likedStories.includes(s.id);
                const isBookmarked = bookmarkedStories.includes(s.id);
                return (
                  <motion.div key={s.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedStory(s)} style={{ cursor: 'pointer' }}>
                    <Card tone="surface" style={{ padding: 0, overflow: 'hidden' }}>
                      {s.imageUrl && <img src={s.imageUrl} alt={s.title} style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />}
                      <div style={{ padding: 14 }}>
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

        <Card tone="paper" style={{ marginTop: 8, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
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
  const [regStep, setRegStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [consents, setConsents] = useState({ c1: false, c2: false, c3: false });
  const [localName, setLocalName] = useState(name);
  const [localPhone, setLocalPhone] = useState(phone);
  const [localGender, setLocalGender] = useState(gender);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [locations, setLocations] = useState<string[]>(neighborhood ? [neighborhood] : []);
  const [locationSearch, setLocationSearch] = useState('');
  const allConsented = consents.c1 && consents.c2 && consents.c3;
  const canRegister = allConsented && localName.trim().length > 0 && otpVerified;
  const phoneValid = /^(\+91[\s]?)?[6-9]\d{9}$/.test(localPhone.replace(/\s/g, ''));

  const handleSendOtp = () => { if (phoneValid) setOtp(''); setRegStep('otp'); };
  const handleVerifyOtp = () => { if (otp.length === 4) { setOtpVerified(true); setRegStep('details'); } };
  const handleAddLocation = (loc: string) => { if (loc && !locations.includes(loc)) setLocations([...locations, loc]); setLocationSearch(''); };
  const handleRemoveLocation = (loc: string) => setLocations(locations.filter((l) => l !== loc));

  const handleJoin = () => {
    setName(localName);
    setPhone(localPhone);
    setGender(localGender);
    onJoin();
    setShowRegister(false);
  };

  const neighborhoods = ['Indiranagar', 'Koramangala', 'HSR Layout', 'Whitefield', 'Electronic City', 'Jayanagar', 'BTM Layout', 'Marathahalli', 'MG Road', 'Jubilee Hills', 'Banjara Hills', 'Gachibowli', 'Madhapur'];
  const filteredLocations = locationSearch ? neighborhoods.filter((n) => n.toLowerCase().includes(locationSearch.toLowerCase()) && !locations.includes(n)) : [];

  if (!showRegister && profile.leaderboardOptIn) {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Ranks" />
        <MascotView scene="leaderboard_success" compact />
        <Card tone="jungle" style={{ marginBottom: 16, marginTop: 12, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar name={profile.name} size={44} tone={profile.avatarTone} />
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: '#fff' }}>{profile.name}</div>
              <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Rank #{users.length + 1} · {profile.points} pts</div>
            </div>
          </div>
        </Card>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapPin size={16} color={C.coral} />
          {profile.neighborhood || 'Indiranagar'} Care Zone
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
          <Card tone="surface" style={{ textAlign: 'center', padding: 12 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.jungleDeep }}>{users.length + 1}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Your Rank</div>
          </Card>
          <Card tone="surface" style={{ textAlign: 'center', padding: 12 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.skyDeep }}>{users.length}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Zone Helpers</div>
          </Card>
          <Card tone="surface" style={{ textAlign: 'center', padding: 12 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.goldDeep }}>{users.reduce((sum, u) => sum + u.points, 0) + profile.points}</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 11, color: C.muted }}>Zone Points</div>
          </Card>
        </div>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 14, color: C.ink, marginBottom: 8 }}>Top Helpers</div>
        {users.map((u) => (
          <Card tone="surface" key={u.id} style={{ marginBottom: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.muted, width: 28, textAlign: 'center' }}>
                {u.rank <= 3 ? ['🥇', '🥈', '🥉'][u.rank - 1] : u.rank}
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

  if (regStep === 'phone') {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Join Ranks" />
        <MascotView scene="leaderboard_registration" compact />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 8 }}>Verify your phone</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, marginBottom: 20, lineHeight: 1.6 }}>We'll send a 4-digit OTP to verify your number.</div>
          <div>
            <label style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6, display: 'block' }}>Phone number *</label>
            <input value={localPhone} onChange={(e) => setLocalPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" type="tel" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: `2px solid ${phoneValid || !localPhone ? C.hairline : C.coral}`, fontFamily: 'Fredoka', fontSize: 18, color: C.ink, backgroundColor: C.surface, outline: 'none' }} />
            {localPhone && !phoneValid && <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 12, color: C.coral, marginTop: 6 }}>Enter a valid 10-digit Indian number</div>}
          </div>
          <div style={{ marginTop: 24 }}>
            <Btn variant="sky" size="lg" onClick={handleSendOtp} disabled={!phoneValid}>Send OTP</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (regStep === 'otp') {
    return (
      <div style={{ padding: '0 16px 100px' }}>
        <ScreenHeader title="Join Ranks" onBack={() => setRegStep('phone')} />
        <MascotView scene="leaderboard_registration" compact />
        <div style={{ marginTop: 16 }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 8 }}>Enter OTP</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, marginBottom: 20, lineHeight: 1.6 }}>We sent a code to {localPhone}</div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
            {[0, 1, 2, 3].map((i) => (
              <input key={i} value={otp[i] || ''} onChange={(e) => { const val = e.target.value.replace(/\D/g, ''); if (val) { const newOtp = otp.split(''); newOtp[i] = val; setOtp(newOtp.join('')); if (i < 3) { const next = (e.target as HTMLElement).nextElementSibling as HTMLInputElement; if (next) next.focus(); } } }} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) { const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement; if (prev) prev.focus(); } }} maxLength={1} style={{ width: 56, height: 64, textAlign: 'center', borderRadius: 16, border: `2px solid ${C.hairline}`, fontFamily: 'Fredoka', fontSize: 28, color: C.ink, backgroundColor: C.surface, outline: 'none' }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Btn variant="sky" size="lg" onClick={handleVerifyOtp} disabled={otp.length !== 4}>Verify OTP</Btn>
            <Btn variant="ghost" size="md" onClick={() => { setOtp(''); setRegStep('phone'); }}>Change number</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0 16px 100px' }}>
      <ScreenHeader title="Join Ranks" onBack={() => setRegStep('otp')} />
      <MascotView scene="leaderboard_registration" compact />
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div>
            <label style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6, display: 'block' }}>Display name *</label>
            <input value={localName} onChange={(e) => setLocalName(e.target.value)} placeholder="Your name" style={{ width: '100%', padding: '14px 16px', borderRadius: 16, border: `2px solid ${C.hairline}`, fontFamily: 'Fredoka', fontSize: 18, color: C.ink, backgroundColor: C.surface, outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 6, display: 'block' }}>Gender</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Male', 'Female', 'Non-binary', 'Prefer not to say'].map((g) => (
                <motion.button key={g} whileTap={{ scale: 0.95 }} onClick={() => setLocalGender(g)} style={{ padding: '8px 14px', borderRadius: 12, border: `2px solid ${localGender === g ? C.sky : C.hairline}`, backgroundColor: localGender === g ? C.skySoft : C.surface, fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: localGender === g ? C.skyDeep : C.ink, cursor: 'pointer' }}>{g}</motion.button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 12, color: C.muted, textTransform: 'uppercase', letterSpacing: 0.06, marginBottom: 8 }}>Care zones</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
            {locations.map((loc) => (
              <div key={loc} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, backgroundColor: C.jungleSoft, border: `1.5px solid ${C.jungle}` }}>
                <MapPin size={14} color={C.jungle} />
                <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 13, color: C.jungleDeep }}>{loc}</span>
                <button onClick={() => handleRemoveLocation(loc)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}><X size={14} color={C.jungleDeep} /></button>
              </div>
            ))}
          </div>
          <div style={{ position: 'relative' }}>
            <input value={locationSearch} onChange={(e) => setLocationSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && locationSearch.trim()) handleAddLocation(locationSearch.trim()); }} placeholder="Add another area..." style={{ width: '100%', padding: '12px 16px 12px 40px', borderRadius: 14, border: `2px solid ${C.hairline}`, fontFamily: 'Nunito', fontSize: 15, color: C.ink, backgroundColor: C.surface, outline: 'none' }} />
            <MapPin size={18} color={C.muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          </div>
          {filteredLocations.length > 0 && (
            <div style={{ maxHeight: 120, overflowY: 'auto', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {filteredLocations.map((n) => (
                <motion.button key={n} whileTap={{ scale: 0.98 }} onClick={() => handleAddLocation(n)} style={{ padding: '10px 14px', borderRadius: 12, textAlign: 'left', backgroundColor: 'transparent', border: 'none', fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: C.ink, cursor: 'pointer' }}>{n}</motion.button>
              ))}
            </div>
          )}
        </div>

        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink, marginBottom: 12 }}>Consent</div>
        {[
          { key: 'c1', label: 'I agree to show my first name, care zone, points, rank, and badges.' },
          { key: 'c2', label: 'I understand exact proof locations and private reports are not public.' },
          { key: 'c3', label: 'I can turn this off later from Profile.' },
        ].map((c) => (
          <motion.div key={c.key} whileTap={{ scale: 0.98 }} onClick={() => setConsents((prev) => ({ ...prev, [c.key]: !prev[c.key as keyof typeof prev] }))} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', cursor: 'pointer', borderBottom: `1px solid ${C.hairline}` }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, marginTop: 2, backgroundColor: consents[c.key as keyof typeof consents] ? C.jungle : C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center', border: consents[c.key as keyof typeof consents] ? 'none' : `2px solid ${C.hairline2}` }}>
              {consents[c.key as keyof typeof consents] && <Check size={16} color="#fff" />}
            </div>
            <span style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: C.ink, lineHeight: 1.5 }}>{c.label}</span>
          </motion.div>
        ))}
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Btn variant="sky" size="lg" onClick={handleJoin} disabled={!canRegister}>Join Ranks</Btn>
          <Btn variant="ghost" size="md" onClick={() => setShowRegister(false)}>Cancel</Btn>
        </div>
      </div>
    </div>
  );
}

function ProfileScreen({ profile, badges, onReset }: { profile: any; badges: any[]; onReset: () => void }) {
  const { darkMode, toggleDarkMode, hapticEnabled, toggleHapticEnabled, buddyMode, toggleBuddyMode, pushNotifications, togglePushNotifications, streakFreeze, toggleStreakFreeze, locationHistory } = useApp();
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
        <EmptyState icon={MapPin} title="Your journey starts here" subtitle="Complete your first mission to see your progress, badges, and impact grow." actionLabel="Start Mission" onAction={() => {}} />
      ) : (
        <>
          <Card tone="jungle" style={{ marginBottom: 20, marginTop: 12, padding: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff' }}>{profile.missionsCompleted}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Missions</div></div>
              <div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff' }}>{profile.points}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Points</div></div>
              <div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff' }}>{profile.streak}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Streak</div></div>
              <div><div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: '#fff' }}>{profile.badgesEarned}</div><div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>Badges</div></div>
            </div>
          </Card>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>My Badges</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {badges.map((b) => {
                const earned = profile.earnedBadgeIds?.includes(b.id);
                return (
                  <div key={b.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: 12, backgroundColor: earned ? COLOR[b.tone as keyof typeof COLOR] + '22' : C.paper2, borderRadius: 16, opacity: earned ? 1 : 0.4 }}>
                    <b.icon size={22} color={earned ? COLOR[b.tone as keyof typeof COLOR] : C.muted} />
                    <div style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 11, color: C.ink, textAlign: 'center' }}>{b.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Settings</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <SettingToggle icon={Moon} label="Dark Mode" description="Switch to dark theme" checked={darkMode} onChange={toggleDarkMode} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', zIndex: 150 }} onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: C.paper, borderRadius: '24px 24px 0 0', padding: '24px 16px 40px' }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: C.hairline2, margin: '0 auto 20px' }} />
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 20, color: C.ink, marginBottom: 20 }}>Quick Actions</div>
        {actions.map((a) => (
          <motion.button key={a.label} whileTap={{ scale: 0.98 }} onClick={() => { onAction(a.action); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', padding: '14px 12px', background: 'none', border: 'none', cursor: 'pointer', borderRadius: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: COLOR[a.tone] + '22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a.icon size={24} color={COLOR[a.tone]} />
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
        <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 8 }}>Share Straytopia</div>
        <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 280, margin: '0 auto 24px', lineHeight: 1.6 }}>Invite friends to join your care circle and help more animals together.</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 300, margin: '0 auto' }}>
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
                padding: '16px 8px', borderRadius: 16, border: 'none', cursor: 'pointer',
                backgroundColor: C.paper2,
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
  const [pressing, setPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [alerted, setAlerted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startPress = () => {
    setPressing(true);
    setProgress(0);
    const startTime = Date.now();
    animRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(elapsed / 3000, 1);
      setProgress(p);
      if (p >= 1) {
        if (animRef.current) clearInterval(animRef.current);
        setAlerted(true);
        setPressing(false);
      }
    }, 16);
    timerRef.current = setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 8 }}>Authorities Alerted</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 280, lineHeight: 1.6 }}>Emergency services and nearby rescue coordinators have been notified. Help is on the way.</div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Card tone="coral" style={{ maxWidth: 300, padding: 16, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 14, color: '#fff', lineHeight: 1.6 }}>Your location has been shared with the nearest animal rescue team. Stay safe and keep distance from the animal.</div>
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
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.coralDeep, marginBottom: 8 }}>Emergency Alert</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2, maxWidth: 280, lineHeight: 1.6 }}>Press and hold for 3 seconds to alert nearby authorities and rescue teams.</div>
        </div>

        <motion.button
          onMouseDown={startPress}
          onMouseUp={endPress}
          onMouseLeave={endPress}
          onTouchStart={startPress}
          onTouchEnd={endPress}
          style={{
            width: 160, height: 160, borderRadius: 80, position: 'relative',
            backgroundColor: pressing ? C.coral : C.coralSoft,
            border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: pressing ? `0 0 40px ${C.coral}60` : 'none',
            transition: 'background-color 0.2s, box-shadow 0.2s',
          }}
        >
          <svg width="160" height="160" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle cx="80" cy="80" r="74" fill="none" stroke={C.hairline} strokeWidth="6" />
            <circle
              cx="80" cy="80" r="74" fill="none" stroke={C.coralDeep} strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 74}`}
              strokeDashoffset={`${2 * Math.PI * 74 * (1 - progress)}`}
              style={{ transition: progress === 0 ? 'none' : 'stroke-dashoffset 0.05s linear' }}
            />
          </svg>
          <Siren size={48} color={pressing ? '#fff' : C.coralDeep} />
          {pressing && (
            <div style={{ position: 'absolute', bottom: 28, fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: '#fff' }}>
              {Math.round(progress * 100)}%
            </div>
          )}
        </motion.button>

        <Card tone="paper" style={{ maxWidth: 300, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={18} color={C.coral} />
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2 }}>This will send your location to nearby police stations and animal rescue organizations.</div>
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

          <div style={{ textAlign: 'center' }}>
            <motion.div
              key={dispatchStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 22, color: C.ink, marginBottom: 8 }}
            >
              {dispatchSteps[dispatchStep].label}
            </motion.div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 15, color: C.ink2 }}>Connecting you with rescue teams</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 280 }}>
            {dispatchSteps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: i <= dispatchStep ? 1 : 0.3, x: 0 }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, backgroundColor: i <= dispatchStep ? s.color + '15' : 'transparent' }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: i <= dispatchStep ? s.color : C.paper2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i < dispatchStep ? <Check size={16} color="#fff" /> : <s.icon size={16} color={i <= dispatchStep ? '#fff' : C.muted} />}
                </div>
                <span style={{ fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: i <= dispatchStep ? C.ink : C.muted }}>{s.label}</span>
              </motion.div>
            ))}
          </div>
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
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 24, color: C.ink, marginBottom: 4 }}>Report Submitted</div>
          <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.muted }}>Case #{reportId}</div>
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
          <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 16 }}>Case Journey</div>
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

        <Card tone="jungle" style={{ width: '100%', maxWidth: 300, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Shield size={18} color="#fff" />
          <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>You'll get updates as the case progresses. Stay safe and keep distance from the animal.</div>
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

  const conditions = ['Injured', 'Sick', 'Trapped', 'Aggressive', 'Pregnant', 'Abandoned', 'In Danger'];
  const urgencies = [
    { key: 'low' as const, label: 'Low', desc: 'Animal is safe but needs attention', color: C.jungle },
    { key: 'medium' as const, label: 'Medium', desc: 'Animal may need help soon', color: C.gold },
    { key: 'high' as const, label: 'High', desc: 'Animal is in immediate danger', color: C.coral },
    { key: 'critical' as const, label: 'Critical', desc: 'Life-threatening situation', color: C.coralDeep },
  ];

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
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{ width: i <= step ? 28 : 8, height: 8, borderRadius: 4, backgroundColor: i <= step ? C.coral : C.paper2, transition: 'width 0.3s ease' }} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>What condition is the animal in?</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {conditions.map((c) => (
                <motion.button key={c} whileTap={{ scale: 0.95 }} onClick={() => setCondition(c)} style={{
                  padding: '10px 16px', borderRadius: 14, border: `2px solid ${condition === c ? C.coral : C.hairline}`,
                  backgroundColor: condition === c ? C.coralSoft : C.surface,
                  fontFamily: 'Nunito', fontWeight: 700, fontSize: 14, color: condition === c ? C.coralDeep : C.ink,
                  cursor: 'pointer',
                }}>{c}</motion.button>
              ))}
            </div>
            <Btn variant="coral" size="lg" onClick={() => condition && setStep(1)} disabled={!condition}>Next</Btn>
          </>
        )}

        {step === 1 && (
          <>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>How urgent is this?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {urgencies.map((u) => (
                <motion.div key={u.key} whileTap={{ scale: 0.98 }} onClick={() => setUrgency(u.key)} style={{
                  padding: '14px 16px', borderRadius: 16, border: `2px solid ${urgency === u.key ? u.color : C.hairline}`,
                  backgroundColor: urgency === u.key ? u.color + '15' : C.surface, cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: urgency === u.key ? u.color : C.paper2, border: urgency === u.key ? 'none' : `2px solid ${C.hairline2}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {urgency === u.key && <Check size={14} color="#fff" />}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 15, color: u.color }}>{u.label}</div>
                      <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.ink2 }}>{u.desc}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <Btn variant="coral" size="lg" onClick={() => setStep(2)}>Next</Btn>
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Add a photo (optional)</div>
            <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 14, color: C.ink2, marginBottom: 16 }}>A photo helps rescue teams identify the animal and assess the situation faster.</div>
            {photo ? (
              <div style={{ marginBottom: 20 }}>
                <div style={{ width: '100%', height: 200, borderRadius: 20, backgroundColor: C.paper2, overflow: 'hidden', position: 'relative', border: `2px solid ${C.hairline}` }}>
                  <img src={photo} alt="Animal" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPhoto(null)}
                    style={{ position: 'absolute', top: 12, right: 12, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
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
                  width: '100%', height: 180, borderRadius: 20, border: `2px dashed ${C.hairline2}`,
                  backgroundColor: C.surface, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', gap: 12, cursor: 'pointer', marginBottom: 20,
                }}
              >
                <Camera size={32} color={C.muted} />
                <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 16, color: C.ink2 }}>Tap to take a photo</div>
                <div style={{ fontFamily: 'Nunito', fontWeight: 500, fontSize: 13, color: C.muted }}>or choose from gallery</div>
              </motion.button>
            )}
            <Btn variant="coral" size="lg" onClick={() => setStep(3)}>Next</Btn>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontFamily: 'Fredoka', fontWeight: 600, fontSize: 18, color: C.ink, marginBottom: 12 }}>Add notes (optional)</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the location, animal appearance, or any other details..."
              style={{
                width: '100%', minHeight: 120, padding: 14, borderRadius: 16, border: `2px solid ${C.hairline}`,
                fontFamily: 'Nunito', fontSize: 15, color: C.ink, backgroundColor: C.surface,
                resize: 'none', outline: 'none', marginBottom: 16,
              }}
            />
            <Card tone="paper" style={{ marginBottom: 20, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={18} color={C.coral} />
              <div style={{ fontFamily: 'Nunito', fontWeight: 600, fontSize: 13, color: C.ink2 }}>Do not approach aggressive or injured animals. Report and let trained helpers respond.</div>
            </Card>
            <Btn variant="coral" size="lg" onClick={() => { setSubmitting(true); setTimeout(() => { setSubmitting(false); setStep(4); }, 1500); }} disabled={submitting}>
              {submitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Report'}
            </Btn>
          </>
        )}
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
    newlyEarnedBadge, onboardingPhase, darkMode, skipOnboarding, setSkeletonLoading,
  } = useApp();
  C = getTheme(darkMode);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null);
  const [showLockedModal, setShowLockedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

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
      <div style={{ minHeight: '100dvh', backgroundColor: C.jungle, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.ink }}>
        <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <SplashScreen onComplete={completeSplash} />
        </div>
      </div>
    );
  }

  if (!hasSeenOnboarding) {
    if (onboardingPhase < 2) {
      return (
        <div style={{ minHeight: '100dvh', backgroundColor: C.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.ink }}>
          <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
            <OnboardingIntroScreen />
          </div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100dvh', backgroundColor: C.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.ink }}>
        <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
          <SimpleOnboardingScreen onComplete={completeOnboarding} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100dvh', backgroundColor: C.paper, position: 'relative', overflow: 'hidden', fontFamily: 'Nunito, sans-serif', color: C.ink }}>
      <div style={{ maxWidth: 480, margin: '0 auto', height: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <AnimatePresence mode="wait">
        <motion.div key={screen} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ flex: 1, overflowY: 'auto', paddingBottom: 100 }}>
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
            <ProfileScreen profile={profile} badges={mockBadges} onReset={handleReset} />
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
