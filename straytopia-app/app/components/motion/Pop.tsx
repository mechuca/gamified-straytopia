import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring, withDelay } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import { D, E, S } from '@/app/lib/motion';

interface PopProps {
  delay?: number;
  rotate?: number;
  children: React.ReactNode;
}

export function Pop({ delay = 0, rotate = -8, children }: PopProps) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(reduced ? 1 : 0.6);
  const r = useSharedValue(reduced ? 0 : rotate);
  const opacity = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    if (reduced) return;
    const d = delay;
    opacity.value = withDelay(d, withTiming(1, { duration: 80 }));
    scale.value = withDelay(d, withSequence(
      withSpring(1.1, S.bouncy),
      withSpring(1, S.snappy),
    ));
    r.value = withDelay(d, withTiming(0, { duration: 520, easing: E.spring }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }, { rotate: `${r.value}deg` }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
