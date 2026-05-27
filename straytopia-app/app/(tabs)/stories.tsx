import React from 'react';
import { View, ScrollView } from 'react-native';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { BiscuitMini } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { useVerifiedImpact } from '@/app/lib/useVerifiedImpact';
import { COLOR } from '@/app/lib/theme';
import { BookOpen, CheckCircle2 } from 'lucide-react-native';

export default function StoriesScreen() {
  const { impact, loading } = useVerifiedImpact();
  const stories = impact.stories;

  return (
    <ScreenContainer bg="paper" tabBar statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <View>
            <Text variant="eyebrow">STORIES</Text>
            <Text variant="display-3">You did this.</Text>
          </View>
          <Bob amplitude={4}>
            <BiscuitMini size={52} />
          </Bob>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pill tone="jungle" variant="solid">For you</Pill>
            <Pill tone="paper">Local</Pill>
            <Pill tone="paper">Recoveries</Pill>
            <Pill tone="paper">Adoptions</Pill>
          </View>
        </ScrollView>

        <Card tone={stories.length > 0 ? 'jungleSoft' : 'paper-2'} style={{ marginBottom: 16, padding: 14 }}>
          <Text variant="meta" align="center">
            {stories.length > 0 ? 'Only ops-verified care events appear here.' : loading ? 'Loading verified care events.' : 'No ops-verified story events yet. Complete a task and wait for proof review.'}
          </Text>
        </Card>

        {stories.map((story, i) => (
          <RiseIn key={story.id} delay={i * 100}>
            <Card style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              <View style={{ height: 160, backgroundColor: COLOR.jungleSoft, alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={44} color={COLOR.jungle} />
              </View>
              <View style={{ padding: 18 }}>
                <Pill tone="jungle" variant="soft">{story.badge}</Pill>
                <Text variant="h" style={{ marginTop: 10 }}>{story.title}</Text>
                <Text variant="body" style={{ marginTop: 6 }}>{story.body}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLOR.hairline, borderStyle: 'dashed' }}>
                  <CheckCircle2 size={16} color={COLOR.jungle} />
                  <Text variant="meta">Verified {new Date(story.occurred_at).toLocaleDateString()}</Text>
                </View>
              </View>
            </Card>
          </RiseIn>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
