import React, { useEffect, useMemo, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { Pop } from '@/app/components/motion/Pop';
import { useReports } from '@/app/store/reports';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { AlertTriangle, CheckCircle2, Clock, MapPin, Shield, Home } from 'lucide-react-native';
import { ensureAuthed, hasSupabase, supabase } from '@/app/lib/supabase';
import { mapSpineStatusToMobileStatus, processQueuedSpineSync, syncReportToSpine } from '@/app/lib/spineSync';
import { useReportTracking } from '@/app/lib/useReportTracking';
import { getSyncOutboxCount } from '@/app/lib/syncOutbox';

export default function ReportSubmittedScreen() {
  const router = useRouter();
  const reports = useReports((s) => s.reports);
  const draft = useReports((s) => s.draft);
  const submitReport = useReports((s) => s.submitReport);
  const updateReport = useReports((s) => s.updateReport);
  const neighborhood = useUser((s) => s.neighborhood);
  const [pendingSync, setPendingSync] = useState(0);
  useReportTracking();

  useEffect(() => {
    // This screen is the “success” for the report form.
    // Commit the draft once, then sync to the shared backend (if configured).
    if (draft) {
      const created = submitReport();
      void syncReportToSpine(created, { blockName: neighborhood?.name }).then(async () => {
        await processQueuedSpineSync();
        setPendingSync(await getSyncOutboxCount());
      });
    }
  }, []);

  const lastReport = reports[0];

  useEffect(() => {
    const client = supabase;
    if (!hasSupabase() || !client || !lastReport) return;
    void ensureAuthed();
    const channel = client
      .channel(`case_${lastReport.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `external_id=eq.${lastReport.id}`,
        },
        (payload) => {
          const next = payload.new as { status?: Parameters<typeof mapSpineStatusToMobileStatus>[0] };
          const spineStatus = next.status || 'submitted';
          const mapped = mapSpineStatusToMobileStatus(spineStatus);
          updateReport(lastReport.id, {
            status: mapped,
            timeline: [
              { step: 'Report submitted', at: lastReport.createdAt },
              ...(mapped !== 'submitted' ? [{ step: mapped === 'failed' ? 'Rejected' : mapped === 'dispatched' ? 'Volunteer assigned' : 'Under review', at: Date.now() }] : []),
            ],
          });
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [lastReport?.id]);

  const timelineSteps = useMemo(() => {
    const status = lastReport?.status ?? 'submitted';
    const isRejected = status === 'failed';
    const s0 = true;
    const s1 = status === 'submitted' || status === 'reviewing';
    const s2 = status === 'dispatched';
    const s3 = status === 'resolved';

    return [
      { label: 'Report submitted', icon: <CheckCircle2 size={16} color="#fff" />, color: COLOR.jungle, done: s0 },
      { label: isRejected ? 'Rejected' : 'Under review', icon: <Clock size={16} color={COLOR.gold} />, color: isRejected ? COLOR.coral : COLOR.gold, done: status !== 'submitted' && !isRejected, active: s1 && !isRejected },
      { label: 'Volunteer assigned', icon: <MapPin size={16} color={COLOR.sky} />, color: COLOR.sky, done: status === 'resolved', active: s2 },
      { label: 'Resolved', icon: <Shield size={16} color={COLOR.plum} />, color: COLOR.plum, done: s3, active: false },
    ];
  }, [lastReport?.status]);

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flex: 1, alignItems: 'center', gap: 20 }}>
          <Pop>
            <Bob>
              <Biscuit size={120} mood="happy" />
            </Bob>
          </Pop>

          <Text variant="display-3" align="center">Case opened.{'\n'}Stay tuned.</Text>

          <Card tone="coralSoft" style={{ width: '100%', padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={22} color={COLOR.coral} />
                <Text variant="display-4" color="coralDeep">{lastReport?.id || 'SY-7421'}</Text>
              </View>
              <Pill tone="coral" variant="solid">{(lastReport?.severity || 'urgent').toUpperCase()}</Pill>
            </View>
          </Card>

          <Card style={{ width: '100%', padding: 16 }}>
            {timelineSteps.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: i < 3 ? 16 : 0 }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 10,
                  backgroundColor: step.done ? step.color : step.active ? step.color : COLOR.paper3,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {step.icon}
                </View>
                <Text variant="body" style={{ flex: 1, opacity: step.done || step.active ? 1 : 0.4 }}>{step.label}</Text>
                {step.done && <CheckCircle2 size={16} color={COLOR.jungle} />}
              </View>
            ))}
          </Card>

          <Card tone="jungleSoft" style={{ width: '100%', padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Shield size={20} color={COLOR.jungle} />
              <Text variant="body" color="jungleInk">Your name stays private until you share.</Text>
            </View>
          </Card>

          <Card tone={pendingSync > 0 ? 'goldSoft' : 'paper-2'} style={{ width: '100%', padding: 14 }}>
            <Text variant="body" color={pendingSync > 0 ? 'goldDeep' : 'ink2'}>
              {pendingSync > 0 ? `${pendingSync} update${pendingSync === 1 ? '' : 's'} queued for sync.` : 'Report sync is up to date when the backend is reachable.'}
            </Text>
          </Card>

          <View style={{ width: '100%', gap: 12 }}>
            <Button variant="jungle" size="lg" onPress={() => router.replace('/(tabs)')} rightIcon={<Home size={20} color="#fff" />}>
              Back home
            </Button>
            <Button variant="ghost" size="md" onPress={() => router.replace(`/report/track?id=${lastReport?.id ?? ''}`)}>
              Track report
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
