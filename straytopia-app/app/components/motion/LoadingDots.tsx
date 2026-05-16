import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, withDelay } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import { COLOR } from '@/app/lib/theme';
import { E } from '@/app/lib/motion';

interface LoadingDotsProps {
  colors?: string[];
}

export function LoadingDots({ colors = [COLOR.jungle, COLOR.gold, COLOR.coral] }: LoadingDotsProps) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {colors.map((color, i) => (
        <BouncingDot key={i} color={color} delay={i * 150} />
      ))}
    </View>
  );
}

function BouncingDot({ color, delay }: { color: string; delay: number }) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    y.value = withDelay(delay, withRepeat(withSequence(
      withTiming(-8, { duration: 200, easing: E.out }),
      withTiming(0, { duration: 800, easing: E.out }),
    ), -1));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <Animated.View style={[{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }, style]} />
  );
}
