import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import { E } from '@/app/lib/motion';

interface BobProps {
  amplitude?: number;
  period?: number;
  children: React.ReactNode;
}

export function Bob({ amplitude = 6, period = 2600, children }: BobProps) {
  const reduced = useReducedMotion();
  const y = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    y.value = withRepeat(
      withTiming(-amplitude, { duration: period / 2, easing: E.out }),
      -1, true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
