import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
  progress: number;
  maxProgress: number;
  earned: boolean;
  earnedAt: number | null;
  newlyUnlocked: boolean;
}

export interface BadgeState {
  badges: Badge[];
  unlockBadge: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  reset: () => void;
}

const seedBadges: Badge[] = [
  { id: 'b1', name: 'First Mission', description: 'Complete your first mission', icon: '🎯', color: 'jungle', criteria: 'Complete 1 mission', progress: 0, maxProgress: 1, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b2', name: 'First Feeding', description: 'Feed a street animal', icon: '🍖', color: 'jungle', criteria: 'Complete 1 feeding mission', progress: 0, maxProgress: 1, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b3', name: 'Water Guardian', description: 'Refill 5 water bowls', icon: '💧', color: 'sky', criteria: 'Complete 5 water missions', progress: 0, maxProgress: 5, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b4', name: 'Night Responder', description: 'Complete a mission after dark', icon: '🌙', color: 'plum', criteria: 'Complete 1 mission after 8 PM', progress: 0, maxProgress: 1, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b5', name: 'Rescue Ally', description: 'Help with 3 rescues', icon: '🚑', color: 'coral', criteria: 'Complete 3 rescue missions', progress: 0, maxProgress: 3, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b6', name: 'Medical Helper', description: 'Assist with medical checkups', icon: '🏥', color: 'plum', criteria: 'Complete 2 medical missions', progress: 0, maxProgress: 2, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b7', name: 'Community Reporter', description: 'File 5 reports', icon: '📋', color: 'sky', criteria: 'Submit 5 reports', progress: 0, maxProgress: 5, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b8', name: '3-Day Streak', description: 'Help animals 3 days in a row', icon: '🔥', color: 'gold', criteria: 'Maintain a 3-day streak', progress: 0, maxProgress: 3, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b9', name: '7-Day Streak', description: 'Help animals 7 days in a row', icon: '⚡', color: 'gold', criteria: 'Maintain a 7-day streak', progress: 0, maxProgress: 7, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b10', name: 'Area Champion', description: 'Complete 20 missions in your area', icon: '🏆', color: 'gold', criteria: 'Complete 20 missions', progress: 0, maxProgress: 20, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b11', name: 'Verified Helper', description: 'Get 10 verified proofs', icon: '✅', color: 'jungle', criteria: '10 verified submissions', progress: 0, maxProgress: 10, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b12', name: '10 Animals Helped', description: 'Help 10 different animals', icon: '🐾', color: 'coral', criteria: 'Help 10 animals', progress: 0, maxProgress: 10, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b13', name: 'Emergency Responder', description: 'Respond to a critical mission', icon: '🚨', color: 'coral', criteria: 'Complete 1 critical mission', progress: 0, maxProgress: 1, earned: false, earnedAt: null, newlyUnlocked: false },
  { id: 'b14', name: 'Adoption Supporter', description: 'Support an adoption', icon: '🏠', color: 'plum', criteria: 'Complete 1 adoption mission', progress: 0, maxProgress: 1, earned: false, earnedAt: null, newlyUnlocked: false },
];

export const useBadges = create<BadgeState>()(
  persist(
    (set) => ({
      badges: seedBadges,
      unlockBadge: (id) => set((state) => ({
        badges: state.badges.map((b) =>
          b.id === id ? { ...b, earned: true, earnedAt: Date.now(), newlyUnlocked: true, progress: b.maxProgress } : b
        ),
      })),
      updateProgress: (id, progress) => set((state) => ({
        badges: state.badges.map((b) =>
          b.id === id && !b.earned ? { ...b, progress: Math.min(progress, b.maxProgress) } : b
        ),
      })),
      reset: () => set({ badges: seedBadges }),
    }),
    { name: 'straytopia-badges', storage }
  )
);
