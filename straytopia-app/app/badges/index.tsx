import React, { useState } from 'react';
import { View, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { useBadges } from '@/app/store/badges';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, X, Calendar, Award } from 'lucide-react-native';

export default function BadgesScreen() {
  const router = useRouter();
  const badges = useBadges((s) => s.badges);
  const [selectedBadge, setSelectedBadge] = useState<typeof badges[0] | null>(null);

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Text variant="title">Badges</Text>
          <View style={{ flex: 1 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {badges.map((badge) => (
              <View key={badge.id} style={{ width: '30%' }}>
                <Button variant="ghost" size="sm" onPress={() => badge.earned ? setSelectedBadge(badge) : null} style={{ padding: 0 }}>
                  <Card style={{
                    alignItems: 'center', padding: 16, gap: 8,
                    opacity: badge.earned ? 1 : 0.55,
                    borderColor: badge.earned ? COLOR[badge.color as keyof typeof COLOR] : COLOR.hairline,
                    borderWidth: badge.earned ? 2 : 1,
                    borderBottomWidth: badge.earned ? 4 : 1,
                    borderBottomColor: badge.earned ? COLOR[badge.color as keyof typeof COLOR] : COLOR.hairline,
                  }}>
                    <Text variant="body" style={{ fontSize: 36 }}>{badge.icon}</Text>
                    <Text variant="meta" style={{ fontSize: 10, textAlign: 'center' }}>{badge.name}</Text>
                    {badge.earned ? (
                      <Pill tone={badge.color as any} variant="soft" style={{ marginTop: 4 }}>
                        Earned
                      </Pill>
                    ) : (
                      <Text variant="meta" style={{ fontSize: 9 }}>{badge.progress}/{badge.maxProgress}</Text>
                    )}
                  </Card>
                </Button>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Badge Detail Modal */}
      <Modal transparent visible={!!selectedBadge} animationType="fade">
        <TouchableWithoutFeedback onPress={() => setSelectedBadge(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableWithoutFeedback>
              <Card style={{ width: '85%', padding: 24, alignItems: 'center' }}>
                {selectedBadge && (
                  <>
                    <Text style={{ fontSize: 64, marginBottom: 12 }}>{selectedBadge.icon}</Text>
                    <Text variant="display-2">{selectedBadge.name}</Text>
                    <Text variant="body-l" align="center" style={{ marginTop: 8 }}>{selectedBadge.description}</Text>
                    <Card tone="paper-2" style={{ width: '100%', marginTop: 16, padding: 12 }}>
                      <Text variant="meta">Criteria: {selectedBadge.criteria}</Text>
                      {selectedBadge.earned && selectedBadge.earnedAt && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                          <Calendar size={14} color={COLOR.jungle} />
                          <Text variant="meta" color="jungle">Earned {new Date(selectedBadge.earnedAt).toLocaleDateString()}</Text>
                        </View>
                      )}
                    </Card>
                    <Button variant="jungle" size="md" onPress={() => setSelectedBadge(null)} style={{ marginTop: 16 }}>
                      Close
                    </Button>
                  </>
                )}
              </Card>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScreenContainer>
  );
}
