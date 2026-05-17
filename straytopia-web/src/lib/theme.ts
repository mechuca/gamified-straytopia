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
  jungle: '#3DDC6A', jungleDeep: '#5AE882', jungleSoft: '#14291C', jungleInk: '#B8F5CC',
  coral: '#FF6B5A', coralDeep: '#FF8A7A', coralSoft: '#2D1210', coralInk: '#FFC4BA',
  gold: '#FFD557', goldDeep: '#FFE080', goldSoft: '#2D2208', goldInk: '#FFF0B0',
  sky: '#3DBBF8', skyDeep: '#6AD4FF', skySoft: '#082030',
  plum: '#B475F0', plumDeep: '#CC99FF', plumSoft: '#1E1030',
  paper: '#0C0C0E', paper2: '#16161A', paper3: '#1E1E24',
  surface: '#1A1A20', ink: '#F2F2F4', ink2: '#A8A8B0', muted: '#62626A',
  hairline: '#282830', hairline2: '#32323C',
} as const;

export type ThemeColors = typeof LIGHT;

export const COLOR = LIGHT;

export const getTheme = (dark: boolean): ThemeColors => (dark ? DARK : LIGHT) as unknown as ThemeColors;
