import React, { useState } from 'react';
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
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { Flame, Zap, Heart, BookOpen, MapPin, ChevronRight, AlertTriangle } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();
  const missions = useMissions((s) => s.missions);
  const totalPoints = usePoints((s) => s.total);
  const neighborhood = useUser((s) => s.neighborhood);
  const [refreshing, setRefreshing] = useState(false);

  const availableMissions = missions.filter((m) => m.status === 'available');
  const urgentMissions = availableMissions.filter((m) => m.urgency === 'critical' || m.urgency === 'high');
  const completedCount = useMissions((s) => s.completedCount);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
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
              <Text variant="num" style={{ fontSize: 18, color: COLOR.coralDeep }}>3</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Zap size={20} color={COLOR.gold} />
              <Text variant="num" style={{ fontSize: 18, color: COLOR.goldDeep }}>{totalPoints}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Heart size={20} color={COLOR.coral} fill={COLOR.coral} />
              <Text variant="num" style={{ fontSize: 18, color: COLOR.coralDeep }}>5</Text>
            </View>
          </View>
        </View>

        {/* Week Banner */}
        <RiseIn delay={50}>
          <Card tone="jungle" style={{ marginBottom: 16, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text variant="eyebrow" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  NEARBY MISSIONS
                </Text>
                <Text variant="title" style={{ color: '#fff', marginTop: 4 }}>
                  {availableMissions.length} missions waiting
                </Text>
              </View>
              <BookOpen size={28} color="#fff" />
            </View>
          </Card>
        </RiseIn>

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
                <Text variant="body" color="coralInk">File a report and volunteers will respond.</Text>
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
