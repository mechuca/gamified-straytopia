import React, { useEffect, useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { MissionCard } from '@/app/components/missions/MissionCard';
import { BiscuitMini } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { useMissions } from '@/app/store/missions';
import { usePoints } from '@/app/store/points';
import { useReports } from '@/app/store/reports';
import { useUser } from '@/app/store/user';
import { useOpsTasks } from '@/app/lib/useOpsTasks';
import { processQueuedSpineSync } from '@/app/lib/spineSync';
import { getSyncOutboxCount } from '@/app/lib/syncOutbox';
import { COLOR } from '@/app/lib/theme';
import { Flame, Zap, Heart, BookOpen, MapPin, ChevronRight, AlertTriangle } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const missions = useMissions((s) => s.missions);
  const totalPoints = usePoints((s) => s.total);
  const neighborhood = useUser((s) => s.neighborhood);
  const reports = useReports((s) => s.reports);
  const opsTasks = useOpsTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  const availableMissions = missions.filter((m) => m.status === 'available');
  const urgentMissions = availableMissions.filter((m) => m.urgency === 'critical' || m.urgency === 'high');
  const completedCount = useMissions((s) => s.completedCount);
  const localStreak = completedCount > 0 ? 1 : 0;

  useEffect(() => {
    void getSyncOutboxCount().then(setPendingSync);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await processQueuedSpineSync();
    setPendingSync(await getSyncOutboxCount());
    setRefreshing(false);
  };

  return (
    <ScreenContainer bg="paper" tabBar statusBarStyle="dark">
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLOR.jungle} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Strip */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingHorizontal: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{
              width: 32, height: 24, borderRadius: 6, overflow: 'hidden',
              borderWidth: 2, borderColor: COLOR.ink,
            }}>
              <View style={{ flex: 1, backgroundColor: '#FF9933' }} />
              <View style={{ flex: 1, backgroundColor: '#fff' }} />
              <View style={{ flex: 1, backgroundColor: '#138808' }} />
            </View>
            <Text variant="meta">{neighborhood?.name || 'Your area'}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Flame size={20} color={COLOR.coral} />
              <Text variant="num" style={{ fontSize: 18, color: COLOR.coralDeep }}>{localStreak}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap size={20} color={COLOR.gold} />
              <Text variant="num" style={{ fontSize: 18, color: COLOR.goldDeep }}>{totalPoints}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Heart size={20} color={COLOR.coral} fill={COLOR.coral} />
              <Text variant="num" style={{ fontSize: 18, color: COLOR.coralDeep }}>{reports.length}</Text>
            </View>
          </View>
        </View>

        {/* Week Banner */}
        <RiseIn delay={50}>
          <Card tone="jungle" style={{ marginBottom: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text variant="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  LOCAL CARE MISSIONS
                </Text>
                <Text variant="title" style={{ color: '#fff', marginTop: 4 }}>
                  {availableMissions.length} local mission options
                </Text>
              </View>
              <BookOpen size={28} color="#fff" />
            </View>
          </Card>
        </RiseIn>

        {pendingSync > 0 && (
          <Card tone="goldSoft" style={{ marginBottom: 16, padding: 14 }}>
            <Text variant="body" color="goldDeep">{pendingSync} update{pendingSync === 1 ? '' : 's'} waiting to sync. Pull down to retry.</Text>
          </Card>
        )}

        {/* Urgent Missions */}
        {urgentMissions.length > 0 && (
          <View style={{ marginBottom: 8 }}>
            <Text variant="eyebrow" style={{ marginBottom: 8, color: COLOR.coral }}>URGENT</Text>
            {urgentMissions.slice(0, 2).map((m, i) => (
              <RiseIn key={m.id} delay={100 + i * 70}>
                <MissionCard
                  id={m.id}
                  type={m.type}
                  title={m.title}
                  location={m.location}
                  distance={m.distance}
                  estimatedTime={m.estimatedTime}
                  urgency={m.urgency}
                  impactPoints={m.impactPoints}
                  onPress={() => router.push(`/mission/detail?id=${m.id}`)}
                />
              </RiseIn>
            ))}
          </View>
        )}

        {/* Ops Tasks (from hub) */}
        {opsTasks.length > 0 && (
          <View style={{ marginTop: 6, marginBottom: 12 }}>
            <Text variant="eyebrow" style={{ marginBottom: 8, color: COLOR.ink2 }}>FROM SHELTER OPS</Text>
            <Card tone="paper-2" style={{ padding: 16, marginBottom: 10 }}>
              <Text variant="h">{opsTasks.length} task{opsTasks.length === 1 ? '' : 's'} in your area</Text>
              <Text variant="meta" style={{ marginTop: 4 }}>These update live when shelters assign work.</Text>
              <View style={{ marginTop: 12, gap: 8 }}>
                {opsTasks.slice(0, 2).map((t) => (
                  <View key={t.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderTopWidth: 1, borderTopColor: COLOR.hairline, borderStyle: 'dashed' }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text variant="body" style={{ fontWeight: '800' }}>{t.template_title || 'Task'}</Text>
                      <Text variant="meta">{t.status.replace('_', ' ')}</Text>
                    </View>
                    <Pill tone={t.priority === 'critical' ? 'coral' : t.priority === 'high' ? 'gold' : t.priority === 'medium' ? 'sky' : 'paper'} variant="soft">
                      {t.priority}
                    </Pill>
                  </View>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* All Missions */}
        <Text variant="eyebrow" style={{ marginBottom: 8, marginTop: 8 }}>ALL MISSIONS</Text>
        {availableMissions.map((m, i) => (
          <RiseIn key={m.id} delay={200 + i * 70}>
            <MissionCard
              id={m.id}
              type={m.type}
              title={m.title}
              location={m.location}
              distance={m.distance}
              estimatedTime={m.estimatedTime}
              urgency={m.urgency}
              impactPoints={m.impactPoints}
              onPress={() => router.push(`/mission/detail?id=${m.id}`)}
            />
          </RiseIn>
        ))}

        {/* Impact Summary */}
        <RiseIn delay={400}>
          <Card style={{ marginTop: 8, marginBottom: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
              <View style={{ alignItems: 'center' }}>
                <Text variant="display-4" color="jungle">{completedCount}</Text>
                <Text variant="meta">Completed</Text>
              </View>
              <View style={{ width: 1, backgroundColor: COLOR.hairline }} />
              <View style={{ alignItems: 'center' }}>
                <Text variant="display-4" color="coral">{availableMissions.length}</Text>
                <Text variant="meta">Available</Text>
              </View>
              <View style={{ width: 1, backgroundColor: COLOR.hairline }} />
              <View style={{ alignItems: 'center' }}>
                <Text variant="display-4" color="gold">{totalPoints}</Text>
                <Text variant="meta">Impact Points</Text>
              </View>
            </View>
          </Card>
        </RiseIn>

        {/* Report CTA */}
        <RiseIn delay={500}>
          <Card tone="coralSoft" style={{ marginBottom: 24, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{
                width: 48, height: 48, borderRadius: 16,
                backgroundColor: COLOR.coral,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <AlertTriangle size={24} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="h" color="coralInk">See something that needs help?</Text>
                <Text variant="body" color="coralInk">File a report so ops can review and assign help.</Text>
              </View>
            </View>
            <Button variant="coral" size="md" onPress={() => router.push('/report/new')} style={{ marginTop: 12 }}>
              File a Report
            </Button>
          </Card>
        </RiseIn>
      </ScrollView>
    </ScreenContainer>
  );
}
