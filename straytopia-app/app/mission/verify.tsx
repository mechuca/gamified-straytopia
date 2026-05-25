import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { useMissions } from '@/app/store/missions';
import { COLOR } from '@/app/lib/theme';
import { CheckCircle2, Loader2, Clock } from 'lucide-react-native';

const steps = [
  { label: 'Saving proof locally', icon: 'local' },
  { label: 'Preparing ops task update', icon: 'task' },
  { label: 'Queueing evidence for hub review', icon: 'queue' },
  { label: 'Waiting for ops verification', icon: 'review' },
  { label: 'Points unlock only after approval', icon: 'trust' },
];

export default function ProofReviewPreviewScreen() {
  const router = useRouter();
  const activeMissionId = useMissions((s) => s.activeMissionId);
  const mission = useMissions((s) => s.missions.find((m) => m.id === activeMissionId));
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
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

          <Text variant="display-3" align="center">Proof queued for review</Text>
          <Text variant="body-l" align="center">Ops will verify the evidence before points, rankings, or impact are credited.</Text>

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

          <Button variant="jungle" size="lg" onPress={() => router.replace('/(tabs)')}>
            Back home
          </Button>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
