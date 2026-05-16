import React from 'react';
import { View, Text } from 'react-native';
import { COLOR } from '@/app/lib/theme';

interface AvatarProps {
  name: string;
  src?: string;
  size?: number;
  tone?: 'sky' | 'jungle' | 'coral' | 'gold' | 'plum' | 'paper';
}

const toneColors: Record<string, { bg: string; fg: string }> = {
  sky: { bg: COLOR.sky, fg: '#fff' },
  jungle: { bg: COLOR.jungle, fg: '#fff' },
  coral: { bg: COLOR.coral, fg: '#fff' },
  gold: { bg: COLOR.gold, fg: COLOR.goldInk },
  plum: { bg: COLOR.plum, fg: '#fff' },
  paper: { bg: COLOR.paper2, fg: COLOR.ink2 },
};

export function Avatar({ name, size = 40, tone = 'sky' }: AvatarProps) {
  const colors = toneColors[tone];
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: colors.bg,
      borderWidth: 2.5, borderColor: '#fff',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 0,
    }}>
      <Text style={{ fontFamily: 'Fredoka', fontWeight: '600', fontSize: size * 0.42, color: colors.fg }}>
        {name[0].toUpperCase()}
      </Text>
    </View>
  );
}
