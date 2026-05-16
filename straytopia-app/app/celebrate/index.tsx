import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Button } from '@/app/components/primitives/Button';
import { X } from 'lucide-react-native';

export default function CelebrateScreen() {
  const router = useRouter();

  return (
    <ScreenContainer bg="gold" statusBarStyle="dark">
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 24 }}>
        <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ position: 'absolute', top: 16, right: 16, padding: 8 }}>
          <X size={24} color="#fff" />
        </Button>
        <Text variant="display-1" color="goldInk" align="center">Level Up!</Text>
        <Text variant="body-l" color="goldInk" align="center">You've reached a new milestone. Keep helping animals near you.</Text>
        <Button variant="ink" size="lg" onPress={() => router.back()}>
          Keep going
        </Button>
      </View>
    </ScreenContainer>
  );
}
