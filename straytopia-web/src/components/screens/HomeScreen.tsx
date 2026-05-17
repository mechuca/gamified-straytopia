'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, CheckCircle2, Shield, Heart, Bookmark } from 'lucide-react';
import { useApp, Screen, MissionStatus } from '@/store/app';
import { COLOR, ThemeColors } from '@/lib/theme';
import { haptic } from '@/lib/haptics';
import { missions as mockMissions, badges as mockBadges, careStories, Mission } from '@/lib/mock';
import { MascotView, MascotScene } from '@/mascot';
import { StatStrip } from './StatStrip';
import { NeighborhoodEngagementStrip } from './NeighborhoodEngagementStrip';
import { MissionPathNode } from './MissionPathNode';
import { Card, Pill, BuddyAvatar, Tooltip } from '@/components/ui';

const C: ThemeColors = COLOR;

interface HomeScreenProps {
  setScreen: (s: Screen) => void;
  missions: typeof mockMissions;
  missionStatus: MissionStatus;
  points: number;
  streak: number;
  hearts: number;
  missionsCompleted: number;
  animalsHelped: number;
  earnedBadges: string[];
  onSelectMission: (id: string) => void;
  onLockedMission: () => void;
}

export function HomeScreen({
  setScreen, missions, missionStatus, points, streak, hearts,
  missionsCompleted, animalsHelped, earnedBadges, onSelectMission, onLockedMission,
}: HomeScreenProps) {
  const { likedStories, bookmarkedStories, toggleLikeStory, toggleBookmarkStory, buddyMode, checkAndResetDaily, allTasksDoneToday } = useApp();

  useEffect(() => { checkAndResetDaily(); }, [checkAndResetDaily]);

  const firstAvailable = missions.find((m) => missionStatus[m.id as keyof MissionStatus] === 'available');
  const mascotScene: MascotScene = missionsCompleted === 0 && !firstAvailable ? 'home_empty' : firstAvailable ? 'mission_available' : 'home_empty';
  const completedCount = missions.filter((m) => missionStatus[m.id as keyof MissionStatus] === 'completed').length;
  const progress = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;
  const allDone = completedCount === missions.length && missions.length > 0;

  return (
    <div className="px-4 pb-[100px]">
      <StatStrip points={points} streak={streak} hearts={hearts} />

      {missionsCompleted > 0 && (
        <div className="mb-4 p-3 rounded-2xl" style={{ backgroundColor: C.surface, border: `2px solid ${C.hairline}` }}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-['Fredoka'] font-semibold text-sm" style={{ color: C.ink }}>Mission Progress</span>
            <span className="font-['Nunito'] font-bold text-[13px]" style={{ color: C.jungleDeep }}>{completedCount}/{missions.length}</span>
          </div>
          <div className="h-2 rounded-sm overflow-hidden" style={{ backgroundColor: C.paper2 }}>
            <div className="h-full rounded-sm" style={{ width: `${progress}%`, backgroundColor: C.jungle, transition: 'width 0.5s ease' }} />
          </div>
        </div>
      )}

      <NeighborhoodEngagementStrip />
      <MascotView scene={mascotScene} compact={false} />

      {buddyMode && (
        <div className="mb-4 p-3 rounded-2xl" style={{ backgroundColor: C.surface, border: `2px solid ${C.hairline}` }}>
          <div className="font-['Fredoka'] font-semibold text-sm mb-2" style={{ color: C.ink }}>Nearby Helpers</div>
          <div className="flex gap-2">
            <BuddyAvatar name="Aisha" online tone="jungle" />
            <BuddyAvatar name="Rohan" online tone="sky" />
            <BuddyAvatar name="Meera" online={false} tone="coral" />
          </div>
        </div>
      )}

      <div className="mb-5 p-[18px] rounded-[24px] cursor-pointer" style={{ backgroundColor: C.jungle }} onClick={() => {}}>
        <div className="font-['Nunito'] font-extrabold text-xs text-white/70 uppercase tracking-[0.08] mb-1">Indiranagar Care Zone</div>
        <div className="font-['Fredoka'] font-semibold text-base text-white">
          {missionsCompleted === 0 ? 'No care actions yet. Start your first mission.' : `${animalsHelped} animal${animalsHelped !== 1 ? 's' : ''} helped near you.`}
        </div>
      </div>

      {allDone ? (
        <div className="text-center px-4 py-6 mb-4">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15 }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: C.jungleSoft }}>
              <CheckCircle2 size={40} color={C.jungle} />
            </div>
          </motion.div>
          <div className="font-['Fredoka'] font-semibold text-[22px] mb-2" style={{ color: C.ink }}>All tasks done for today!</div>
          <div className="font-['Nunito'] font-medium text-[15px] text-[var(--ink2)] max-w-[280px] mx-auto leading-relaxed" style={{ color: C.ink2 }}>You've completed all your care missions. Come back tomorrow for new tasks and keep your streak going.</div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Flame size={20} color={C.coral} fill={C.coral} />
            <span className="font-['Fredoka'] font-semibold text-base" style={{ color: C.coralDeep }}>Streak: {streak} days</span>
          </div>
        </div>
      ) : (
        <>
          <div className="font-['Fredoka'] font-semibold text-lg mb-4" style={{ color: C.ink }}>Today's Care Path</div>
          <div className="flex flex-col items-center py-2">
            {missions.map((m, i) => (
              <Tooltip key={m.id} text={m.title}>
                <MissionPathNode
                  mission={m as Mission}
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

      <div className="mt-6">
        <div className="font-['Fredoka'] font-semibold text-lg mb-3" style={{ color: C.ink }}>Badges</div>
        <div className="grid grid-cols-4 gap-2.5">
          {mockBadges.slice(0, 4).map((b) => {
            const earned = earnedBadges.includes(b.id);
            return (
              <div key={b.id} className="flex flex-col items-center gap-1.5 p-3 rounded-2xl" style={{ backgroundColor: earned ? `${(C as any)[b.tone]}22` : C.paper2, opacity: earned ? 1 : 0.4 }}>
                <b.icon size={22} color={earned ? (C as any)[b.tone] : C.muted} />
                <div className="font-['Nunito'] font-bold text-[10px] text-center" style={{ color: C.ink }}>{b.title}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-['Fredoka'] font-semibold text-lg" style={{ color: C.ink }}>Care Stories Near You</div>
          <span className="font-['Nunito'] font-bold text-[13px]" style={{ color: C.jungleDeep }}>{careStories.length} stories</span>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
          {careStories.slice(0, 3).map((s) => {
            const isLiked = likedStories.includes(s.id);
            const isBookmarked = bookmarkedStories.includes(s.id);
            return (
              <div key={s.id} className="min-w-[260px]" style={{ scrollSnapAlign: 'start' }}>
                <div className="p-3.5 rounded-[24px]" style={{ backgroundColor: C.surface, border: `2.5px solid ${C.hairline}`, borderBottomWidth: 4 }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Pill tone={s.badgeTone} variant="soft">{s.badge}</Pill>
                    <div className="flex items-center gap-2 ml-auto">
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic('select'); toggleLikeStory(s.id); }} className="bg-none border-none cursor-pointer flex items-center">
                        <Heart size={16} color={isLiked ? C.coral : C.muted} fill={isLiked ? C.coral : 'none'} />
                      </motion.button>
                      <motion.button whileTap={{ scale: 0.8 }} onClick={() => { haptic('select'); toggleBookmarkStory(s.id); }} className="bg-none border-none cursor-pointer flex items-center">
                        <Bookmark size={16} color={isBookmarked ? C.gold : C.muted} fill={isBookmarked ? C.gold : 'none'} />
                      </motion.button>
                    </div>
                  </div>
                  <div className="font-['Fredoka'] font-semibold text-[15px] mb-1.5 leading-tight" style={{ color: C.ink }}>{s.title}</div>
                  <div className="font-['Nunito'] font-medium text-[13px] leading-relaxed" style={{ color: C.ink2 }}>{s.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 p-3.5 rounded-[24px] flex items-center gap-2.5" style={{ backgroundColor: C.paper2 }}>
        <Shield size={20} color={C.jungle} />
        <div className="font-['Nunito'] font-semibold text-[13px]" style={{ color: C.ink2 }}>Always keep a safe distance from stray animals. Never force interaction.</div>
      </div>
    </div>
  );
}
