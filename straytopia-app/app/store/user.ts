import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = createJSONStorage(() => AsyncStorage);

export interface UserState {
  id: string | null;
  name: string | null;
  phone: string | null;
  phoneVerified: boolean;
  age: number | null;
  gender: string | null;
  avatarLetter: string;
  avatarTone: string;
  profileImageUri: string | null;
  neighborhood: { id: string; name: string; sub: string } | null;
  leaderboardOptedIn: boolean;
  privacyMode: 'name' | 'name-avatar' | 'avatar-initials' | 'private' | null;
  joinedAt: number | null;
  firstMissionAccepted: boolean;
  leaderboardChoiceMade: boolean;
  setNeighborhood: (n: UserState['neighborhood']) => void;
  setName: (name: string) => void;
  setPhone: (phone: string) => void;
  setPhoneVerified: (v: boolean) => void;
  setAge: (age: number | null) => void;
  setGender: (gender: string | null) => void;
  setAvatar: (letter: string, tone: string) => void;
  setProfileImage: (uri: string | null) => void;
  setLeaderboardOptedIn: (v: boolean) => void;
  setPrivacyMode: (mode: UserState['privacyMode']) => void;
  setJoinedAt: (t: number) => void;
  setFirstMissionAccepted: () => void;
  setLeaderboardChoiceMade: () => void;
  reset: () => void;
}

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      name: null,
      phone: null,
      phoneVerified: false,
      age: null,
      gender: null,
      avatarLetter: 'P',
      avatarTone: 'sky',
      profileImageUri: null,
      neighborhood: null,
      leaderboardOptedIn: false,
      privacyMode: null,
      joinedAt: null,
      firstMissionAccepted: false,
      leaderboardChoiceMade: false,
      setNeighborhood: (n) => set({ neighborhood: n }),
      setName: (name) => set({ name }),
      setPhone: (phone) => set({ phone }),
      setPhoneVerified: (v) => set({ phoneVerified: v }),
      setAge: (age) => set({ age }),
      setGender: (gender) => set({ gender }),
      setAvatar: (letter, tone) => set({ avatarLetter: letter, avatarTone: tone }),
      setProfileImage: (uri) => set({ profileImageUri: uri }),
      setLeaderboardOptedIn: (v) => set({ leaderboardOptedIn: v }),
      setPrivacyMode: (mode) => set({ privacyMode: mode }),
      setJoinedAt: (t) => set({ joinedAt: t }),
      setFirstMissionAccepted: () => set({ firstMissionAccepted: true }),
      setLeaderboardChoiceMade: () => set({ leaderboardChoiceMade: true }),
      reset: () => set({
        id: null, name: null, phone: null, phoneVerified: false,
        age: null, gender: null, avatarLetter: 'P', avatarTone: 'sky',
        profileImageUri: null, neighborhood: null, leaderboardOptedIn: false,
        privacyMode: null, joinedAt: null, firstMissionAccepted: false,
        leaderboardChoiceMade: false,
      }),
    }),
    { name: 'straytopia-user', storage }
  )
);
