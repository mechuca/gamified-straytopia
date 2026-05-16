import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { useUser } from '@/app/store/user';
import { usePoints } from '@/app/store/points';
import { useMissions } from '@/app/store/missions';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, Settings, Shield, Bell, Trash2, ChevronRight } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useUser();
  const totalPoints = usePoints((s) => s.total);
  const completedCount = useMissions((s) => s.completedCount);

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Text variant="title">Profile</Text>
          <View style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onPress={() => router.push('/settings')} style={{ padding: 8 }}>
            <Settings size={22} color={COLOR.muted} />
          </Button>
        </View>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: COLOR[user.avatarTone as keyof typeof COLOR],
            borderWidth: 3, borderColor: '#fff',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 12,
          }}>
            <Text style={{ fontFamily: 'Fredoka', fontWeight: '600', fontSize: 36, color: '#fff' }}>
              {user.avatarLetter}
            </Text>
          </View>
          <Text variant="display-4">{user.name || 'Friend'}</Text>
          <Text variant="meta">{user.neighborhood?.name || 'Indiranagar'}</Text>
        </View>

        <Card style={{ marginBottom: 16, padding: 16 }}>
          <Text variant="eyebrow">IMPACT SUMMARY</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <Text variant="display-3" color="gold">{totalPoints}</Text>
              <Text variant="meta">Impact Points</Text>
            </View>
            <View style={{ width: 1, backgroundColor: COLOR.hairline }} />
            <View style={{ alignItems: 'center' }}>
              <Text variant="display-3" color="jungle">{completedCount}</Text>
              <Text variant="meta">Missions</Text>
            </View>
            <View style={{ width: 1, backgroundColor: COLOR.hairline }} />
            <View style={{ alignItems: 'center' }}>
              <Text variant="display-3" color="coral">3</Text>
              <Text variant="meta">Day Streak</Text>
            </View>
          </View>
        </Card>

        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {[
            { icon: <Shield size={20} color={COLOR.jungle} />, title: 'Privacy', sub: user.privacyMode || 'Not set', route: '/settings' },
            { icon: <Bell size={20} color={COLOR.sky} />, title: 'Notifications', sub: 'Manage alerts', route: '/settings' },
            { icon: <Trash2 size={20} color={COLOR.coral} />, title: 'Reset Demo', sub: 'Clear all data', route: '/settings' },
          ].map((item, i) => (
            <View key={i} style={{
              flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12,
              borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: COLOR.hairline,
            }}>
              {item.icon}
              <View style={{ flex: 1 }}>
                <Text variant="h">{item.title}</Text>
                <Text variant="meta">{item.sub}</Text>
              </View>
              <ChevronRight size={18} color={COLOR.muted} />
            </View>
          ))}
        </Card>
      </View>
    </ScreenContainer>
  );
}
