import React from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { useApp } from '@/app/store/app';
import { useUser } from '@/app/store/user';
import { useMissions } from '@/app/store/missions';
import { usePoints } from '@/app/store/points';
import { useBadges } from '@/app/store/badges';
import { useReports } from '@/app/store/reports';
import { useLeaderboard } from '@/app/store/leaderboard';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, RotateCcw, Bell, Shield, X } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const resetAll = useApp((s) => s.resetAll);
  const resetUser = useUser((s) => s.reset);
  const resetMissions = useMissions((s) => s.reset);
  const resetPoints = usePoints((s) => s.reset);
  const resetBadges = useBadges((s) => s.reset);
  const resetReports = useReports((s) => s.reset);
  const resetLeaderboard = useLeaderboard((s) => s.reset);

  const handleReset = () => {
    Alert.alert('Reset demo', 'This will clear all your data and start fresh. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          resetAll();
          resetUser();
          resetMissions();
          resetPoints();
          resetBadges();
          resetReports();
          resetLeaderboard();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Text variant="title">Settings</Text>
          <View style={{ flex: 1 }} />
        </View>

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
            <Bell size={20} color={COLOR.sky} />
            <View style={{ flex: 1 }}>
              <Text variant="h">Notifications</Text>
              <Text variant="meta">Mission alerts and updates</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
            <Shield size={20} color={COLOR.jungle} />
            <View style={{ flex: 1 }}>
              <Text variant="h">Privacy</Text>
              <Text variant="meta">Control your visibility</Text>
            </View>
          </View>
        </Card>

        <Card tone="coralSoft" style={{ padding: 20, alignItems: 'center' }}>
          <RotateCcw size={32} color={COLOR.coral} />
          <Text variant="h" color="coralInk" style={{ marginTop: 12 }}>Reset Demo</Text>
          <Text variant="body" color="coralInk" align="center" style={{ marginTop: 4 }}>
            Clear all data and start from the beginning.
          </Text>
          <Button variant="coral" size="md" onPress={handleReset} style={{ marginTop: 16 }}>
            Reset Everything
          </Button>
        </Card>
      </View>
    </ScreenContainer>
  );
}
