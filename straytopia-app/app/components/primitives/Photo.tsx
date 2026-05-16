import React from 'react';
import { View, Text, DimensionValue } from 'react-native';
import { COLOR } from '@/app/lib/theme';

interface PhotoProps {
  src?: string;
  width?: DimensionValue;
  height?: number;
  radius?: number;
  tone?: 'neutral' | 'jungle' | 'coral' | 'gold' | 'sky' | 'plum';
  label?: string;
  dark?: boolean;
}

const toneColors: Record<string, { bg: string; border: string }> = {
  neutral: { bg: COLOR.paper3, border: COLOR.hairline2 },
  jungle: { bg: '#C7EBC8', border: '#95D49C' },
  coral: { bg: '#FCD3CD', border: '#F0A29A' },
  gold: { bg: '#FBE4A5', border: '#E9C76B' },
  sky: { bg: '#C9E9F8', border: '#91CEED' },
  plum: { bg: '#E5CFF6', border: '#C09BE3' },
};

export function Photo({ width = '100%', height = 200, radius = 18, tone = 'neutral', label, dark = false }: PhotoProps) {
  const colors = toneColors[tone];
  const bg = dark ? '#1F1D17' : colors.bg;
  const border = dark ? '#2a2620' : colors.border;
  return (
    <View style={{
      width, height, borderRadius: radius, backgroundColor: bg,
      borderColor: border, borderWidth: 2.5, overflow: 'hidden',
      alignItems: 'flex-end', justifyContent: 'flex-end', padding: 10,
    }}>
      {label && (
        <Text style={{
          fontFamily: 'JetBrainsMono', fontSize: 10, fontWeight: '500',
          color: dark ? 'rgba(255,255,255,0.7)' : COLOR.ink2,
          letterSpacing: 0.04, textTransform: 'lowercase',
        }}>{label}</Text>
      )}
    </View>
  );
}
