import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { useMissions } from '@/app/store/missions';
import { COLOR } from '@/app/lib/theme';
import { MapPin, Camera, Clock, Shield, CheckCircle2, ArrowLeft } from 'lucide-react-native';

export default function MissionTaskScreen() {
  const router = useRouter();
  const activeMissionId = useMissions((s) => s.activeMissionId);
  const mission = useMissions((s) => s.missions.find((m) => m.id === activeMissionId));
  const startProof = useMissions((s) => s.startProof);
  const declineMission = useMissions((s) => s.declineMission);

  if (!mission) {
    return (
      <ScreenContainer bg="paper" statusBarStyle="dark">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text variant="title">No active mission</Text>
          <Button variant="jungle" onPress={() => router.replace('/(tabs)')} style={{ marginTop: 16 }}>Go Home</Button>
        </View>
      </ScreenContainer>
    );
  }

  const handleStart = () => {
    startProof(mission.id);
    router.push('/mission/proof');
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Pill tone="jungle" variant="solid">IN PROGRESS</Pill>
        </View>

        <Text variant="display-3" style={{ marginBottom: 8 }}>{mission.title}</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>{mission.description}</Text>

        <Card tone="paper-2" style={{ marginBottom: 16, padding: 16 }}>
          <Text variant="h" style={{ marginBottom: 12 }}>Mission Checklist</Text>
          {[
            { icon: <MapPin size={18} color={COLOR.jungle} />, text: `Go to ${mission.location}` },
            { icon: <Clock size={18} color={COLOR.gold} />, text: `Estimated time: ${mission.estimatedTime} minutes` },
            { icon: <Camera size={18} color={COLOR.sky} />, text: mission.proofRequired },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
              <CheckCircle2 size={18} color={COLOR.jungle} />
              <Text variant="body">{item.text}</Text>
            </View>
          ))}
        </Card>

        <Card tone="goldSoft" style={{ marginBottom: 24, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Shield size={20} color={COLOR.goldInk} />
            <Text variant="body" color="goldInk">{mission.safetyNote}</Text>
          </View>
        </Card>

        <Button variant="jungle" size="lg" onPress={handleStart}>
          I Completed This
        </Button>
        <Button variant="ghost" size="md" onPress={() => { if (mission.source === 'ops') declineMission(mission.id); router.replace('/(tabs)'); }} style={{ marginTop: 8 }}>
          {mission.source === 'ops' ? 'Decline Assignment' : 'Cancel Mission'}
        </Button>
      </View>
    </ScreenContainer>
  );
}
