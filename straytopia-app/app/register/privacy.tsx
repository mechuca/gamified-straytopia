import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, Eye, User, Shield, EyeOff } from 'lucide-react-native';

const privacyOptions = [
  { key: 'name' as const, icon: <User size={22} color={COLOR.jungle} />, title: 'First name only', desc: 'People see your first name' },
  { key: 'name-avatar' as const, icon: <Eye size={22} color={COLOR.sky} />, title: 'Name + avatar', desc: 'Your name and avatar are visible' },
  { key: 'avatar-initials' as const, icon: <Shield size={22} color={COLOR.plum} />, title: 'Avatar + initials', desc: 'Only your avatar and initials show' },
  { key: 'private' as const, icon: <EyeOff size={22} color={COLOR.muted} />, title: 'Stay private', desc: 'Your impact counts but you stay hidden' },
];

export default function PrivacyScreen() {
  const router = useRouter();
  const setPrivacyMode = useUser((s) => s.setPrivacyMode);
  const setJoinedAt = useUser((s) => s.setJoinedAt);

  const handleSelect = (mode: typeof privacyOptions[number]['key']) => {
    setPrivacyMode(mode);
    setJoinedAt(Date.now());
    router.push('/mission/task');
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8, marginBottom: 24, alignSelf: 'flex-start' }}>
          <ArrowLeft size={22} color={COLOR.ink2} />
        </Button>

        <Text variant="display-3" style={{ marginBottom: 8 }}>How do you want to appear?</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>Your phone number, age, and gender are never shown publicly.</Text>

        <View style={{ gap: 12 }}>
          {privacyOptions.map((opt, i) => (
            <Card key={opt.key} style={{ padding: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View style={{
                  width: 48, height: 48, borderRadius: 16,
                  backgroundColor: COLOR.paper2,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  {opt.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="h">{opt.title}</Text>
                  <Text variant="meta">{opt.desc}</Text>
                </View>
              </View>
              <Button variant="ghost" size="sm" onPress={() => handleSelect(opt.key)} style={{ marginTop: 12, alignSelf: 'flex-end' }}>
                Choose
              </Button>
            </Card>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}
