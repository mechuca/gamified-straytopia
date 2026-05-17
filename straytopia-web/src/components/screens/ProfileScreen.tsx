'use client';
import { useState } from 'react';
import { Moon, Smartphone, Bell, Users, Shield, RotateCcw, MapPin } from 'lucide-react';
import { useApp } from '@/store/app';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { badges as mockBadges } from '@/lib/mock';
import { MascotView } from '@/mascot';
import { ScreenHeader, Avatar, Pill, Card, EmptyState, SettingToggle, ConfirmationDialog } from '@/components/ui';

const C: ThemeColors = COLOR;

interface ProfileScreenProps {
  profile: any;
  badges: typeof mockBadges;
  onReset: () => void;
}

export function ProfileScreen({ profile, badges, onReset }: ProfileScreenProps) {
  const { darkMode, toggleDarkMode, hapticEnabled, toggleHapticEnabled, buddyMode, toggleBuddyMode, pushNotifications, togglePushNotifications, streakFreeze, toggleStreakFreeze, locationHistory } = useApp();
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="px-4 pb-[100px]">
      <ScreenHeader title="Profile" />

      <div className="flex flex-col items-center gap-3 mb-5">
        <Avatar name={profile.name} size={72} tone={profile.avatarTone} />
        <div className="font-['Fredoka'] font-semibold text-[22px]" style={{ color: C.ink }}>{profile.name}</div>
        <div className="font-['Nunito'] font-semibold text-sm" style={{ color: C.muted }}>Indiranagar Care Zone</div>
        <Pill tone="jungle">{profile.careLevel}</Pill>
      </div>

      <MascotView scene={profile.missionsCompleted === 0 ? 'profile_beginner' : 'profile_progress'} compact />

      {profile.missionsCompleted === 0 ? (
        <EmptyState icon={MapPin} title="Your journey starts here" subtitle="Complete your first mission to see your progress, badges, and impact grow." actionLabel="Start Mission" onAction={() => {}} />
      ) : (
        <>
          <div className="mb-5 mt-3 p-5 rounded-[24px]" style={{ backgroundColor: C.jungle }}>
            <div className="grid grid-cols-2 gap-4">
              <div><div className="font-['Fredoka'] font-semibold text-2xl text-white">{profile.missionsCompleted}</div><div className="font-['Nunito'] font-semibold text-[13px] text-white/70">Missions</div></div>
              <div><div className="font-['Fredoka'] font-semibold text-2xl text-white">{profile.points}</div><div className="font-['Nunito'] font-semibold text-[13px] text-white/70">Points</div></div>
              <div><div className="font-['Fredoka'] font-semibold text-2xl text-white">{profile.streak}</div><div className="font-['Nunito'] font-semibold text-[13px] text-white/70">Streak</div></div>
              <div><div className="font-['Fredoka'] font-semibold text-2xl text-white">{profile.badgesEarned}</div><div className="font-['Nunito'] font-semibold text-[13px] text-white/70">Badges</div></div>
            </div>
          </div>

          <div className="mb-5">
            <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>My Badges</div>
            <div className="grid grid-cols-3 gap-2.5">
              {badges.map((b) => {
                const earned = profile.earnedBadgeIds?.includes(b.id);
                return (
                  <div key={b.id} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl" style={{ backgroundColor: earned ? `${(C as any)[b.tone]}22` : C.paper2, opacity: earned ? 1 : 0.4 }}>
                    <b.icon size={22} color={earned ? (C as any)[b.tone] : C.muted} />
                    <div className="font-['Nunito'] font-bold text-[11px] text-center" style={{ color: C.ink }}>{b.title}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="mb-5">
        <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Settings</div>
        <div className="flex flex-col gap-2">
          <SettingToggle icon={Moon} label="Dark Mode" description="Switch to dark theme" checked={darkMode} onChange={toggleDarkMode} />
          <SettingToggle icon={Smartphone} label="Haptic Feedback" description="Vibrate on interactions" checked={hapticEnabled} onChange={toggleHapticEnabled} />
          <SettingToggle icon={Bell} label="Push Notifications" description="Get mission reminders" checked={pushNotifications} onChange={togglePushNotifications} />
          <SettingToggle icon={Users} label="Buddy Mode" description="Show nearby helpers" checked={buddyMode} onChange={toggleBuddyMode} />
          <SettingToggle icon={Shield} label="Streak Protection" description="Freeze streak for a day" checked={streakFreeze} onChange={toggleStreakFreeze} />
        </div>
      </div>

      {locationHistory.length > 0 && (
        <div className="mb-5">
          <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Location History</div>
          <div className="flex flex-wrap gap-2">
            {locationHistory.map((loc) => (
              <Pill key={loc} tone="sky">{loc}</Pill>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <button onClick={() => { haptic('medium'); setShowReset(true); }} className="w-full py-[18px] rounded-[18px] font-['Fredoka'] font-semibold text-base uppercase tracking-[0.01] text-white mb-1 flex items-center justify-center gap-2.5" style={{ backgroundColor: C.coral, boxShadow: `0 4px 0 0 ${C.coralDeep}` }}>
          <RotateCcw size={18} />
          Reset Demo Journey
        </button>
      </div>

      <ConfirmationDialog
        open={showReset}
        title="Reset Demo Journey?"
        body="This will clear all progress, missions, and badges. You'll start fresh."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        confirmVariant="coral"
        onConfirm={() => { onReset(); setShowReset(false); }}
        onCancel={() => setShowReset(false)}
      />
    </div>
  );
}
