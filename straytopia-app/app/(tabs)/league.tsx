import React from 'react';
import { Pressable, View, ScrollView } from 'react-native';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Avatar } from '@/app/components/primitives/Avatar';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { useLeaderboard, LeaderboardScope } from '@/app/store/leaderboard';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react-native';

const scopes: { key: LeaderboardScope; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
  { key: 'nearby', label: 'Nearby' },
];

const medalColors = ['#FFC83D', '#C0C0C0', '#CD7F32'];

export default function LeagueScreen() {
  const { scope, entries, setScope } = useLeaderboard();
  const leaderboardOptedIn = useUser((s) => s.leaderboardOptedIn);

  if (!leaderboardOptedIn) {
    return (
      <ScreenContainer bg="paper" tabBar statusBarStyle="dark">
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: COLOR.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={40} color={COLOR.gold} />
          </View>
          <Text variant="display-3" align="center">Join the leaderboard</Text>
          <Text variant="body-l" align="center">Complete your first mission to see how you rank against other helpers in your area.</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer bg="paper" tabBar statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ marginBottom: 16 }}>
          <Text variant="eyebrow">LOCAL PREVIEW · NOT OPS VERIFIED</Text>
          <Text variant="display-3">Gold League</Text>
        </View>

        {/* Promotion Banner */}
        <Card tone="gold" style={{ marginBottom: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Trophy size={32} color={COLOR.goldInk} />
            <View style={{ flex: 1 }}>
              <Text variant="h" color="goldInk">Prototype ranking</Text>
              <Text variant="body" color="goldInk">Live rank moderation and anti-abuse scoring are not connected yet.</Text>
            </View>
          </View>
        </Card>

        {/* Scope Toggle */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {scopes.map((s) => (
              <Pressable key={s.key} onPress={() => setScope(s.key)}>
                <Pill tone={scope === s.key ? 'ink' : 'paper'} variant={scope === s.key ? 'solid' : 'soft'}>
                  {s.label}
                </Pill>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Standings */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {entries.map((entry, i) => (
            <RiseIn key={entry.rank} delay={i * 50}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
                backgroundColor: entry.isMe ? COLOR.jungleSoft : 'transparent',
                borderBottomWidth: i < entries.length - 1 ? 1 : 0,
                borderBottomColor: COLOR.hairline,
                ...(entry.isMe ? { borderLeftWidth: 3, borderLeftColor: COLOR.jungle } : {}),
              }}>
                <View style={{
                  width: 30, height: 30, borderRadius: 10,
                  backgroundColor: i < 3 ? medalColors[i] : COLOR.paper3,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text variant="num" style={{ fontSize: 14, color: i < 3 ? '#fff' : COLOR.muted }}>{entry.rank}</Text>
                </View>
                <Avatar name={entry.name} size={40} tone={entry.avatarTone as any} />
                <View style={{ flex: 1 }}>
                  <Text variant="h">{entry.name}{entry.isMe ? ' (You)' : ''}</Text>
                  <Text variant="meta">{entry.missionCount} missions · {entry.badgeCount} badges</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="display-4" style={{ fontSize: 20 }}>{entry.points}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                    {entry.rankChange === 'up' && <TrendingUp size={12} color={COLOR.jungle} />}
                    {entry.rankChange === 'down' && <TrendingDown size={12} color={COLOR.coral} />}
                    {entry.rankChange === 'same' && <Minus size={12} color={COLOR.muted} />}
                    <Text variant="meta" style={{ fontSize: 10 }}>{entry.rankChange === 'new' ? 'New' : ''}</Text>
                  </View>
                </View>
              </View>
            </RiseIn>
          ))}
        </Card>

        <Card tone="paper-2" style={{ marginTop: 16, padding: 14 }}>
          <Text variant="meta" align="center">
            Preview standings use local seed data. Ops-verified scoring requires proof review, abuse checks, and regional aggregation.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
