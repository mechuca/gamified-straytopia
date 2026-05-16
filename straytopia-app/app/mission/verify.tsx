import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { useMissions } from '@/app/store/missions';
import { usePoints } from '@/app/store/points';
import { useBadges } from '@/app/store/badges';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { CheckCircle2, Loader2, Shield, Search, Clock, ArrowRight } from 'lucide-react-native';

const steps = [
  { label: 'Checking proof quality', icon: 'quality' },
  { label: 'Checking location & time', icon: 'location' },
  { label: 'Matching mission type', icon: 'match' },
  { label: 'Checking for duplicates', icon: 'duplicate' },
  { label: 'Scoring confidence', icon: 'score' },
];

export default function AIVerificationScreen() {
  const router = useRouter();
  const activeMissionId = useMissions((s) => s.activeMissionId);
  const mission = useMissions((s) => s.missions.find((m) => m.id === activeMissionId));
  const verifyMission = useMissions((s) => s.verifyMission);
  const awardPoints = usePoints((s) => s.award);
  const unlockBadge = useBadges((s) => s.unlockBadge);
  const updateProgress = useBadges((s) => s.updateProgress);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            if (mission) {
              verifyMission(mission.id, 'verified');
              awardPoints(mission.impactPoints, 'Mission completed');
              unlockBadge('b1');
              updateProgress('b2', 1);
              updateProgress('b11', 1);
              updateProgress('b12', 1);
              router.replace('/mission/success');
            }
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 900);
    return () => clearInterval(interval);
  }, []);

  if (!mission) return null;

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flex: 1, alignItems: 'center', gap: 24 }}>
          <View style={{
            width: 100, height: 100, borderRadius: 50,
            backgroundColor: COLOR.jungleSoft,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Loader2 size={48} color={COLOR.jungle} />
          </View>

          <Text variant="display-3" align="center">Verifying your proof</Text>
          <Text variant="body-l" align="center">Our AI is checking your submission...</Text>

          <Card style={{ width: '100%', padding: 16 }}>
            {steps.map((step, i) => (
              <View key={i} style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingVertical: 10,
                borderBottomWidth: i < steps.length - 1 ? 1 : 0,
                borderBottomColor: COLOR.hairline,
                opacity: i <= currentStep ? 1 : 0.3,
              }}>
                {i < currentStep ? (
                  <CheckCircle2 size={20} color={COLOR.jungle} />
                ) : i === currentStep ? (
                  <Loader2 size={20} color={COLOR.jungle} />
                ) : (
                  <Clock size={20} color={COLOR.muted} />
                )}
                <Text variant="body" style={{ flex: 1 }}>{step.label}</Text>
                {i < currentStep && <Text variant="meta" color="jungle">Done</Text>}
              </View>
            ))}
          </Card>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
