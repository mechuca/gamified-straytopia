import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

export interface AppState {
  onboardingComplete: boolean;
  showToast: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'info';
  completeOnboarding: () => void;
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
  resetAll: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      onboardingComplete: false,
      showToast: false,
      toastMessage: '',
      toastType: 'info',
      completeOnboarding: () => set({ onboardingComplete: true }),
      show: (message, type = 'info') => set({ showToast: true, toastMessage: message, toastType: type }),
      hideToast: () => set({ showToast: false, toastMessage: '', toastType: 'info' }),
      resetAll: () => set({
        onboardingComplete: false, showToast: false,
        toastMessage: '', toastType: 'info',
      }),
    }),
    { name: 'straytopia-app', storage }
  )
);
