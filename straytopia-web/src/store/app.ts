import { create } from 'zustand';
import { missionChecklists } from '@/lib/mock';
import { THEME_STORAGE_KEY, resolveSystemTheme, type ThemeMode } from '@/lib/theme';

export type Screen =
  | 'splash'
  | 'onboarding' | 'onboarding-2' | 'onboarding-3' | 'onboarding-4'
  | 'home' | 'mission-detail' | 'task' | 'proof' | 'verify' | 'success'
  | 'report' | 'report-submitted' | 'badges' | 'badge-detail'
  | 'profile' | 'profile-edit' | 'profile-zone-selector'
  | 'stories' | 'league' | 'lb-register' | 'lb-consent' | 'lb-confirm' | 'lb-success'
  | 'lb-user-detail' | 'lb-privacy'
  | 'settings' | 'action-report' | 'action-sos' | 'action-invite'
  | 'care-zone-detail' | 'animal-detail' | 'metric-detail' | 'event-detail' | 'proof-detail'
  | 'locked-modal' | 'badge-earned'
  | 'onboarding-intro' | 'onboarding-location';

export interface MissionStatus {
  m1: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m2: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m3: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m4: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m5: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m6: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
}

export type RescueUrgency = 'low' | 'medium' | 'high' | 'critical';

export interface RescueCase {
  id: string;
  createdAt: number;
  condition: string;
  urgency: RescueUrgency;
  notes: string;
  photoAttached: boolean;
  // Demo-only: we don't have a backend, so keep a simple stage.
  stage: 'reported' | 'dispatched' | 'rescued' | 'treated' | 'healed' | 'rehabilitated';
}

interface AppState {
  screen: Screen;
  hasSeenSplash: boolean;
  hasSeenOnboarding: boolean;
  onboardingStep: number;
  name: string;
  phone: string;
  gender: string;
  neighborhood: string;
  avatarIndex: number;
  avatarTone: string;
  leaderboardOptedIn: boolean;
  leaderboardPhoneVerified: boolean;
  lbConsentChecked: boolean;
  lbDisplayName: string;
  points: number;
  streak: number;
  hearts: number;
  missionsCompleted: number;
  animalsHelped: number;
  activeMission: string | null;
  lastCompletedMission: string | null;
  missionStatus: MissionStatus;
  proofPhoto: string | null;
  proofNote: string;
  checklistDone: boolean;
  checklistItems: Record<string, boolean>;
  notifications: Record<string, boolean>;
  earnedBadges: string[];
  newlyEarnedBadge: string | null;
  missionHistory: string[];
  impactEvents: string[];
  proofs: string[];
  savedAnimalNames: string[];
  likedStories: string[];
  bookmarkedStories: string[];
  streakFreeze: boolean;
  locationHistory: string[];
  pushNotifications: boolean;
  buddyMode: boolean;
  hapticEnabled: boolean;
  skeletonLoading: boolean;
  lastResetDate: string;
  allTasksDoneToday: boolean;
  hasSeenHomeTour: boolean;
  rescueCases: RescueCase[];
  navigate: (s: Screen) => void;
  setName: (n: string) => void;
  setPhone: (p: string) => void;
  setGender: (g: string) => void;
  setNeighborhood: (n: string) => void;
  setAvatarIndex: (i: number) => void;
  setAvatarTone: (t: string) => void;
  setOnboardingStep: (n: number) => void;
  setActiveMission: (id: string | null) => void;
  completeSplash: () => void;
  completeOnboarding: () => void;
  skipOnboarding: () => void;
  startMission: (id: string) => void;
  toggleChecklistItem: (item: string) => void;
  completeChecklist: () => void;
  submitProof: (note: string) => void;
  completeMission: (id: string) => void;
  setLeaderboardOptedIn: (v: boolean) => void;
  setLeaderboardPhoneVerified: (v: boolean) => void;
  setLbConsentChecked: (v: boolean) => void;
  setLbDisplayName: (n: string) => void;
  setProofPhoto: (p: string | null) => void;
  setNotification: (key: string, value: boolean) => void;
  darkMode: boolean;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  initializeTheme: () => void;
  syncSystemTheme: () => void;
  toggleDarkMode: () => void;
  toggleLikeStory: (id: string) => void;
  toggleBookmarkStory: (id: string) => void;
  toggleStreakFreeze: () => void;
  addLocationToHistory: (loc: string) => void;
  togglePushNotifications: () => void;
  toggleBuddyMode: () => void;
  toggleHapticEnabled: () => void;
  setSkeletonLoading: (v: boolean) => void;
  completeHomeTour: () => void;
  addRescueCase: (c: RescueCase) => void;
  updateRescueCase: (id: string, patch: Partial<RescueCase>) => void;
  resetDemo: () => void;
  checkAndResetDaily: () => void;
  logAnalytics: (event: string, data?: Record<string, unknown>) => void;
  onboardingPhase: number;
  advanceOnboarding: () => void;
}

const defaultMissionStatus: MissionStatus = {
  m1: 'available', m2: 'locked', m3: 'locked', m4: 'locked', m5: 'locked', m6: 'locked',
};

const defaultChecklistItems: Record<string, boolean> = {
  'safe_spot': false,
  'offered_food': false,
  'kept_distance': false,
  'ready_proof': false,
};

export const useApp = create<AppState>((set, get) => ({
  screen: 'splash',
  hasSeenSplash: false,
  hasSeenOnboarding: false,
  onboardingStep: 0,
  name: '',
  phone: '',
  gender: '',
  neighborhood: '',
  avatarIndex: 0,
  avatarTone: 'jungle',
  leaderboardOptedIn: false,
  leaderboardPhoneVerified: false,
  lbConsentChecked: false,
  lbDisplayName: '',
  points: 0,
  streak: 0,
  hearts: 0,
  missionsCompleted: 0,
  animalsHelped: 0,
  activeMission: null,
  lastCompletedMission: null,
  missionStatus: { ...defaultMissionStatus },
  proofPhoto: null,
  proofNote: '',
  checklistDone: false,
  checklistItems: { ...defaultChecklistItems },
  notifications: { mission_reminders: true, urgent_alerts: true, badge_updates: true, leaderboard_updates: false },
  darkMode: false,
  themeMode: 'system',
  earnedBadges: [],
  newlyEarnedBadge: null,
  missionHistory: [],
  impactEvents: [],
  proofs: [],
  savedAnimalNames: [],
  likedStories: [],
  bookmarkedStories: [],
  streakFreeze: false,
  locationHistory: [],
  pushNotifications: true,
  buddyMode: false,
  hapticEnabled: true,
  skeletonLoading: false,
  lastResetDate: new Date().toDateString(),
  allTasksDoneToday: false,
  hasSeenHomeTour: false,
  rescueCases: [],
  onboardingPhase: 0,
  advanceOnboarding: () => {
    const current = get().onboardingPhase;
    if (current === 0) set({ onboardingPhase: 1 });
    else if (current === 1) set({ onboardingPhase: 2 });
    else set({ hasSeenOnboarding: true, screen: 'home' });
  },
  checkAndResetDaily: () => {
    const today = new Date().toDateString();
    const lastReset = get().lastResetDate;
    if (lastReset !== today) {
      set({
        missionStatus: { ...defaultMissionStatus },
        checklistItems: { ...defaultChecklistItems },
        checklistDone: false,
        activeMission: null,
        lastResetDate: today,
        allTasksDoneToday: false,
      });
    }
  },
  skipOnboarding: () => set({ hasSeenOnboarding: true, screen: 'home' }),
  navigate: (s) => set({ screen: s }),
  setName: (n) => set({ name: n }),
  setPhone: (p) => set({ phone: p }),
  setGender: (g) => set({ gender: g }),
  setNeighborhood: (n) => set({ neighborhood: n }),
  setAvatarIndex: (i) => set({ avatarIndex: i }),
  setAvatarTone: (t) => set({ avatarTone: t }),
  setOnboardingStep: (n) => set({ onboardingStep: n }),
  setActiveMission: (id) => set({ activeMission: id }),
  completeSplash: () => set({ hasSeenSplash: true, screen: 'onboarding-intro' }),
  completeOnboarding: () => set({ hasSeenOnboarding: true, screen: 'home' }),
  startMission: (id) => {
    const missionChecklist = missionChecklists[id] || [];
    const newChecklistItems: Record<string, boolean> = {};
    missionChecklist.forEach((c) => { newChecklistItems[c.key] = false; });
    set({
      activeMission: id,
      missionStatus: { ...get().missionStatus, [id as keyof MissionStatus]: 'in_progress' },
      checklistDone: false,
      checklistItems: newChecklistItems,
      proofPhoto: null,
      proofNote: '',
    });
  },
  toggleChecklistItem: (item) => {
    const current = get().checklistItems;
    set({ checklistItems: { ...current, [item]: !current[item] } });
  },
  completeChecklist: () => {
    const items = get().checklistItems;
    const allDone = Object.values(items).every(Boolean);
    if (allDone) set({ checklistDone: true });
  },
  submitProof: (note) => set({ proofNote: note, proofPhoto: 'demo' }),
  completeMission: (id) => {
    const s = get();
    const newPoints = s.points + (id === 'm1' ? 10 : id === 'm2' ? 15 : 20);
    const newHearts = s.hearts + 1;
    const newStreak = s.streakFreeze ? s.streak : Math.max(s.streak, 1);
    const newMissions = s.missionsCompleted + 1;
    const newAnimals = s.animalsHelped + 1;
    const newStatus = { ...s.missionStatus, [id as keyof MissionStatus]: 'completed' as const };
    const newHistory = [...s.missionHistory, id];
    const newEvents = [...s.impactEvents, id];
    const newProofs = [...s.proofs, id];

    let newBadges = [...s.earnedBadges];
    let newlyEarned: string | null = null;
    if (id === 'm1' && !s.earnedBadges.includes('b1')) { newBadges.push('b1'); newlyEarned = 'b1'; }
    else if (id === 'm2' && !s.earnedBadges.includes('b2')) { newBadges.push('b2'); newlyEarned = 'b2'; }

    const newAnimalsList = [...s.savedAnimalNames, id === 'm1' ? 'Friendly dog' : id === 'm2' ? 'Thirsty cat' : 'Street animal'];

    if (id === 'm1') newStatus.m2 = 'available';
    if (id === 'm2') newStatus.m3 = 'available';
    if (id === 'm3') newStatus.m4 = 'available';
    if (id === 'm4') newStatus.m5 = 'available';
    if (id === 'm5') newStatus.m6 = 'available';

    set({
      missionStatus: newStatus, activeMission: null, lastCompletedMission: id,
      points: newPoints, hearts: newHearts, streak: newStreak,
      missionsCompleted: newMissions, animalsHelped: newAnimals,
      missionHistory: newHistory, impactEvents: newEvents, proofs: newProofs,
      earnedBadges: newBadges, newlyEarnedBadge: newlyEarned,
      savedAnimalNames: newAnimalsList, screen: 'success',
    });
  },
  setLeaderboardOptedIn: (v) => set({ leaderboardOptedIn: v }),
  setLeaderboardPhoneVerified: (v) => set({ leaderboardPhoneVerified: v }),
  setLbConsentChecked: (v) => set({ lbConsentChecked: v }),
  setLbDisplayName: (n) => set({ lbDisplayName: n }),
  setProofPhoto: (p) => set({ proofPhoto: p }),
  setNotification: (key, value) => set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
  setThemeMode: (mode) => {
    const resolved = mode === 'system' ? resolveSystemTheme() : mode === 'dark';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    }
    set({ themeMode: mode, darkMode: resolved });
  },
  initializeTheme: () => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(THEME_STORAGE_KEY) : null;
    const themeMode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
    const darkMode = themeMode === 'system' ? resolveSystemTheme() : themeMode === 'dark';
    set({ themeMode, darkMode });
  },
  syncSystemTheme: () => {
    if (get().themeMode !== 'system') return;
    set({ darkMode: resolveSystemTheme() });
  },
  toggleDarkMode: () => {
    const nextMode = get().darkMode ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    }
    set({ themeMode: nextMode, darkMode: nextMode === 'dark' });
  },
  toggleLikeStory: (id) => set((s) => ({
    likedStories: s.likedStories.includes(id) ? s.likedStories.filter((i) => i !== id) : [...s.likedStories, id],
  })),
  toggleBookmarkStory: (id) => set((s) => ({
    bookmarkedStories: s.bookmarkedStories.includes(id) ? s.bookmarkedStories.filter((i) => i !== id) : [...s.bookmarkedStories, id],
  })),
  toggleStreakFreeze: () => set((s) => ({ streakFreeze: !s.streakFreeze })),
  addLocationToHistory: (loc) => set((s) => ({
    locationHistory: s.locationHistory.includes(loc) ? s.locationHistory : [...s.locationHistory, loc],
  })),
  togglePushNotifications: () => set((s) => ({ pushNotifications: !s.pushNotifications })),
  toggleBuddyMode: () => set((s) => ({ buddyMode: !s.buddyMode })),
  toggleHapticEnabled: () => set((s) => ({ hapticEnabled: !s.hapticEnabled })),
  setSkeletonLoading: (v) => set({ skeletonLoading: v }),
  completeHomeTour: () => set({ hasSeenHomeTour: true }),
  addRescueCase: (c) => set((s) => {
    if (s.rescueCases.some((r) => r.id === c.id)) return s;
    return { rescueCases: [c, ...s.rescueCases] };
  }),
  updateRescueCase: (id, patch) => set((s) => ({
    rescueCases: s.rescueCases.map((r) => (r.id === id ? { ...r, ...patch } : r)),
  })),
  resetDemo: () => {
    const { darkMode, themeMode, pushNotifications, buddyMode, hapticEnabled, notifications, streakFreeze } = get();

    set({
      screen: 'splash', hasSeenSplash: false, hasSeenOnboarding: false, onboardingStep: 0,
      name: '', phone: '', gender: '', neighborhood: '', avatarIndex: 0, avatarTone: 'jungle',
      leaderboardOptedIn: false, lbConsentChecked: false, lbDisplayName: '',
      leaderboardPhoneVerified: false,
      points: 0, streak: 0, hearts: 0, missionsCompleted: 0, animalsHelped: 0,
      activeMission: null, lastCompletedMission: null,
      missionStatus: { ...defaultMissionStatus }, proofPhoto: null, proofNote: '',
      checklistDone: false, checklistItems: {},
      earnedBadges: [], newlyEarnedBadge: null, missionHistory: [], impactEvents: [],
      proofs: [], savedAnimalNames: [], likedStories: [], bookmarkedStories: [],
      streakFreeze, locationHistory: [], pushNotifications,
      buddyMode, hapticEnabled, skeletonLoading: false,
      notifications: { ...notifications },
      rescueCases: [],
      darkMode, themeMode, onboardingPhase: 0, lastResetDate: new Date().toDateString(), allTasksDoneToday: false, hasSeenHomeTour: false,
    });
  },
  logAnalytics: (event, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${event}`, data || '');
    }
  },
}));
