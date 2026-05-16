export const COLOR = {
  jungle: '#2DC653',
  jungleDeep: '#1B8A36',
  jungleSoft: '#DFF6E3',
  jungleInk: '#0F4C20',
  coral: '#FF5A4A',
  coralDeep: '#C92F22',
  coralSoft: '#FFE2DC',
  coralInk: '#6B1A12',
  gold: '#FFC83D',
  goldDeep: '#C98E00',
  goldSoft: '#FFF1C8',
  goldInk: '#5C3F00',
  sky: '#1CB0F6',
  skyDeep: '#0E83B9',
  skySoft: '#D6F2FF',
  plum: '#A560E8',
  plumDeep: '#7733C2',
  plumSoft: '#F0E0FF',
  paper: '#FFFCEF',
  paper2: '#F7F0DA',
  paper3: '#ECE2C5',
  surface: '#FFFFFF',
  ink: '#1A1B1F',
  ink2: '#424551',
  muted: '#7C7E8A',
  hairline: '#E8E1CD',
  hairline2: '#D8CFB4',
} as const;

export const RADIUS = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 9999,
} as const;

export const BORDER = {
  card: 2.5,
  cardBottom: 4,
  buttonPress: 4,
} as const;

export const MOTION = {
  duration: {
    fast: 140,
    base: 220,
    slow: 380,
    long: 600,
  },
  easing: {
    out: [0.22, 1, 0.36, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
  spring: {
    default: { damping: 14, stiffness: 180, mass: 1 },
    snappy: { damping: 18, stiffness: 280, mass: 0.7 },
    bouncy: { damping: 10, stiffness: 220, mass: 0.9 },
    press: { damping: 22, stiffness: 400, mass: 0.5 },
  },
} as const;

export type ColorToken = keyof typeof COLOR;

export const cardElevation = {
  borderWidth: BORDER.card,
  borderBottomWidth: BORDER.cardBottom,
  borderColor: COLOR.hairline,
};

export const buttonShadow = (shadowColor: string) => ({
  shadowColor,
  shadowOffset: { width: 0, height: BORDER.buttonPress },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 0,
});
