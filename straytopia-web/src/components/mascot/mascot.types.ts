export type MascotState =
  | 'idle'
  | 'welcome'
  | 'guideMission'
  | 'missionOpen'
  | 'missionComplete'
  | 'unlockNext'
  | 'impactProud'
  | 'confirmParticipation'
  | 'participationConfirmed'
  | 'cancelNeutral'
  | 'leaderboardCTA'
  | 'profileEmpty'
  | 'profileComplete'
  | 'errorSupport'
  | 'curious'
  | 'celebrating'
  | 'worried'
  | 'proud'
  | 'calmNeutral'
  | 'happy'
  | 'sleepy';

export interface MascotMessage {
  state: MascotState;
  text: string;
  sub?: string;
}

export interface MascotSceneRule {
  trigger: string;
  state: MascotState;
  message: string;
  sub?: string;
}
