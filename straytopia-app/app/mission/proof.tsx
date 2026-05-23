import React, { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Button } from '@/app/components/primitives/Button';
import { Pill } from '@/app/components/primitives/Pill';
import { useMissions } from '@/app/store/missions';
import { usePoints } from '@/app/store/points';
import { useBadges } from '@/app/store/badges';
import { COLOR } from '@/app/lib/theme';
import { insertMissionProof } from '@/app/lib/spineSync';
import { Camera, Image, MapPin, Clock, ArrowLeft, Loader2 } from 'lucide-react-native';

export default function ProofSubmissionScreen() {
  const router = useRouter();
  const activeMissionId = useMissions((s) => s.activeMissionId);
  const mission = useMissions((s) => s.missions.find((m) => m.id === activeMissionId));
  const submitProof = useMissions((s) => s.submitProof);
  const awardPoints = usePoints((s) => s.award);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!mission) {
    return <ScreenContainer bg="paper"><View style={{ flex: 1 }}><Text>No mission</Text></View></ScreenContainer>;
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!photoUri) {
      Alert.alert('Proof required', 'Please take or upload a photo to submit proof.');
      return;
    }
    setSubmitting(true);
    void insertMissionProof({ missionId: mission.id, photoUri, note });
    submitProof(mission.id);
    setTimeout(() => {
      router.push('/mission/verify');
    }, 500);
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Pill tone="gold" variant="soft">+{mission.impactPoints} IP</Pill>
        </View>

        <Text variant="display-3" style={{ marginBottom: 8 }}>Submit Proof</Text>
        <Text variant="body-l" style={{ marginBottom: 24 }}>{mission.proofRequired}</Text>

        {/* Photo Area */}
        <Card style={{ marginBottom: 16, padding: 0, overflow: 'hidden', minHeight: 240 }}>
          {photoUri ? (
            <View style={{ height: 240, backgroundColor: COLOR.paper3, alignItems: 'center', justifyContent: 'center' }}>
              <Text variant="h">Photo captured ✓</Text>
              <Text variant="meta" style={{ marginTop: 4 }}>Tap to change</Text>
            </View>
          ) : (
            <View style={{ height: 240, backgroundColor: COLOR.paper3, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <Camera size={48} color={COLOR.muted} />
              <Text variant="body">Tap to add proof photo</Text>
            </View>
          )}
        </Card>

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
          <Button variant="paper" size="md" leftIcon={<Camera size={20} color={COLOR.ink} />} onPress={pickImage} style={{ flex: 1 }}>
            Upload Photo
          </Button>
        </View>

        {/* Location + Time */}
        <Card tone="paper-2" style={{ marginBottom: 20, padding: 14 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <MapPin size={18} color={COLOR.gold} />
            <Text variant="body">Area context only. GPS proof is not captured yet.</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Clock size={18} color={COLOR.gold} />
            <Text variant="body">Timestamp: {new Date().toLocaleTimeString()}</Text>
          </View>
        </Card>

        <Button variant="jungle" size="lg" onPress={handleSubmit} loading={submitting} disabled={!photoUri}>
          Submit Proof
        </Button>
      </View>
    </ScreenContainer>
  );
}
