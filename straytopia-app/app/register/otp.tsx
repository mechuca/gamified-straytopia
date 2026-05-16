import React, { useState, useRef } from 'react';
import { View, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { useUser } from '@/app/store/user';
import { useApp } from '@/app/store/app';
import { COLOR } from '@/app/lib/theme';
import { Shield, ArrowLeft } from 'lucide-react-native';

export default function OTPScreen() {
  const router = useRouter();
  const setPhoneVerified = useUser((s) => s.setPhoneVerified);
  const show = useApp((s) => s.show);
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = () => {
    if (otp !== '123456') {
      Alert.alert('Wrong code', 'Use 123456 for the demo.');
      return;
    }
    setVerifying(true);
    setTimeout(() => {
      setPhoneVerified(true);
      show('Phone verified!', 'success');
      router.push('/register/avatar');
    }, 1000);
  };

  const handleResend = () => {
    show('OTP resent. Use 123456.', 'info');
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
        <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8, marginBottom: 24, alignSelf: 'flex-start' }}>
          <ArrowLeft size={22} color={COLOR.ink2} />
        </Button>

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={{ width: 80, height: 80, borderRadius: 24, backgroundColor: COLOR.jungleSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Shield size={40} color={COLOR.jungle} />
          </View>
          <Text variant="display-3" align="center">Enter the code</Text>
          <Text variant="body-l" align="center" style={{ marginTop: 8 }}>We sent a 6-digit code to your phone.</Text>
        </View>

        <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={setOtp}
            placeholder="123456"
            placeholderTextColor={COLOR.muted}
            keyboardType="number-pad"
            maxLength={6}
            style={{
              fontFamily: 'JetBrainsMono', fontSize: 36, fontWeight: '700',
              textAlign: 'center', padding: 24, color: COLOR.ink, letterSpacing: 8,
            }}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleVerify}
          />
        </Card>

        <Text variant="meta" align="center" style={{ marginBottom: 24 }}>
          Demo OTP: 123456
        </Text>

        <Button variant="jungle" size="lg" onPress={handleVerify} loading={verifying} disabled={otp.length < 6}>
          Verify
        </Button>
        <Button variant="ghost" size="md" onPress={handleResend} style={{ marginTop: 8 }}>
          Resend code
        </Button>
      </View>
    </ScreenContainer>
  );
}
