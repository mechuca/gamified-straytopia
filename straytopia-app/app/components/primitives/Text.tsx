import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';
import { COLOR } from '@/app/lib/theme';

type TextVariant = 'display-1' | 'display-2' | 'display-3' | 'display-4' | 'title' | 'h' | 'body-l' | 'body' | 'meta' | 'eyebrow' | 'num';

interface TextProps extends Omit<RNTextProps, 'style'> {
  variant?: TextVariant;
  color?: keyof typeof COLOR;
  align?: 'left' | 'center' | 'right';
  style?: TextStyle;
}

const variants: Record<TextVariant, TextStyle> = {
  'display-1': { fontFamily: 'Fredoka', fontWeight: '600', fontSize: 52, letterSpacing: -0.015, lineHeight: 53 },
  'display-2': { fontFamily: 'Fredoka', fontWeight: '600', fontSize: 40, letterSpacing: -0.015, lineHeight: 41 },
  'display-3': { fontFamily: 'Fredoka', fontWeight: '600', fontSize: 32, letterSpacing: -0.015, lineHeight: 33 },
  'display-4': { fontFamily: 'Fredoka', fontWeight: '600', fontSize: 26, letterSpacing: -0.015, lineHeight: 27 },
  'title': { fontFamily: 'Fredoka', fontWeight: '600', fontSize: 22, letterSpacing: -0.01, lineHeight: 25 },
  'h': { fontFamily: 'Fredoka', fontWeight: '600', fontSize: 18, letterSpacing: -0.005 },
  'body-l': { fontFamily: 'Nunito', fontWeight: '500', fontSize: 17, lineHeight: 26, color: COLOR.ink2 },
  'body': { fontFamily: 'Nunito', fontWeight: '500', fontSize: 15, lineHeight: 23, color: COLOR.ink2 },
  'meta': { fontFamily: 'Nunito', fontWeight: '700', fontSize: 13, color: COLOR.muted },
  'eyebrow': { fontFamily: 'Nunito', fontWeight: '800', fontSize: 11, letterSpacing: 0.12, textTransform: 'uppercase', color: COLOR.muted },
  'num': { fontFamily: 'JetBrainsMono', fontWeight: '600', letterSpacing: -0.01 },
};

export function Text({ variant = 'body', color, align = 'left', style, ...props }: TextProps) {
  return (
    <RNText
      style={[variants[variant], color && { color: COLOR[color] }, align === 'center' && { textAlign: 'center' }, align === 'right' && { textAlign: 'right' }, style]}
      {...props}
    />
  );
}
