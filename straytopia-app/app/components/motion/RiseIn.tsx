import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { useReducedMotion } from 'react-native-reanimated';
import { D, E } from '@/app/lib/motion';

interface RiseInProps {
  delay?: number;
  distance?: number;
  style?: ViewStyle;
  children: React.ReactNode;
}

export function RiseIn({ delay = 0, distance = 14, style, children }: RiseInProps) {
  const reduced = useReducedMotion();
  const opacity = useSharedValue(reduced ? 1 : 0);
  const translateY = useSharedValue(reduced ? 0 : distance);

  useEffect(() => {
    if (reduced) return;
    opacity.value = withDelay(delay, withTiming(1, { duration: D.slow, easing: E.out }));
    translateY.value = withDelay(delay, withTiming(0, { duration: D.slow, easing: E.out }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
