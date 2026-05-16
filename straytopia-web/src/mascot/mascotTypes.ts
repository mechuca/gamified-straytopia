export type MascotScene =
  | 'onboarding_welcome'
  | 'onboarding_mission'
  | 'onboarding_impact'
  | 'onboarding_privacy'
  | 'home_empty'
  | 'mission_available'
  | 'mission_locked'
  | 'mission_detail'
  | 'mission_active'
  | 'proof_required'
  | 'mission_success'
  | 'badge_earned'
  | 'second_mission_unlocked'
  | 'impact_empty'
  | 'impact_updated'
  | 'leaderboard_intro'
  | 'leaderboard_registration'
  | 'leaderboard_privacy'
  | 'leaderboard_success'
  | 'profile_beginner'
  | 'profile_progress'
  | 'loading'
  | 'error';

export type MascotMood =
  | 'calm'
  | 'happy'
  | 'proud'
  | 'thinking'
  | 'concerned'
  | 'celebrating'
  | 'encouraging'
  | 'serious';

export type MascotTrigger =
  | 'wave'
  | 'point'
  | 'celebrate'
  | 'unlock'
  | 'blink'
  | 'focus'
  | 'none';

export interface MascotSceneConfig {
  scene: MascotScene;
  mood: MascotMood;
  message: string;
  sub?: string;
  actionLabel?: string;
  trigger: MascotTrigger;
}
