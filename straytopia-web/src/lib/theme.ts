export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  locked: string;
  lockedSoft: string;
  completed: string;
  completedSoft: string;
  missionActive: string;
  missionLocked: string;
  missionCompleted: string;
  navBackground: string;
  navActive: string;
  navInactive: string;
  shadow: string;
  overlay: string;
  mascotBubble: string;
  mascotBubbleText: string;
  jungle: string;
  jungleDeep: string;
  jungleSoft: string;
  jungleInk: string;
  coral: string;
  coralDeep: string;
  coralSoft: string;
  coralInk: string;
  gold: string;
  goldDeep: string;
  goldSoft: string;
  goldInk: string;
  sky: string;
  skyDeep: string;
  skySoft: string;
  plum: string;
  plumDeep: string;
  plumSoft: string;
  paper: string;
  paper2: string;
  paper3: string;
  ink: string;
  ink2: string;
  muted: string;
  hairline: string;
  hairline2: string;
}

function createTheme(values: Omit<ThemeColors, 'jungle' | 'jungleDeep' | 'jungleSoft' | 'jungleInk' | 'coral' | 'coralDeep' | 'coralSoft' | 'coralInk' | 'gold' | 'goldDeep' | 'goldSoft' | 'goldInk' | 'sky' | 'skyDeep' | 'skySoft' | 'plum' | 'plumDeep' | 'plumSoft' | 'paper' | 'paper2' | 'paper3' | 'ink' | 'ink2' | 'muted' | 'hairline' | 'hairline2'> & {
  jungle: string;
  jungleDeep: string;
  jungleSoft: string;
  jungleInk: string;
  coral: string;
  coralDeep: string;
  coralSoft: string;
  coralInk: string;
  gold: string;
  goldDeep: string;
  goldSoft: string;
  goldInk: string;
  sky: string;
  skyDeep: string;
  skySoft: string;
  plum: string;
  plumDeep: string;
  plumSoft: string;
  paper: string;
  paper2: string;
  paper3: string;
  ink: string;
  ink2: string;
  muted: string;
  hairline: string;
  hairline2: string;
}): ThemeColors {
  return values;
}

export const LIGHT = createTheme({
  background: '#FFF9F1',
  surface: '#FFFDF8',
  surfaceElevated: '#FFFFFF',
  card: '#FFFDF8',
  cardMuted: '#F6F0E3',
  textPrimary: '#17181C',
  textSecondary: '#49505C',
  textMuted: '#7A808C',
  border: '#E6DDCC',
  borderStrong: '#CFC4AF',
  primary: '#2FBE5B',
  primaryHover: '#22994A',
  primarySoft: '#DFF6E6',
  success: '#2FBE5B',
  successSoft: '#DFF6E6',
  warning: '#E5A81D',
  warningSoft: '#FFF2C8',
  danger: '#E46652',
  dangerSoft: '#FDE3DC',
  info: '#2E9ED9',
  infoSoft: '#DDF2FB',
  locked: '#8B857A',
  lockedSoft: '#ECE6DB',
  completed: '#22994A',
  completedSoft: '#D8F3E0',
  missionActive: '#E5A81D',
  missionLocked: '#8B857A',
  missionCompleted: '#22994A',
  navBackground: 'rgba(255,253,248,0.92)',
  navActive: '#22994A',
  navInactive: '#7A808C',
  shadow: 'rgba(18, 24, 35, 0.10)',
  overlay: 'rgba(17, 22, 32, 0.42)',
  mascotBubble: '#FFFDF8',
  mascotBubbleText: '#17181C',
  jungle: '#2FBE5B',
  jungleDeep: '#22994A',
  jungleSoft: '#DFF6E6',
  jungleInk: '#134D28',
  coral: '#E46652',
  coralDeep: '#C34937',
  coralSoft: '#FDE3DC',
  coralInk: '#6E261C',
  gold: '#E5A81D',
  goldDeep: '#AF7700',
  goldSoft: '#FFF2C8',
  goldInk: '#5E4100',
  sky: '#2E9ED9',
  skyDeep: '#197DAF',
  skySoft: '#DDF2FB',
  plum: '#8F63D8',
  plumDeep: '#6841B6',
  plumSoft: '#F0E7FF',
  paper: '#FFF9F1',
  paper2: '#F6F0E3',
  paper3: '#EDE4D3',
  ink: '#17181C',
  ink2: '#49505C',
  muted: '#7A808C',
  hairline: '#E6DDCC',
  hairline2: '#CFC4AF',
});

export const DARK = createTheme({
  background: '#0F1314',
  surface: '#151B1C',
  surfaceElevated: '#1C2426',
  card: '#171F21',
  cardMuted: '#1F282A',
  textPrimary: '#F4F5F6',
  textSecondary: '#C3C8CE',
  textMuted: '#8B949D',
  border: '#2B3438',
  borderStrong: '#3A474C',
  primary: '#45CC74',
  primaryHover: '#59DA83',
  primarySoft: '#173124',
  success: '#45CC74',
  successSoft: '#173124',
  warning: '#E8B447',
  warningSoft: '#352A13',
  danger: '#F07A67',
  dangerSoft: '#351916',
  info: '#58B7E8',
  infoSoft: '#132733',
  locked: '#7D858D',
  lockedSoft: '#20282B',
  completed: '#45CC74',
  completedSoft: '#173124',
  missionActive: '#E8B447',
  missionLocked: '#7D858D',
  missionCompleted: '#45CC74',
  navBackground: 'rgba(21,27,28,0.92)',
  navActive: '#59DA83',
  navInactive: '#8B949D',
  shadow: 'rgba(0, 0, 0, 0.38)',
  overlay: 'rgba(3, 7, 10, 0.62)',
  mascotBubble: '#1C2426',
  mascotBubbleText: '#F4F5F6',
  jungle: '#45CC74',
  jungleDeep: '#59DA83',
  jungleSoft: '#173124',
  jungleInk: '#C7F6D7',
  coral: '#F07A67',
  coralDeep: '#FF9A8B',
  coralSoft: '#351916',
  coralInk: '#FFD0C7',
  gold: '#E8B447',
  goldDeep: '#FFD57E',
  goldSoft: '#352A13',
  goldInk: '#FFF1C0',
  sky: '#58B7E8',
  skyDeep: '#7ED2FF',
  skySoft: '#132733',
  plum: '#AF84ED',
  plumDeep: '#D0B2FF',
  plumSoft: '#251A36',
  paper: '#0F1314',
  paper2: '#151B1C',
  paper3: '#1C2426',
  ink: '#F4F5F6',
  ink2: '#C3C8CE',
  muted: '#8B949D',
  hairline: '#2B3438',
  hairline2: '#3A474C',
});

export const COLOR = LIGHT;

export const getTheme = (dark: boolean): ThemeColors => (dark ? DARK : LIGHT);

export function resolveSystemTheme(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
