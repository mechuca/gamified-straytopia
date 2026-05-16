import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { Pop } from '@/app/components/motion/Pop';
import { Confetti } from '@/app/components/motion/Confetti';
import { useMissions } from '@/app/store/missions';
import { usePoints } from '@/app/store/points';
import { useBadges } from '@/app/store/badges';
import { COLOR } from '@/app/lib/theme';
import { Trophy, Award, Star, ArrowRight, Home } from 'lucide-react-native';

export default function MissionSuccessScreen() {
  const router = useRouter();
  const totalPoints = usePoints((s) => s.total);
  const activeMissionId = useMissions((s) => s.activeMissionId);
  const mission = useMissions((s) => s.missions.find((m) => m.id === activeMissionId));
  const badges = useBadges((s) => s.badges);
  const newlyUnlocked = badges.filter((b) => b.newlyUnlocked);

  return (
    <ScreenContainer bg="jungleSoft" statusBarStyle="dark">
      <Confetti count={50} active />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flex: 1, alignItems: 'center', gap: 20 }}>
          <Pop>
            <Bob>
              <Biscuit size={160} mood="happy" />
            </Bob>
          </Pop>

          <Pop delay={200}>
            <Text variant="display-2" align="center">Nice job!</Text>
          </Pop>

          <Pop delay={400}>
            <Card tone="gold" style={{ padding: 16, alignItems: 'center' }}>
              <Text variant="eyebrow" color="goldInk">IMPACT POINTS EARNED</Text>
              <Text variant="display-1" color="goldInk" style={{ marginTop: 4 }}>+{mission?.impactPoints || 50}</Text>
            </Card>
          </Pop>

          <Card style={{ width: '100%', padding: 16 }}>
            <Text variant="h" style={{ marginBottom: 8 }}>Total Impact Points</Text>
            <Text variant="display-3" color="gold">{totalPoints}</Text>
            <Text variant="body">Earn Impact Points for verified care</Text>
          </Card>

          {newlyUnlocked.length > 0 && (
            <Pop delay={600}>
              <Card tone="plumSoft" style={{ width: '100%', padding: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <Award size={22} color={COLOR.plum} />
                  <Text variant="h" color="plumDeep">Badge Unlocked!</Text>
                </View>
                {newlyUnlocked.map((badge) => (
                  <View key={badge.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Text style={{ fontSize: 28 }}>{badge.icon}</Text>
                    <View>
                      <Text variant="h">{badge.name}</Text>
                      <Text variant="meta">{badge.description}</Text>
                    </View>
                  </View>
                ))}
              </Card>
            </Pop>
          )}

          <View style={{ width: '100%', gap: 12 }}>
            <Button variant="jungle" size="lg" onPress={() => router.replace('/(tabs)')} rightIcon={<Home size={20} color="#fff" />}>
              Back Home
            </Button>
            <Button variant="paper" size="md" onPress={() => router.replace('/(tabs)')}>
              Find another mission
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
