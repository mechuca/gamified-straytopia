import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withDelay } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import { D, E } from '@/app/lib/motion';

interface ConfettiProps {
  count?: number;
  duration?: number;
  colors?: string[];
  active: boolean;
}

const defaultColors = ['#2DC653', '#FFC83D', '#FF5A4A', '#1CB0F6', '#A560E8'];

export function Confetti({ count = 36, duration = 1600, colors = defaultColors, active }: ConfettiProps) {
  const reduced = useReducedMotion();
  if (!active || reduced) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: count }).map((_, i) => (
        <ConfettiParticle key={i} index={i} duration={duration} colors={colors} />
      ))}
    </View>
  );
}

function ConfettiParticle({ index, duration, colors }: { index: number; duration: number; colors: string[] }) {
  const y = useSharedValue(-20);
  const r = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = (index % 10) * 80;
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 160 }),
      withDelay(duration - 400, withTiming(0.6, { duration: 240 })),
    ));
    y.value = withDelay(delay, withTiming(900, { duration, easing: E.out }));
    r.value = withDelay(delay, withTiming(720, { duration, easing: E.out }));
  }, []);

  const style = useAnimatedStyle(() => ({
    position: 'absolute',
    left: `${(index * 137) % 100}%`,
    top: 0,
    width: 10, height: 14, borderRadius: 2,
    backgroundColor: colors[index % colors.length],
    opacity: opacity.value,
    transform: [{ translateY: y.value }, { rotate: `${r.value}deg` }],
  }));

  return <Animated.View style={style} />;
}
