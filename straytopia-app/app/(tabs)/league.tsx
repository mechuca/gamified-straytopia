import React from 'react';
import { Pressable, View, ScrollView } from 'react-native';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Avatar } from '@/app/components/primitives/Avatar';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { useVerifiedImpact } from '@/app/lib/useVerifiedImpact';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { Trophy, ShieldCheck } from 'lucide-react-native';

const scopes = ['Verified', 'Nearby', 'All time'];

const medalColors = ['#FFC83D', '#C0C0C0', '#CD7F32'];

export default function LeagueScreen() {
  const [scope, setScope] = React.useState('Verified');
  const { impact, loading } = useVerifiedImpact();
  const leaderboardOptedIn = useUser((s) => s.leaderboardOptedIn);
  const entries = impact.leaderboard;

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
          <Text variant="eyebrow">OPS VERIFIED</Text>
          <Text variant="display-3">Care Standings</Text>
        </View>

        {/* Promotion Banner */}
        <Card tone="gold" style={{ marginBottom: 20, padding: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Trophy size={32} color={COLOR.goldInk} />
              <View style={{ flex: 1 }}>
                <Text variant="h" color="goldInk">Verified impact only</Text>
                <Text variant="body" color="goldInk">Standings count tasks after ops evidence review, not local taps.</Text>
              </View>
            </View>
          </Card>

        {/* Scope Toggle */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {scopes.map((s) => (
              <Pressable key={s} onPress={() => setScope(s)}>
                <Pill tone={scope === s ? 'ink' : 'paper'} variant={scope === s ? 'solid' : 'soft'}>
                  {s}
                </Pill>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Standings */}
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          {entries.map((entry, i) => (
            <RiseIn key={`${entry.rank}-${entry.name}`} delay={i * 50}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12,
                backgroundColor: entry.is_me ? COLOR.jungleSoft : 'transparent',
                borderBottomWidth: i < entries.length - 1 ? 1 : 0,
                borderBottomColor: COLOR.hairline,
                ...(entry.is_me ? { borderLeftWidth: 3, borderLeftColor: COLOR.jungle } : {}),
              }}>
                <View style={{
                  width: 30, height: 30, borderRadius: 10,
                  backgroundColor: i < 3 ? medalColors[i] : COLOR.paper3,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text variant="num" style={{ fontSize: 14, color: i < 3 ? '#fff' : COLOR.muted }}>{entry.rank}</Text>
                </View>
                <Avatar name={entry.name} size={40} tone={entry.is_me ? 'jungle' : 'sky'} />
                <View style={{ flex: 1 }}>
                  <Text variant="h">{entry.name}{entry.is_me ? ' (You)' : ''}</Text>
                  <Text variant="meta">{entry.mission_count} verified tasks</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text variant="display-4" style={{ fontSize: 20 }}>{entry.points}</Text>
                  <ShieldCheck size={12} color={COLOR.jungle} />
                </View>
              </View>
            </RiseIn>
          ))}
          {entries.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text variant="h">{loading ? 'Loading verified standings' : 'No verified standings yet'}</Text>
              <Text variant="meta" align="center" style={{ marginTop: 4 }}>Complete assigned care work and wait for proof review.</Text>
            </View>
          )}
        </Card>

        <Card tone="paper-2" style={{ marginTop: 16, padding: 14 }}>
          <Text variant="meta" align="center">
            Rankings are anonymous and proof-backed. Trust signals remain private to ops.
          </Text>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
