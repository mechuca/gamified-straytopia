import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatarLetter: string;
  avatarTone: string;
  points: number;
  badgeCount: number;
  missionCount: number;
  isMe: boolean;
  rankChange: 'up' | 'down' | 'same' | 'new';
}

export type LeaderboardScope = 'today' | 'week' | 'month' | 'all' | 'nearby';

export interface LeaderboardState {
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
  setScope: (scope: LeaderboardScope) => void;
  reset: () => void;
}

const seedEntries: LeaderboardEntry[] = [
  { rank: 1, name: 'Anjali K.', avatarLetter: 'A', avatarTone: 'coral', points: 2450, badgeCount: 8, missionCount: 47, isMe: false, rankChange: 'same' },
  { rank: 2, name: 'Rohit M.', avatarLetter: 'R', avatarTone: 'sky', points: 1890, badgeCount: 6, missionCount: 35, isMe: false, rankChange: 'up' },
  { rank: 3, name: 'Priya N.', avatarLetter: 'P', avatarTone: 'jungle', points: 1620, badgeCount: 5, missionCount: 28, isMe: true, rankChange: 'up' },
  { rank: 4, name: 'Sameer D.', avatarLetter: 'S', avatarTone: 'plum', points: 1340, badgeCount: 4, missionCount: 22, isMe: false, rankChange: 'down' },
  { rank: 5, name: 'Meera S.', avatarLetter: 'M', avatarTone: 'gold', points: 1120, badgeCount: 3, missionCount: 19, isMe: false, rankChange: 'same' },
  { rank: 6, name: 'Arjun P.', avatarLetter: 'A', avatarTone: 'coral', points: 980, badgeCount: 3, missionCount: 16, isMe: false, rankChange: 'new' },
  { rank: 7, name: 'Kavitha R.', avatarLetter: 'K', avatarTone: 'sky', points: 870, badgeCount: 2, missionCount: 14, isMe: false, rankChange: 'up' },
  { rank: 8, name: 'Vikram J.', avatarLetter: 'V', avatarTone: 'plum', points: 720, badgeCount: 2, missionCount: 11, isMe: false, rankChange: 'down' },
  { rank: 9, name: 'Deepa L.', avatarLetter: 'D', avatarTone: 'gold', points: 610, badgeCount: 1, missionCount: 9, isMe: false, rankChange: 'same' },
  { rank: 10, name: 'Rahul T.', avatarLetter: 'R', avatarTone: 'jungle', points: 490, badgeCount: 1, missionCount: 7, isMe: false, rankChange: 'new' },
];

export const useLeaderboard = create<LeaderboardState>()(
  persist(
    (set) => ({
      scope: 'week',
      entries: seedEntries,
      setScope: (scope) => set({ scope }),
      reset: () => set({ scope: 'week', entries: seedEntries }),
    }),
    { name: 'straytopia-leaderboard', storage }
  )
);
