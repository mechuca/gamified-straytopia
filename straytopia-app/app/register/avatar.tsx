import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { Avatar } from '@/app/components/primitives/Avatar';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, Camera } from 'lucide-react-native';

const avatarOptions = [
  { letter: 'A', tone: 'coral' as const },
  { letter: 'B', tone: 'sky' as const },
  { letter: 'C', tone: 'jungle' as const },
  { letter: 'D', tone: 'plum' as const },
  { letter: 'E', tone: 'gold' as const },
  { letter: 'F', tone: 'coral' as const },
  { letter: '🐾', tone: 'jungle' as const },
  { letter: '🐕', tone: 'sky' as const },
  { letter: '🐈', tone: 'plum' as const },
];

export default function AvatarScreen() {
  const router = useRouter();
  const setAvatar = useUser((s) => s.setAvatar);
  const [selected, setSelected] = useState(2);

  const handleContinue = () => {
    const av = avatarOptions[selected];
    setAvatar(av.letter, av.tone);
    router.push('/register/privacy');
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8, marginBottom: 24, alignSelf: 'flex-start' }}>
          <ArrowLeft size={22} color={COLOR.ink2} />
        </Button>

        <Text variant="display-3" style={{ marginBottom: 8 }}>Pick your avatar</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>Choose how you want to appear. You can change this later.</Text>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <Avatar name={avatarOptions[selected].letter} size={100} tone={avatarOptions[selected].tone} />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginBottom: 24 }}>
          {avatarOptions.map((av, i) => (
            <View key={i} style={{
              width: 72, height: 72, borderRadius: 20,
              backgroundColor: selected === i ? COLOR[av.tone] + '33' : COLOR.paper2,
              borderWidth: 2.5,
              borderColor: selected === i ? COLOR[av.tone] : COLOR.hairline,
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Button variant="ghost" size="sm" onPress={() => setSelected(i)} style={{ padding: 0 }}>
                <Text variant="body" style={{ fontSize: 28 }}>{av.letter}</Text>
              </Button>
            </View>
          ))}
        </View>

        <Button variant="jungle" size="lg" onPress={handleContinue}>
          Continue
        </Button>
      </View>
    </ScreenContainer>
  );
}
