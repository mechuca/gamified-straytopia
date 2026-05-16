import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

export interface PointsState {
  total: number;
  history: Array<{ amount: number; reason: string; date: number }>;
  award: (amount: number, reason: string) => void;
  reset: () => void;
}

export const usePoints = create<PointsState>()(
  persist(
    (set) => ({
      total: 0,
      history: [],
      award: (amount, reason) => set((state) => ({
        total: state.total + amount,
        history: [...state.history, { amount, reason, date: Date.now() }],
      })),
      reset: () => set({ total: 0, history: [] }),
    }),
    { name: 'straytopia-points', storage }
  )
);
