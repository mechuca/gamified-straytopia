import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { Pop } from '@/app/components/motion/Pop';
import { useMissions } from '@/app/store/missions';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { Shield, Check, ArrowLeft } from 'lucide-react-native';

export default function AcceptConfirmScreen() {
  const router = useRouter();
  const activeMissionId = useMissions((s) => s.activeMissionId);
  const mission = useMissions((s) => s.missions.find((m) => m.id === activeMissionId));
  const firstMissionAccepted = useUser((s) => s.firstMissionAccepted);
  const leaderboardChoiceMade = useUser((s) => s.leaderboardChoiceMade);
  const setFirstMissionAccepted = useUser((s) => s.setFirstMissionAccepted);

  const handleContinue = () => {
    setFirstMissionAccepted();
    if (!firstMissionAccepted && !leaderboardChoiceMade) {
      router.push('/mission/opt-in');
    } else {
      router.push('/mission/task');
    }
  };

  return (
    <ScreenContainer bg="jungleSoft" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <Pop>
            <Bob>
              <Biscuit size={160} mood="wow" />
            </Bob>
          </Pop>

          <Text variant="display-3" align="center">Mission accepted!</Text>
          <Text variant="body-l" align="center" style={{ maxWidth: 300 }}>
            {mission?.title}. You're making a real difference.
          </Text>

          <Card style={{ width: '100%', padding: 16, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Shield size={22} color={COLOR.jungle} />
              <Text variant="body">Your identity stays private until you choose to share it.</Text>
            </View>
          </Card>

          <View style={{ width: '100%', gap: 12 }}>
            <Button variant="jungle" size="lg" onPress={handleContinue} rightIcon={<Check size={20} color="#fff" />}>
              Start the mission
            </Button>
            <Button variant="ghost" size="md" onPress={() => router.replace('/(tabs)')}>
              Go back home
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
