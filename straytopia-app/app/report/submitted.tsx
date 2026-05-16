import React from 'react';
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
import { COLOR } from '@/app/lib/theme';
import { AlertTriangle, CheckCircle2, Clock, MapPin, Shield, Home } from 'lucide-react-native';

const timelineSteps = [
  { label: 'Report submitted', icon: <CheckCircle2 size={16} color="#fff" />, color: COLOR.jungle, done: true },
  { label: 'Under review', icon: <Clock size={16} color={COLOR.gold} />, color: COLOR.gold, done: false, active: true },
  { label: 'Volunteer assigned', icon: <MapPin size={16} color={COLOR.sky} />, color: COLOR.sky, done: false },
  { label: 'Resolved', icon: <Shield size={16} color={COLOR.plum} />, color: COLOR.plum, done: false },
];

export default function ReportSubmittedScreen() {
  const router = useRouter();
  const reports = useReports((s) => s.reports);
  const lastReport = reports[0];

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
              <Pill tone="coral" variant="solid">URGENT</Pill>
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

          <View style={{ width: '100%', gap: 12 }}>
            <Button variant="jungle" size="lg" onPress={() => router.replace('/(tabs)')} rightIcon={<Home size={20} color="#fff" />}>
              Back home
            </Button>
            <Button variant="ghost" size="md" onPress={() => router.replace('/(tabs)')}>
              Track report
            </Button>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
