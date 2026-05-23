import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Avatar } from '@/app/components/primitives/Avatar';
import { Button } from '@/app/components/primitives/Button';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { useUser } from '@/app/store/user';
import { usePoints } from '@/app/store/points';
import { useMissions } from '@/app/store/missions';
import { useBadges } from '@/app/store/badges';
import { useReports } from '@/app/store/reports';
import { COLOR } from '@/app/lib/theme';
import { Flame, Zap, Settings, ChevronRight, Shield, Award, BookOpen } from 'lucide-react-native';

export default function YouScreen() {
  const router = useRouter();
  const user = useUser();
  const totalPoints = usePoints((s) => s.total);
  const completedCount = useMissions((s) => s.completedCount);
  const reports = useReports((s) => s.reports);
  const badges = useBadges((s) => s.badges);
  const earnedBadges = badges.filter((b) => b.earned);
  const localStreak = completedCount > 0 ? 1 : 0;
  const resolvedReports = reports.filter((report) => report.status === 'resolved').length;

  return (
    <ScreenContainer bg="paper" tabBar statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Avatar name={user.name || 'P'} size={68} tone="jungle" />
            <View>
              <Text variant="display-4">{user.name || 'Friend'}</Text>
              <Text variant="meta">{user.neighborhood?.name || 'Indiranagar'} · since today</Text>
            </View>
          </View>
          <Button variant="ghost" size="sm" onPress={() => router.push('/settings')} style={{ padding: 8 }}>
            <Settings size={22} color={COLOR.muted} />
          </Button>
        </View>

        {/* Streak Hero */}
        <RiseIn delay={50}>
          <Card tone="coral" style={{ marginBottom: 12, padding: 20 }}>
            <Text variant="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>YOUR FIRE</Text>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 8 }}>
              <View>
                <Text variant="display-1" style={{ color: '#fff' }}>{localStreak}</Text>
                <Text variant="body" style={{ color: 'rgba(255,255,255,0.8)' }}>days on a roll</Text>
              </View>
              <Flame size={56} color={COLOR.gold} />
            </View>
            <View style={{ flexDirection: 'row', gap: 3, marginTop: 16 }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <View key={i} style={{
                  flex: 1, height: 8, borderRadius: 4,
                  backgroundColor: i < localStreak ? '#fff' : 'rgba(255,255,255,0.22)',
                }} />
              ))}
            </View>
            <Text variant="meta" style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>local streak only</Text>
          </Card>
        </RiseIn>

        {/* Points Card */}
        <RiseIn delay={100}>
          <Card style={{ marginBottom: 12, padding: 16 }}>
            <Text variant="eyebrow">LEVEL · IMPACT POINTS</Text>
            <Text variant="display-3" style={{ marginTop: 4 }}>{totalPoints}</Text>
            <Text variant="body">Local points. Ops-verified scoring is not connected yet.</Text>
          </Card>
        </RiseIn>

        {/* Stats Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            {[
            { label: 'Local completions', value: completedCount.toString(), color: 'jungle' as const, soft: COLOR.jungleSoft },
            { label: 'Reports filed', value: reports.length.toString(), color: 'coral' as const, soft: COLOR.coralSoft },
            { label: 'Cases resolved', value: resolvedReports.toString(), color: 'plum' as const, soft: COLOR.plumSoft },
            { label: 'Avg response', value: 'n/a', color: 'sky' as const, soft: COLOR.skySoft },
          ].map((stat, i) => (
            <RiseIn key={i} delay={150 + i * 70}>
              <Card tone="paper-2" style={{ width: '48%', padding: 16, borderBottomWidth: 4, borderBottomColor: COLOR[stat.color] }}>
                <Text variant="display-4" color={stat.color}>{stat.value}</Text>
                <Text variant="meta">{stat.label}</Text>
              </Card>
            </RiseIn>
          ))}
        </View>

        {/* Badges */}
        <RiseIn delay={300}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text variant="title">Badges</Text>
            <Button variant="ghost" size="sm" onPress={() => router.push('/badges')} style={{ padding: 8 }}>
              <Text variant="meta" color="jungle">See all</Text>
              <ChevronRight size={16} color={COLOR.jungle} />
            </Button>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {badges.slice(0, 6).map((badge) => (
                <View key={badge.id} style={{ alignItems: 'center', gap: 6 }}>
                  <View style={{
                    width: 76, height: 76, borderRadius: 20,
                    backgroundColor: badge.earned ? COLOR[badge.color as keyof typeof COLOR] + '33' : COLOR.paper2,
                    borderWidth: 2.5,
                    borderBottomWidth: 4,
                    borderColor: badge.earned ? COLOR[badge.color as keyof typeof COLOR] : COLOR.hairline,
                    alignItems: 'center', justifyContent: 'center',
                    opacity: badge.earned ? 1 : 0.55,
                  }}>
                    <Text style={{ fontSize: 32 }}>{badge.icon}</Text>
                  </View>
                  <Text variant="meta" style={{ fontSize: 10, textAlign: 'center' }}>{badge.name}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </RiseIn>

        {/* Quick Links */}
        <RiseIn delay={400}>
          <Card style={{ marginTop: 16, padding: 0, overflow: 'hidden' }}>
            {[
              { icon: <BookOpen size={20} color={COLOR.plum} />, title: 'Stories you\'re in', sub: 'Not connected yet', route: '/(tabs)/stories' },
              { icon: <Shield size={20} color={COLOR.jungle} />, title: 'Privacy settings', sub: 'Control your visibility', route: '/settings' },
              { icon: <Award size={20} color={COLOR.gold} />, title: 'Impact report', sub: 'Your monthly summary', route: '/profile' },
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
        </RiseIn>
      </ScrollView>
    </ScreenContainer>
  );
}
