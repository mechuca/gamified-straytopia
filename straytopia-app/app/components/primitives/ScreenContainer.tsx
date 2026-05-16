import React from 'react';
import { View, SafeAreaView, StatusBar, ViewStyle, StyleProp } from 'react-native';
import { COLOR } from '@/app/lib/theme';

interface ScreenContainerProps {
  bg?: keyof typeof COLOR | string;
  tabBar?: boolean;
  statusBarStyle?: 'light' | 'dark' | 'auto';
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ScreenContainer({ bg = 'paper', tabBar = false, statusBarStyle = 'dark', children, style }: ScreenContainerProps) {
  const bgColor = typeof bg === 'string' && bg in COLOR ? COLOR[bg as keyof typeof COLOR] : bg;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor, ...(tabBar ? { paddingBottom: 110 } : {}) }}>
      <StatusBar barStyle={statusBarStyle === 'light' ? 'light-content' : statusBarStyle === 'dark' ? 'dark-content' : 'default'} />
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
