import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Button } from '@/app/components/primitives/Button';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { useUser } from '@/app/store/user';
import { useApp } from '@/app/store/app';
import { COLOR } from '@/app/lib/theme';
import { MapPin, Loader2 } from 'lucide-react-native';

const neighborhoods = [
  { id: 'n1', name: 'Indiranagar', sub: '12th Main · 100 Feet Road', helpers: 47, distance: '0.3 km' },
  { id: 'n2', name: 'Koramangala', sub: '5th Block · Forum Mall area', helpers: 38, distance: '1.2 km' },
  { id: 'n3', name: 'Jayanagar', sub: '4th Block · BDA Complex', helpers: 29, distance: '2.8 km' },
  { id: 'n4', name: 'HSR Layout', sub: 'Sector 1 · Silk Board', helpers: 52, distance: '3.1 km' },
];

export default function LocationOnboarding() {
  const router = useRouter();
  const setNeighborhood = useUser((s) => s.setNeighborhood);
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        const nearest = neighborhoods[0];
        setNeighborhood({ id: nearest.id, name: nearest.name, sub: nearest.sub });
        completeOnboarding();
        router.replace('/(tabs)');
      } else {
        setErrorMsg('Location access denied');
        router.push('/onboarding/manual-area');
      }
    } catch (e) {
      router.push('/onboarding/manual-area');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer bg="jungleSoft" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 }}>
          <Bob amplitude={8}>
            <Biscuit size={180} mood="happy" />
          </Bob>

          <RiseIn delay={100}>
            <Text variant="display-2" align="center">Find animals near you</Text>
          </RiseIn>

          <RiseIn delay={200}>
            <Text variant="body-l" align="center" style={{ maxWidth: 320 }}>
              We use your area to show nearby animal care missions. Your location stays private.
            </Text>
          </RiseIn>

          <RiseIn delay={300} style={{ width: '100%', gap: 12 }}>
            <Button variant="jungle" size="lg" onPress={requestLocation} loading={loading} leftIcon={<MapPin size={22} color="#fff" />}>
              Use my location
            </Button>

            <Button variant="ghost" size="md" onPress={() => router.push('/onboarding/manual-area')}>
              Pick my area manually
            </Button>
          </RiseIn>

          {errorMsg && (
            <Text variant="meta" align="center" color="coral">{errorMsg}</Text>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
