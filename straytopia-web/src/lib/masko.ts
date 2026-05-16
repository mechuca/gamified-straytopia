export const MASKO_COLLECTION_SLUG = 'buddy-1d5rfgcx';
export const MASKO_CDN_BASE = 'https://assets.masko.ai';

export interface BuddyPose {
  name: string;
  url: string;
  alt: string;
}

export const BUDDY_POSES: Record<string, BuddyPose> = {
  idle: {
    name: 'idle',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/idle-f4118034.png`,
    alt: 'Buddy sitting calmly',
  },
  wave: {
    name: 'wave',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/wave-086c507f.png`,
    alt: 'Buddy waving hello',
  },
  celebrate: {
    name: 'celebrate',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/celebrate-26a411d8.png`,
    alt: 'Buddy celebrating excitedly',
  },
  sad: {
    name: 'sad',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/sad-1d06416f.png`,
    alt: 'Buddy looking sad',
  },
  alert: {
    name: 'alert',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/alert-d69d5640.png`,
    alt: 'Buddy alert and excited',
  },
  thinking: {
    name: 'thinking',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/thinking-685068cf.png`,
    alt: 'Buddy thinking curiously',
  },
  rescue: {
    name: 'rescue',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/rescue-06c350bf.png`,
    alt: 'Buddy hugging a heart',
  },
  loading: {
    name: 'loading',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/loading-a2f33b31.png`,
    alt: 'Buddy sniffing curiously',
  },
  empty: {
    name: 'empty',
    url: `${MASKO_CDN_BASE}/1c59eb4f/${MASKO_COLLECTION_SLUG}/empty-64e48274.png`,
    alt: 'Buddy holding a sign',
  },
};

export const SCENE_TO_POSE: Record<string, string> = {
  onboarding_welcome: 'wave',
  onboarding_mission: 'alert',
  onboarding_impact: 'celebrate',
  onboarding_privacy: 'idle',
  home_empty: 'idle',
  mission_available: 'alert',
  mission_locked: 'thinking',
  mission_detail: 'idle',
  mission_active: 'idle',
  proof_required: 'alert',
  mission_success: 'celebrate',
  badge_earned: 'celebrate',
  second_mission_unlocked: 'celebrate',
  impact_empty: 'empty',
  impact_updated: 'celebrate',
  leaderboard_intro: 'idle',
  leaderboard_registration: 'idle',
  leaderboard_privacy: 'idle',
  leaderboard_success: 'celebrate',
  profile_beginner: 'idle',
  profile_progress: 'celebrate',
  loading: 'loading',
  error: 'sad',
};
