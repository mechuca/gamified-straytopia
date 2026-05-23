import React from 'react';
import { View, ScrollView } from 'react-native';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { BiscuitMini } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { RiseIn } from '@/app/components/motion/RiseIn';
import { Avatar } from '@/app/components/primitives/Avatar';
import { COLOR } from '@/app/lib/theme';
import { BookOpen, Heart } from 'lucide-react-native';

const stories = [
  { id: 's1', type: 'rescue', title: 'Pluto found his forever home', body: 'After 3 months of care, the limping tan dog from the bakery was adopted by a family on 100 Feet Road.', helpers: ['A', 'R', 'S'] as string[], hearts: 47, badge: 'RESCUE STORY', badgeTone: 'plum' as const },
  { id: 's2', type: 'milestone', title: '5,000 meals served in Indiranagar', body: 'The community came together and fed over 5,000 street animals this month.', helpers: [] as string[], badge: 'MILESTONE', badgeTone: 'gold' as const },
  { id: 's3', type: 'before-after', title: 'Mowgli gained 2kg in 30 days', body: 'From severely underweight to a healthy, happy pup.', helpers: [] as string[], badge: '30 DAY UPDATE', badgeTone: 'plum' as const },
];

export default function StoriesScreen() {
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

        <Card tone="paper-2" style={{ marginBottom: 16, padding: 14 }}>
          <Text variant="meta" align="center">
            Demo stories only. Ops-published rescue updates and story moderation are not connected yet.
          </Text>
        </Card>

        {stories.map((story, i) => (
          <RiseIn key={story.id} delay={i * 100}>
            <Card style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
              {story.type === 'milestone' ? (
                <View style={{ backgroundColor: COLOR.goldSoft, padding: 20 }}>
                  <Pill tone="gold" variant="solid">{story.badge}</Pill>
                  <Text variant="display-4" color="goldInk" style={{ marginTop: 12 }}>{story.title}</Text>
                  <Text variant="body" color="goldInk" style={{ marginTop: 8 }}>{story.body}</Text>
                </View>
              ) : (
                <>
                  <View style={{
                    height: 180, backgroundColor: story.type === 'rescue' ? COLOR.plumSoft : COLOR.skySoft,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen size={48} color={story.type === 'rescue' ? COLOR.plum : COLOR.sky} />
                  </View>
                  <View style={{ padding: 18 }}>
                    <Pill tone={story.badgeTone} variant="soft">{story.badge}</Pill>
                    <Text variant="h" style={{ marginTop: 10 }}>{story.title}</Text>
                    <Text variant="body" style={{ marginTop: 6 }}>{story.body}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: COLOR.hairline, borderStyle: 'dashed' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={{ flexDirection: 'row' }}>
                          {story.helpers.map((h, j) => (
                            <View key={j} style={{ marginLeft: j > 0 ? -8 : 0 }}>
                              <Avatar name={h} size={32} tone={j === 0 ? 'jungle' : j === 1 ? 'sky' : 'coral'} />
                            </View>
                          ))}
                        </View>
                        <Text variant="meta">+{story.helpers.length} helpers</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Heart size={16} color={COLOR.coral} fill={COLOR.coral} />
                        <Text variant="meta">{story.hearts}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}
            </Card>
          </RiseIn>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
