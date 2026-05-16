export const LIGHT = {
  jungle: '#2DC653', jungleDeep: '#1B8A36', jungleSoft: '#DFF6E3', jungleInk: '#0F4C20',
  coral: '#FF5A4A', coralDeep: '#C92F22', coralSoft: '#FFE2DC', coralInk: '#6B1A12',
  gold: '#FFC83D', goldDeep: '#C98E00', goldSoft: '#FFF1C8', goldInk: '#5C3F00',
  sky: '#1CB0F6', skyDeep: '#0E83B9', skySoft: '#D6F2FF',
  plum: '#A560E8', plumDeep: '#7733C2', plumSoft: '#F0E0FF',
  paper: '#FFFCEF', paper2: '#F7F0DA', paper3: '#ECE2C5',
  surface: '#FFFFFF', ink: '#1A1B1F', ink2: '#424551', muted: '#7C7E8A',
  hairline: '#E8E1CD', hairline2: '#D8CFB4',
} as const;

export const DARK = {
  jungle: '#2DC653', jungleDeep: '#3DDC6A', jungleSoft: '#1A3D24', jungleInk: '#A8F0C0',
  coral: '#FF5A4A', coralDeep: '#FF7A6A', coralSoft: '#3D1A16', coralInk: '#FFB0A8',
  gold: '#FFC83D', goldDeep: '#FFD86A', goldSoft: '#3D2E0A', goldInk: '#FFE8A0',
  sky: '#1CB0F6', skyDeep: '#4AC4FF', skySoft: '#0A2D3D',
  plum: '#A560E8', plumDeep: '#C080FF', plumSoft: '#2D1A3D',
  paper: '#121214', paper2: '#1A1A1E', paper3: '#222228',
  surface: '#1E1E22', ink: '#F0F0F2', ink2: '#A0A0A8', muted: '#6A6A72',
  hairline: '#2A2A30', hairline2: '#34343C',
} as const;

export type ThemeColors = typeof LIGHT;

export const COLOR = LIGHT;

export const getTheme = (dark: boolean): ThemeColors => (dark ? DARK : LIGHT) as unknown as ThemeColors;
