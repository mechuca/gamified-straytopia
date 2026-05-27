import React from 'react';
import { View, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { useReportTracking } from '@/app/lib/useReportTracking';
import { useReports } from '@/app/store/reports';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, CheckCircle2, Clock, Shield } from 'lucide-react-native';

export default function ReportTrackScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const tracked = useReportTracking();
  const localReports = useReports((s) => s.reports);
  const reportId = typeof id === 'string' ? id : localReports[0]?.id;
  const local = localReports.find((report) => report.id === reportId) ?? localReports[0];
  const remote = tracked.find((report) => report.external_id === reportId);
  const timeline = local?.timeline ?? [{ step: 'Report submitted', at: Date.now() }];
  const status = local?.status ?? remote?.status ?? 'submitted';

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Pill tone={status === 'resolved' ? 'jungle' : status === 'failed' ? 'coral' : 'gold'} variant="soft">{String(status).replace('_', ' ')}</Pill>
        </View>

        <Text variant="eyebrow">REPORT TRACKING</Text>
        <Text variant="display-3" style={{ marginTop: 4 }}>{reportId ?? 'Latest report'}</Text>
        <Text variant="body-l" style={{ marginTop: 8, marginBottom: 20 }}>
          {remote?.latest_notification_body ?? 'This timeline updates from the ops case record when Supabase is reachable.'}
        </Text>

        <Card style={{ padding: 16, marginBottom: 16 }}>
          {timeline.map((step, index) => (
            <View key={`${step.step}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: index < timeline.length - 1 ? 14 : 0 }}>
              <View style={{ width: 30, height: 30, borderRadius: 10, backgroundColor: index === timeline.length - 1 ? COLOR.gold : COLOR.jungle, alignItems: 'center', justifyContent: 'center' }}>
                {index === timeline.length - 1 && status !== 'resolved' ? <Clock size={15} color="#fff" /> : <CheckCircle2 size={15} color="#fff" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="body" style={{ fontWeight: '800' }}>{step.step}</Text>
                <Text variant="meta">{new Date(step.at).toLocaleString()}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card tone="jungleSoft" style={{ padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Shield size={20} color={COLOR.jungle} />
            <Text variant="body" color="jungleInk">Urgent reports stay in the ops queue until reviewed, assigned, or closed.</Text>
          </View>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}
