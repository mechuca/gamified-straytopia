import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSequence, withSpring } from 'react-native-reanimated';
import { COLOR } from '@/app/lib/theme';
import { useApp } from '@/app/store/app';

export function Toast() {
  const { showToast, toastMessage, toastType, hideToast } = useApp();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (showToast) {
      translateY.value = withSequence(
        withTiming(0, { duration: 300 }),
        withTiming(0, { duration: 2500 }),
        withTiming(-100, { duration: 300 }),
      );
      opacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(1, { duration: 2500 }),
        withTiming(0, { duration: 300 }),
      );
      const timer = setTimeout(hideToast, 3200);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const colors = {
    success: { bg: COLOR.jungleSoft, fg: COLOR.jungleDeep, border: COLOR.jungle },
    error: { bg: COLOR.coralSoft, fg: COLOR.coralDeep, border: COLOR.coral },
    info: { bg: COLOR.skySoft, fg: COLOR.skyDeep, border: COLOR.sky },
  };
  const c = colors[toastType];

  return (
    <Animated.View style={[{
      position: 'absolute', top: 60, left: 20, right: 20,
      padding: 16, borderRadius: 18,
      backgroundColor: c.bg, borderWidth: 2, borderColor: c.border,
      zIndex: 100,
    }, style]}>
      <Text style={{ fontFamily: 'Nunito', fontWeight: '700', fontSize: 15, color: c.fg, textAlign: 'center' }}>
        {toastMessage}
      </Text>
    </Animated.View>
  );
}
