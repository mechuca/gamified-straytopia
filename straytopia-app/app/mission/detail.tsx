import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { useMissions } from '@/app/store/missions';
import { COLOR } from '@/app/lib/theme';
import { MapPin, Clock, Shield, ChevronRight, AlertTriangle, Camera, ArrowLeft } from 'lucide-react-native';

const missionIcons: Record<string, string> = {
  feeding: '🍖', water: '💧', rescue: '🚑', medical: '🏥', urgent: '⚡',
};

const urgencyColors: Record<string, 'coral' | 'gold' | 'jungle'> = {
  low: 'jungle', medium: 'gold', high: 'coral', critical: 'coral',
};

export default function MissionDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const mission = useMissions((s) => s.missions.find((m) => m.id === id));
  const acceptMission = useMissions((s) => s.acceptMission);

  if (!mission) {
    return (
      <ScreenContainer bg="paper" statusBarStyle="dark">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="title">Mission not found</Text>
          <Button variant="jungle" onPress={() => router.back()} style={{ marginTop: 16 }}>Go Back</Button>
        </View>
      </ScreenContainer>
    );
  }

  const handleAccept = () => {
    acceptMission(mission.id);
    router.push('/mission/accept-confirm');
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Pill tone={urgencyColors[mission.urgency]} variant="soft">
            {mission.urgency.toUpperCase()}
          </Pill>
        </View>

        <Text variant="display-3" style={{ marginBottom: 8 }}>{mission.title}</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>{mission.description}</Text>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
          <Card style={{ flex: 1, padding: 14, alignItems: 'center' }}>
            <MapPin size={20} color={COLOR.coral} />
            <Text variant="meta" style={{ marginTop: 6 }}>{mission.distance}</Text>
          </Card>
          <Card style={{ flex: 1, padding: 14, alignItems: 'center' }}>
            <Clock size={20} color={COLOR.gold} />
            <Text variant="meta" style={{ marginTop: 6 }}>{mission.estimatedTime} min</Text>
          </Card>
          <Card style={{ flex: 1, padding: 14, alignItems: 'center' }}>
            <Shield size={20} color={COLOR.jungle} />
            <Text variant="meta" style={{ marginTop: 6 }}>+{mission.impactPoints} IP</Text>
          </Card>
        </View>

        <Card tone="paper-2" style={{ marginBottom: 16, padding: 16 }}>
          <Text variant="h" style={{ marginBottom: 8 }}>What's needed</Text>
          <Text variant="body">{mission.proofRequired}</Text>
        </Card>

        <Card tone="goldSoft" style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AlertTriangle size={20} color={COLOR.goldInk} />
            <Text variant="body" color="goldInk">{mission.safetyNote}</Text>
          </View>
        </Card>

        <Button variant="jungle" size="lg" onPress={handleAccept}>
          Accept Mission
        </Button>
      </View>
    </ScreenContainer>
  );
}
