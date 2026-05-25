import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator } from 'react-native';
import { Toast } from '@/app/components/feedback/Toast';
import { useMissionHubSync } from '@/app/lib/useMissionHubSync';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [fontError, setFontError] = useState(false);
  useMissionHubSync();

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          Fredoka: require('@/assets/fonts/Fredoka-SemiBold.ttf'),
          Nunito: require('@/assets/fonts/Nunito-Regular.ttf'),
          'Nunito-Bold': require('@/assets/fonts/Nunito-Bold.ttf'),
          'Nunito-ExtraBold': require('@/assets/fonts/Nunito-ExtraBold.ttf'),
          'Nunito-Black': require('@/assets/fonts/Nunito-Black.ttf'),
          JetBrainsMono: require('@/assets/fonts/JetBrainsMono-Medium.ttf'),
          'JetBrainsMono-Bold': require('@/assets/fonts/JetBrainsMono-Bold.ttf'),
        });
        setFontsLoaded(true);
      } catch (e) {
        console.warn('Font loading failed, using system fonts:', e);
        setFontError(true);
        setFontsLoaded(true);
      } finally {
        await SplashScreen.hideAsync();
      }
    }
    loadFonts();
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFCEF' }}>
        <ActivityIndicator size="large" color="#2DC653" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="mission" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="report" options={{ headerShown: false }} />
        <Stack.Screen name="badges" options={{ headerShown: false }} />
        <Stack.Screen name="leaderboard" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="celebrate" options={{ headerShown: false }} />
      </Stack>
      <Toast />
    </GestureHandlerRootView>
  );
}
