import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLOR, BORDER } from '@/app/lib/theme';

type CardTone = 'surface' | 'paper-2' | 'jungle' | 'jungleSoft' | 'coral' | 'coralSoft' | 'gold' | 'goldSoft' | 'plum' | 'plumSoft' | 'sky' | 'skySoft' | 'ink';

interface CardProps {
  tone?: CardTone;
  padded?: boolean | number;
  bordered?: boolean;
  style?: ViewStyle;
  children: React.ReactNode;
}

const toneColors: Record<CardTone, string> = {
  surface: COLOR.surface,
  'paper-2': COLOR.paper2,
  jungle: COLOR.jungle,
  jungleSoft: COLOR.jungleSoft,
  coral: COLOR.coral,
  coralSoft: COLOR.coralSoft,
  gold: COLOR.gold,
  goldSoft: COLOR.goldSoft,
  plum: COLOR.plum,
  plumSoft: COLOR.plumSoft,
  sky: COLOR.sky,
  skySoft: COLOR.skySoft,
  ink: COLOR.ink,
};

export function Card({ tone = 'surface', padded = 18, bordered = true, style, children }: CardProps) {
  const padding = typeof padded === 'number' ? padded : padded ? 18 : 0;
  return (
    <View style={{
      backgroundColor: toneColors[tone],
      borderRadius: 24,
      padding,
      ...(bordered && tone === 'surface' ? {
        borderWidth: BORDER.card,
        borderBottomWidth: BORDER.cardBottom,
        borderColor: COLOR.hairline,
      } : {}),
      ...style,
    }}>
      {children}
    </View>
  );
}
