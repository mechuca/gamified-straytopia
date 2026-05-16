import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { MOTION } from '@/app/lib/theme';
import { haptic } from '@/app/lib/haptics';

interface AnimatedPressableProps extends Omit<PressableProps, 'onPress'> {
  onPress: () => void;
  scale?: number;
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'tap' | null;
  children: React.ReactNode;
}

const AnimatedPressableInner = Animated.createAnimatedComponent(Pressable);

export function AnimatedPressable({ onPress, scale = 0.96, haptic: hapticType = 'tap', children, style, ...props }: AnimatedPressableProps) {
  const s = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
  }));

  return (
    <AnimatedPressableInner
      style={[style, animatedStyle]}
      onPressIn={() => { s.value = withSpring(scale, MOTION.spring.press); }}
      onPressOut={() => { s.value = withSpring(1, MOTION.spring.press); }}
      onPress={() => {
        if (hapticType) haptic[hapticType]();
        onPress();
      }}
      {...props}
    >
      {children}
    </AnimatedPressableInner>
  );
}
