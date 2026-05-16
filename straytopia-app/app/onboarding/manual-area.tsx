import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Button } from '@/app/components/primitives/Button';
import { Pill } from '@/app/components/primitives/Pill';
import { Card } from '@/app/components/primitives/Card';
import { useUser } from '@/app/store/user';
import { useApp } from '@/app/store/app';
import { COLOR } from '@/app/lib/theme';
import { MapPin, Check, ChevronRight } from 'lucide-react-native';

const neighborhoods = [
  { id: 'n1', name: 'Indiranagar', sub: '12th Main · 100 Feet Road', helpers: 47, distance: '0.3 km' },
  { id: 'n2', name: 'Koramangala', sub: '5th Block · Forum Mall area', helpers: 38, distance: '1.2 km' },
  { id: 'n3', name: 'Jayanagar', sub: '4th Block · BDA Complex', helpers: 29, distance: '2.8 km' },
  { id: 'n4', name: 'HSR Layout', sub: 'Sector 1 · Silk Board', helpers: 52, distance: '3.1 km' },
];

export default function ManualAreaSelection() {
  const router = useRouter();
  const setNeighborhood = useUser((s) => s.setNeighborhood);
  const completeOnboarding = useApp((s) => s.completeOnboarding);
  const [selected, setSelected] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selected) return;
    const n = neighborhoods.find((n) => n.id === selected);
    if (n) {
      setNeighborhood({ id: n.id, name: n.name, sub: n.sub });
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 32 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ChevronRight size={22} color={COLOR.ink2} style={{ transform: [{ rotate: '180deg' }] }} />
          </Button>
          <View style={{ flex: 1 }} />
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <View style={{ width: 24, height: 6, borderRadius: 3, backgroundColor: COLOR.jungle }} />
            <View style={{ width: 24, height: 6, borderRadius: 3, backgroundColor: COLOR.jungle }} />
          </View>
        </View>

        <Text variant="display-2" style={{ marginBottom: 8 }}>Pick your block.</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>Choose the area you want to help animals in.</Text>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={{ gap: 12, marginBottom: 24 }}>
            {neighborhoods.map((n) => {
              const isSelected = selected === n.id;
              return (
                <Card
                  key={n.id}
                  tone={isSelected ? 'surface' : 'paper-2'}
                  bordered={false}
                  style={{
                    padding: 16,
                    borderColor: isSelected ? COLOR.jungle : COLOR.hairline,
                    borderWidth: isSelected ? 2.5 : 1,
                    borderBottomWidth: isSelected ? 4 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{
                      width: 56, height: 56, borderRadius: 18,
                      backgroundColor: isSelected ? COLOR.jungleSoft : COLOR.paper3,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <MapPin size={28} color={isSelected ? COLOR.jungle : COLOR.muted} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text variant="h">{n.name}</Text>
                      <Text variant="meta">{n.sub}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text variant="meta">{n.distance}</Text>
                      <Text variant="meta">{n.helpers} helpers</Text>
                    </View>
                    {isSelected && (
                      <View style={{
                        width: 28, height: 28, borderRadius: 14,
                        backgroundColor: COLOR.jungle,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Check size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                </Card>
              );
            })}
          </View>

          <Button
            variant="jungle"
            size="lg"
            disabled={!selected}
            onPress={handleContinue}
          >
            Continue
          </Button>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
