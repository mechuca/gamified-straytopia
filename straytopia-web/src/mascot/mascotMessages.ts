import { MascotSceneConfig } from './mascotTypes';

export const MASCOT_MESSAGES: Record<string, MascotSceneConfig> = {
  onboarding_welcome: {
    scene: 'onboarding_welcome',
    mood: 'happy',
    message: "Welcome to Straytopia. I'll help you begin your care journey.",
    trigger: 'wave',
  },
  onboarding_mission: {
    scene: 'onboarding_mission',
    mood: 'encouraging',
    message: 'Start small. One safe care action can help one animal today.',
    trigger: 'point',
  },
  onboarding_impact: {
    scene: 'onboarding_impact',
    mood: 'proud',
    message: 'Every completed mission becomes visible impact.',
    trigger: 'celebrate',
  },
  onboarding_privacy: {
    scene: 'onboarding_privacy',
    mood: 'serious',
    message: 'You control your proof, location, and leaderboard participation.',
    trigger: 'none',
  },
  home_empty: {
    scene: 'home_empty',
    mood: 'calm',
    message: 'Your first care mission is ready.',
    trigger: 'point',
  },
  mission_available: {
    scene: 'mission_available',
    mood: 'happy',
    message: 'Start with one simple mission.',
    trigger: 'point',
  },
  mission_locked: {
    scene: 'mission_locked',
    mood: 'thinking',
    message: 'Complete the previous mission to unlock this one.',
    trigger: 'blink',
  },
  mission_detail: {
    scene: 'mission_detail',
    mood: 'serious',
    message: 'Read the safety steps before you begin.',
    trigger: 'focus',
  },
  mission_active: {
    scene: 'mission_active',
    mood: 'encouraging',
    message: 'Take your time. Keep distance and care safely.',
    trigger: 'focus',
  },
  proof_required: {
    scene: 'proof_required',
    mood: 'encouraging',
    message: 'Add a photo or note so your care action can be verified.',
    trigger: 'point',
  },
  mission_success: {
    scene: 'mission_success',
    mood: 'celebrating',
    message: 'You helped one animal today.',
    trigger: 'celebrate',
  },
  badge_earned: {
    scene: 'badge_earned',
    mood: 'proud',
    message: 'You earned your first care badge.',
    trigger: 'unlock',
  },
  second_mission_unlocked: {
    scene: 'second_mission_unlocked',
    mood: 'happy',
    message: 'Your next care mission is now unlocked.',
    trigger: 'unlock',
  },
  impact_empty: {
    scene: 'impact_empty',
    mood: 'calm',
    message: 'Your impact will appear after your first completed mission.',
    trigger: 'none',
  },
  impact_updated: {
    scene: 'impact_updated',
    mood: 'proud',
    message: 'Your care action is now part of your impact.',
    trigger: 'celebrate',
  },
  leaderboard_intro: {
    scene: 'leaderboard_intro',
    mood: 'calm',
    message: 'Leaderboard is optional. Join only when you are ready.',
    trigger: 'none',
  },
  leaderboard_registration: {
    scene: 'leaderboard_registration',
    mood: 'serious',
    message: 'Choose what safe public details can be shown.',
    trigger: 'none',
  },
  leaderboard_privacy: {
    scene: 'leaderboard_privacy',
    mood: 'serious',
    message: 'Exact proof locations and private reports stay protected.',
    trigger: 'none',
  },
  leaderboard_success: {
    scene: 'leaderboard_success',
    mood: 'celebrating',
    message: 'Your care progress can now inspire others.',
    trigger: 'celebrate',
  },
  profile_beginner: {
    scene: 'profile_beginner',
    mood: 'calm',
    message: 'This is your care profile. Your progress starts here.',
    trigger: 'none',
  },
  profile_progress: {
    scene: 'profile_progress',
    mood: 'proud',
    message: 'Your badges, missions, and impact grow as you help.',
    trigger: 'celebrate',
  },
  loading: {
    scene: 'loading',
    mood: 'calm',
    message: 'Finding your care path...',
    trigger: 'blink',
  },
  error: {
    scene: 'error',
    mood: 'concerned',
    message: "Something didn't load. Let's try again.",
    trigger: 'blink',
  },
};

export function getMascotMessage(scene: MascotSceneConfig['scene']): MascotSceneConfig {
  return MASCOT_MESSAGES[scene] || MASCOT_MESSAGES.home_empty;
}
