import React from 'react';
import { View } from 'react-native';
import { Card } from '@/app/components/primitives/Card';
import { Text } from '@/app/components/primitives/Text';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { Button } from '@/app/components/primitives/Button';
import { COLOR } from '@/app/lib/theme';

interface EmptyStateProps {
  mascot?: 'happy' | 'sleepy' | 'wow';
  title: string;
  body: string;
  primaryAction?: { label: string; variant: 'jungle' | 'coral' | 'gold' | 'sky' | 'plum' | 'ink' | 'paper' | 'ghost'; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
}

export function EmptyState({ mascot = 'happy', title, body, primaryAction, secondaryAction }: EmptyStateProps) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 24 }}>
      <Bob>
        <Biscuit size={140} mood={mascot} />
      </Bob>
      <Text variant="display-3" align="center">{title}</Text>
      <Text variant="body-l" align="center">{body}</Text>
      {primaryAction && (
        <Button variant={primaryAction.variant} size="lg" onPress={primaryAction.onPress}>
          {primaryAction.label}
        </Button>
      )}
      {secondaryAction && (
        <Button variant="ghost" onPress={secondaryAction.onPress}>
          {secondaryAction.label}
        </Button>
      )}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <Card style={{ height: 80, marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: COLOR.paper3 }} />
        <View style={{ flex: 1, gap: 8 }}>
          <View style={{ height: 14, borderRadius: 7, backgroundColor: COLOR.paper3, width: '70%' }} />
          <View style={{ height: 10, borderRadius: 5, backgroundColor: COLOR.paper3, width: '50%' }} />
        </View>
      </View>
    </Card>
  );
}
