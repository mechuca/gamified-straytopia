import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import { haptic } from '@/app/lib/haptics';

interface ShakeProps {
  trigger: number;
  intensity?: number;
  children: React.ReactNode;
}

export function Shake({ trigger, intensity = 8, children }: ShakeProps) {
  const reduced = useReducedMotion();
  const x = useSharedValue(0);

  useEffect(() => {
    if (reduced) return;
    x.value = withSequence(
      withTiming(-intensity, { duration: 60 }),
      withTiming(intensity, { duration: 80 }),
      withTiming(-intensity * 0.6, { duration: 80 }),
      withTiming(intensity * 0.6, { duration: 80 }),
      withTiming(0, { duration: 80 }),
    );
    haptic.error();
  }, [trigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return <Animated.View style={animatedStyle}>{children}</Animated.View>;
}
