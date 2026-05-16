import React from 'react';
import { View, Text, ActivityIndicator, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { COLOR, RADIUS, BORDER, MOTION } from '@/app/lib/theme';
import { haptic } from '@/app/lib/haptics';

type ButtonVariant = 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'ink' | 'paper' | 'ghost';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  onPress: () => void;
  children: React.ReactNode;
}

const variantColors: Record<ButtonVariant, { bg: string; shadow: string; fg: string }> = {
  jungle: { bg: COLOR.jungle, shadow: COLOR.jungleDeep, fg: '#fff' },
  coral: { bg: COLOR.coral, shadow: COLOR.coralDeep, fg: '#fff' },
  gold: { bg: COLOR.gold, shadow: COLOR.goldDeep, fg: COLOR.goldInk },
  sky: { bg: COLOR.sky, shadow: COLOR.skyDeep, fg: '#fff' },
  plum: { bg: COLOR.plum, shadow: COLOR.plumDeep, fg: '#fff' },
  ink: { bg: COLOR.ink, shadow: '#000', fg: COLOR.paper },
  paper: { bg: COLOR.surface, shadow: COLOR.hairline2, fg: COLOR.ink },
  ghost: { bg: 'transparent', shadow: 'transparent', fg: COLOR.ink2 },
};

const sizeConfig = {
  sm: { paddingVertical: 10, paddingHorizontal: 16, fontSize: 14, minHeight: 44 },
  md: { paddingVertical: 16, paddingHorizontal: 22, fontSize: 18, minHeight: 56 },
  lg: { paddingVertical: 18, paddingHorizontal: 24, fontSize: 18, minHeight: 60 },
};

export function Button({ variant = 'jungle', size = 'md', leftIcon, rightIcon, disabled = false, loading = false, style, onPress, children }: ButtonProps) {
  const y = useSharedValue(0);
  const colors = variantColors[variant];
  const sz = sizeConfig[size];
  const isGhost = variant === 'ghost';

  const gesture = Gesture.Tap()
    .enabled(!disabled && !loading)
    .onBegin(() => {
      y.value = withSpring(BORDER.buttonPress, MOTION.spring.press);
      haptic.tap();
    })
    .onEnd(() => {
      y.value = withSpring(0, MOTION.spring.press);
      onPress();
    })
    .onFinalize(() => {
      y.value = withSpring(0, MOTION.spring.press);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View style={{ marginBottom: isGhost ? 0 : BORDER.buttonPress }}>
        <Animated.View style={[
          {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
            gap: 10, paddingVertical: sz.paddingVertical, paddingHorizontal: sz.paddingHorizontal,
            minHeight: sz.minHeight, borderRadius: RADIUS.md,
            backgroundColor: colors.bg,
            borderWidth: isGhost ? 2.5 : 0,
            borderColor: isGhost ? COLOR.hairline2 : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
          animatedStyle,
          style,
        ]}>
          {loading ? (
            <ActivityIndicator color={colors.fg} />
          ) : (
            <>
              {leftIcon}
              <Text style={{
                fontFamily: 'Fredoka', fontWeight: '600', fontSize: sz.fontSize,
                letterSpacing: 0.01, textTransform: 'uppercase', color: colors.fg,
              }}>{children}</Text>
              {rightIcon}
            </>
          )}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
