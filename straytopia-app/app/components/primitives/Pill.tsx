import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { COLOR } from '@/app/lib/theme';

interface PillProps {
  tone?: keyof typeof COLOR;
  variant?: 'soft' | 'solid';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  children: React.ReactNode;
}

const softColors: Record<string, { bg: string; fg: string }> = {
  jungle: { bg: COLOR.jungleSoft, fg: COLOR.jungleDeep },
  coral: { bg: COLOR.coralSoft, fg: COLOR.coralDeep },
  gold: { bg: COLOR.goldSoft, fg: COLOR.goldInk },
  sky: { bg: COLOR.skySoft, fg: COLOR.skyDeep },
  plum: { bg: COLOR.plumSoft, fg: COLOR.plumDeep },
  ink: { bg: COLOR.paper2, fg: COLOR.ink },
  paper: { bg: COLOR.paper2, fg: COLOR.ink2 },
};

export function Pill({ tone = 'paper', variant = 'soft', leftIcon, rightIcon, style, children }: PillProps) {
  const colors = softColors[tone] || softColors.paper;
  const bgColor = variant === 'solid' ? COLOR[tone as keyof typeof COLOR] || COLOR.paper2 : colors.bg;
  const fgColor = variant === 'solid' ? (tone === 'gold' ? COLOR.goldInk : '#fff') : colors.fg;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', gap: 8,
      height: 32, paddingHorizontal: 14, borderRadius: 9999,
      backgroundColor: bgColor,
      ...style,
    }}>
      {leftIcon}
      <Text style={{ fontFamily: 'Nunito', fontWeight: '800', fontSize: 13, color: fgColor }}>{children}</Text>
      {rightIcon}
    </View>
  );
}
