import React, { useState } from 'react';
import { View, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { ChevronRight, User } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const setName = useUser((s) => s.setName);
  const [name, setNameInput] = useState('');
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step === 0) {
      if (name.trim().length < 2) return;
      setName(name.trim());
      setStep(1);
    } else if (step === 1) {
      router.push('/register/phone');
    }
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 }}>
        <View style={{ flex: 1, gap: 24 }}>
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: COLOR.jungle }} />
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: step >= 1 ? COLOR.jungle : COLOR.paper3 }} />
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: COLOR.paper3 }} />
          </View>

          {step === 0 && (
            <>
              <Text variant="display-3">What should we call you?</Text>
              <Text variant="body-l">This is how you'll appear on the leaderboard.</Text>
              <Card style={{ padding: 0, overflow: 'hidden' }}>
                <TextInput
                  value={name}
                  onChangeText={setNameInput}
                  placeholder="Your name"
                  placeholderTextColor={COLOR.muted}
                  style={{
                    fontFamily: 'Fredoka', fontSize: 26, fontWeight: '600',
                    padding: 20, color: COLOR.ink,
                  }}
                  autoFocus
                  returnKeyType="next"
                  onSubmitEditing={handleNext}
                />
              </Card>
              <Button variant="jungle" size="lg" onPress={handleNext} disabled={name.trim().length < 2}>
                Continue
              </Button>
            </>
          )}

          {step === 1 && (
            <>
              <Text variant="display-3">Choose your avatar</Text>
              <Text variant="body-l">Pick how you want to appear. You can change this later.</Text>
              <Button variant="jungle" size="lg" onPress={handleNext}>
                Pick Avatar
              </Button>
            </>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
