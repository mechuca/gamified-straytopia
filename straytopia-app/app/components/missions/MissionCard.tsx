import React from 'react';
import { View } from 'react-native';
import { Card } from '@/app/components/primitives/Card';
import { Text } from '@/app/components/primitives/Text';
import { Pill } from '@/app/components/primitives/Pill';
import { COLOR } from '@/app/lib/theme';
import { Flame, Droplets, AlertTriangle, Stethoscope, Clock } from 'lucide-react-native';

const missionIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  feeding: { icon: <Flame size={28} color={COLOR.jungle} />, color: COLOR.jungleSoft },
  water: { icon: <Droplets size={28} color={COLOR.sky} />, color: COLOR.skySoft },
  rescue: { icon: <AlertTriangle size={28} color={COLOR.coral} />, color: COLOR.coralSoft },
  medical: { icon: <Stethoscope size={28} color={COLOR.plum} />, color: COLOR.plumSoft },
  urgent: { icon: <Clock size={28} color={COLOR.coral} />, color: COLOR.coralSoft },
};

const urgencyColors: Record<string, string> = {
  low: COLOR.jungle,
  medium: COLOR.gold,
  high: COLOR.coral,
  critical: COLOR.coralDeep,
};

const urgencyLabels: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Urgent',
};

interface MissionCardProps {
  id: string;
  type: string;
  title: string;
  location: string;
  distance: string;
  estimatedTime: number;
  urgency: string;
  impactPoints: number;
  onPress: () => void;
}

export function MissionCard({ title, location, distance, estimatedTime, urgency, impactPoints, type, onPress }: MissionCardProps) {
  const iconData = missionIcons[type] || missionIcons.feeding;

  return (
    <Card style={{ marginBottom: 12, padding: 16 }}>
      <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={{
          width: 56, height: 56, borderRadius: 18,
          backgroundColor: iconData.color,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {iconData.icon}
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="h" style={{ marginBottom: 4 }}>{title}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Text variant="meta">{location}</Text>
            <Text variant="meta">·</Text>
            <Text variant="meta">{distance}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Pill tone={urgency === 'critical' ? 'coral' : urgency === 'high' ? 'gold' : 'jungle'} variant="soft">
              {urgencyLabels[urgency]}
            </Pill>
            <Text variant="meta">{estimatedTime} min</Text>
            <Text variant="meta" style={{ color: COLOR.goldInk }}>+{impactPoints} IP</Text>
          </View>
        </View>
      </View>
    </Card>
  );
}
