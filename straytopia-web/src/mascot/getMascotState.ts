import { MascotScene } from './mascotTypes';

interface MascotStateInput {
  isNewUser: boolean;
  hasActiveMission: boolean;
  missionStatus: string;
  checklistProgress: number;
  badgeUnlocked: boolean;
  rescueAlert: boolean;
  leaderboardVisible: boolean;
  errorState: boolean;
  userInactive: boolean;
  missionType?: string;
  screen: string;
  missionsCompleted: number;
  leaderboardOptedIn: boolean;
}

export function getMascotState(input: MascotStateInput): MascotScene {
  const {
    isNewUser, hasActiveMission, missionStatus, checklistProgress,
    badgeUnlocked, rescueAlert, leaderboardVisible, errorState,
    userInactive, screen, missionsCompleted, leaderboardOptedIn,
  } = input;

  if (errorState) return 'error';
  if (rescueAlert) return 'urgent_rescue' as MascotScene;
  if (badgeUnlocked) return 'badge_earned';

  switch (screen) {
    case 'onboarding':
    case 'onboarding-2':
    case 'onboarding-3':
    case 'onboarding-4':
      if (screen === 'onboarding') return 'onboarding_welcome';
      if (screen === 'onboarding-2') return 'onboarding_mission';
      if (screen === 'onboarding-3') return 'onboarding_impact';
      return 'onboarding_privacy';

    case 'home':
      if (isNewUser && missionsCompleted === 0) return 'home_empty';
      if (hasActiveMission) return 'mission_active';
      if (missionStatus === 'available') return 'mission_available';
      return 'home_empty';

    case 'mission-detail':
      return 'mission_detail';

    case 'task':
      if (checklistProgress > 0 && checklistProgress < 1) return 'mission_active';
      return 'mission_active';

    case 'proof':
      return 'proof_required';

    case 'success':
      return 'mission_success';

    case 'stories':
      if (missionsCompleted === 0) return 'impact_empty';
      return 'impact_updated';

    case 'league':
      if (!leaderboardOptedIn) return 'leaderboard_intro';
      return 'leaderboard_success';

    case 'lb-register':
      return 'leaderboard_registration';

    case 'lb-consent':
      return 'leaderboard_privacy';

    case 'profile':
      if (missionsCompleted === 0) return 'profile_beginner';
      return 'profile_progress';

    default:
      if (userInactive) return 'loading' as MascotScene;
      return 'home_empty';
  }
}
