import React, { useState } from 'react';
import { View, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { Phone, ArrowLeft } from 'lucide-react-native';

export default function PhoneScreen() {
  const router = useRouter();
  const setPhone = useUser((s) => s.setPhone);
  const [phone, setPhoneInput] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (phone.length < 7) {
      Alert.alert('Invalid phone', 'Enter a valid phone number.');
      return;
    }
    setSending(true);
    setPhone(phone);
    setTimeout(() => {
      setSending(false);
      router.push('/register/otp');
    }, 1000);
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8, marginBottom: 24, alignSelf: 'flex-start' }}>
          <ArrowLeft size={22} color={COLOR.ink2} />
        </Button>

        <Text variant="display-3" style={{ marginBottom: 8 }}>Your phone number</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>We'll send a verification code. Your number is never shown publicly.</Text>

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 20, gap: 12 }}>
            <Phone size={22} color={COLOR.muted} />
            <TextInput
              value={phone}
              onChangeText={setPhoneInput}
              placeholder="+91 98765 43210"
              placeholderTextColor={COLOR.muted}
              keyboardType="phone-pad"
              style={{ fontFamily: 'Fredoka', fontSize: 22, fontWeight: '600', color: COLOR.ink, flex: 1 }}
              autoFocus
            />
          </View>
        </Card>

        <Button variant="jungle" size="lg" onPress={handleSend} loading={sending}>
          Send OTP
        </Button>
      </View>
    </ScreenContainer>
  );
}
