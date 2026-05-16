import { create } from 'zustand';

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
  | 'locked-modal' | 'badge-earned';

export interface MissionStatus {
  m1: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m2: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m3: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m4: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m5: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
  m6: 'locked' | 'available' | 'in_progress' | 'proof_required' | 'completed';
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
  leaderboardOptedIn: boolean;
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
  navigate: (s: Screen) => void;
  setName: (n: string) => void;
  setPhone: (p: string) => void;
  setGender: (g: string) => void;
  setNeighborhood: (n: string) => void;
  setAvatarIndex: (i: number) => void;
  setOnboardingStep: (n: number) => void;
  setActiveMission: (id: string | null) => void;
  completeSplash: () => void;
  completeOnboarding: () => void;
  startMission: (id: string) => void;
  toggleChecklistItem: (item: string) => void;
  completeChecklist: () => void;
  submitProof: (note: string) => void;
  completeMission: (id: string) => void;
  setLeaderboardOptedIn: (v: boolean) => void;
  setLbConsentChecked: (v: boolean) => void;
  setLbDisplayName: (n: string) => void;
  setProofPhoto: (p: string | null) => void;
  setNotification: (key: string, value: boolean) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  resetDemo: () => void;
  logAnalytics: (event: string, data?: Record<string, unknown>) => void;
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
  leaderboardOptedIn: false,
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
  darkMode: true,
  earnedBadges: [],
  newlyEarnedBadge: null,
  missionHistory: [],
  impactEvents: [],
  proofs: [],
  savedAnimalNames: [],
  navigate: (s) => set({ screen: s }),
  setName: (n) => set({ name: n }),
  setPhone: (p) => set({ phone: p }),
  setGender: (g) => set({ gender: g }),
  setNeighborhood: (n) => set({ neighborhood: n }),
  setAvatarIndex: (i) => set({ avatarIndex: i }),
  setOnboardingStep: (n) => set({ onboardingStep: n }),
  setActiveMission: (id) => set({ activeMission: id }),
  completeSplash: () => set({ hasSeenSplash: true, screen: 'onboarding' }),
  completeOnboarding: () => set({ hasSeenOnboarding: true, screen: 'home' }),
  startMission: (id) => set({
    activeMission: id,
    missionStatus: { ...get().missionStatus, [id as keyof MissionStatus]: 'in_progress' },
    checklistDone: false,
    checklistItems: { ...defaultChecklistItems },
    proofPhoto: null,
    proofNote: '',
  }),
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
    const newStreak = Math.max(s.streak, 1);
    const newMissions = s.missionsCompleted + 1;
    const newAnimals = s.animalsHelped + 1;
    const newStatus = { ...s.missionStatus, [id as keyof MissionStatus]: 'completed' as const };
    const newHistory = [...s.missionHistory, id];
    const newEvents = [...s.impactEvents, id];
    const newProofs = [...s.proofs, id];

    let newBadges = [...s.earnedBadges];
    let newlyEarned: string | null = null;
    if (id === 'm1' && !s.earnedBadges.includes('b1')) {
      newBadges.push('b1');
      newlyEarned = 'b1';
    } else if (id === 'm2' && !s.earnedBadges.includes('b2')) {
      newBadges.push('b2');
      newlyEarned = 'b2';
    }

    const newAnimalsList = [...s.savedAnimalNames, id === 'm1' ? 'Friendly dog' : id === 'm2' ? 'Thirsty cat' : 'Street animal'];

    if (id === 'm1') newStatus.m2 = 'available';
    if (id === 'm2') newStatus.m3 = 'available';
    if (id === 'm3') newStatus.m4 = 'available';
    if (id === 'm4') newStatus.m5 = 'available';
    if (id === 'm5') newStatus.m6 = 'available';

    set({
      missionStatus: newStatus,
      activeMission: null,
      lastCompletedMission: id,
      points: newPoints,
      hearts: newHearts,
      streak: newStreak,
      missionsCompleted: newMissions,
      animalsHelped: newAnimals,
      missionHistory: newHistory,
      impactEvents: newEvents,
      proofs: newProofs,
      earnedBadges: newBadges,
      newlyEarnedBadge: newlyEarned,
      savedAnimalNames: newAnimalsList,
      screen: 'success',
    });
  },
  setLeaderboardOptedIn: (v) => set({ leaderboardOptedIn: v }),
  setLbConsentChecked: (v) => set({ lbConsentChecked: v }),
  setLbDisplayName: (n) => set({ lbDisplayName: n }),
  setProofPhoto: (p) => set({ proofPhoto: p }),
  setNotification: (key, value) => set((s) => ({ notifications: { ...s.notifications, [key]: value } })),
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
  resetDemo: () => set({
    screen: 'splash', hasSeenSplash: false, hasSeenOnboarding: false, onboardingStep: 0,
    name: '', phone: '', gender: '', neighborhood: '', avatarIndex: 0,
    leaderboardOptedIn: false,
    lbConsentChecked: false, lbDisplayName: '', points: 0, streak: 0, hearts: 0,
    missionsCompleted: 0, animalsHelped: 0, activeMission: null,
    lastCompletedMission: null,
    missionStatus: { ...defaultMissionStatus }, proofPhoto: null, proofNote: '',
    checklistDone: false, checklistItems: { ...defaultChecklistItems },
    earnedBadges: [], newlyEarnedBadge: null, missionHistory: [], impactEvents: [],
    proofs: [], savedAnimalNames: [],
    notifications: { mission_reminders: true, urgent_alerts: true, badge_updates: true, leaderboard_updates: false },
    darkMode: true,
  }),
  logAnalytics: (event, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${event}`, data || '');
    }
  },
}));
