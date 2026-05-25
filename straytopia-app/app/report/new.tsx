import React, { useState } from 'react';
import { Alert, View, ScrollView, TextInput, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '@/app/components/primitives/ScreenContainer';
import { Text } from '@/app/components/primitives/Text';
import { Card } from '@/app/components/primitives/Card';
import { Pill } from '@/app/components/primitives/Pill';
import { Button } from '@/app/components/primitives/Button';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { useReports, ReportType, ReportSeverity } from '@/app/store/reports';
import { getCareLocation, type CareLocationMetadata } from '@/app/lib/location';
import { COLOR } from '@/app/lib/theme';
import { ArrowLeft, Camera, MapPin } from 'lucide-react-native';

const categories: { key: ReportType; emoji: string; title: string; sub: string; tone: string }[] = [
  { key: 'injured', emoji: '🤕', title: 'Injured', sub: 'Animal needs medical help', tone: 'coral' },
  { key: 'sick', emoji: '🤒', title: 'Sick', sub: 'Appears unwell', tone: 'coral' },
  { key: 'feeding', emoji: '🍖', title: 'Feeding needed', sub: 'Animals need food', tone: 'jungle' },
  { key: 'water', emoji: '💧', title: 'Water needed', sub: 'Water station is dry', tone: 'sky' },
  { key: 'rescue', emoji: '🚑', title: 'Rescue needed', sub: 'Animal in danger', tone: 'coral' },
  { key: 'aggressive', emoji: '⚠️', title: 'Safety concern', sub: 'Aggressive behavior', tone: 'gold' },
  { key: 'abandoned', emoji: '📦', title: 'Abandoned', sub: 'Litter or single animal', tone: 'plum' },
  { key: 'adoption', emoji: '🏠', title: 'Adoption support', sub: 'Needs foster home', tone: 'plum' },
  { key: 'other', emoji: '📋', title: 'Other', sub: 'Something else', tone: 'paper' },
];

const severities: { key: ReportSeverity; label: string; sub: string; color: string }[] = [
  { key: 'urgent', label: 'Urgent', sub: 'Immediate help', color: 'coral' },
  { key: 'today', label: 'Today', sub: 'Within hours', color: 'gold' },
  { key: 'soon', label: 'This week', sub: 'Not critical', color: 'jungle' },
];

export default function ReportNewScreen() {
  const router = useRouter();
  const startDraft = useReports((s) => s.startDraft);
  const patchDraft = useReports((s) => s.patchDraft);
  const [category, setCategory] = useState<ReportType | null>(null);
  const [severity, setSeverity] = useState<ReportSeverity>('today');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('12th Main, Indiranagar');
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [locationMetadata, setLocationMetadata] = useState<CareLocationMetadata | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = category !== null;

  const addPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo permission needed', 'Add a photo when you can. The report can still be sent without one.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.82,
    });
    if (!result.canceled && result.assets[0]) setPhoto(result.assets[0]);
  };

  const captureLocation = async () => {
    const metadata = await getCareLocation();
    setLocationMetadata(metadata);
    if (!metadata) Alert.alert('Location not added', 'You can still send the report with area text only.');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    const metadata = locationMetadata ?? (await getCareLocation());
    startDraft();
    patchDraft({
      type: category,
      severity,
      description,
      location,
      photoUri: photo?.uri ?? null,
      media: photo ? { uri: photo.uri, fileName: photo.fileName, fileSize: photo.fileSize, mimeType: photo.mimeType } : null,
      locationMetadata: metadata,
    });
    router.push('/report/submitted');
  };

  return (
    <ScreenContainer bg="paper" statusBarStyle="dark">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <Button variant="ghost" size="sm" onPress={() => router.back()} style={{ padding: 8 }}>
            <ArrowLeft size={22} color={COLOR.ink2} />
          </Button>
          <View style={{ flex: 1 }} />
          <Text variant="eyebrow">NEW REPORT</Text>
          <View style={{ flex: 1 }} />
          <Pill tone="coral" variant="soft">NEAR</Pill>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Bob amplitude={3}>
            <Biscuit size={60} mood="wow" />
          </Bob>
          <Text variant="body-l">What did you find? I'll get help on the way.</Text>
        </View>

        <Text variant="h" style={{ marginBottom: 10 }}>What's wrong?</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {categories.map((cat) => (
            <Pressable key={cat.key} onPress={() => setCategory(cat.key)} style={{ width: '47%' }}>
              <Card
                tone={category === cat.key ? (cat.tone as any) : 'paper-2'}
                style={{
                  width: '100%', padding: 14,
                  borderColor: category === cat.key ? COLOR[cat.tone as keyof typeof COLOR] : COLOR.hairline,
                  borderWidth: category === cat.key ? 2 : 1,
                }}
              >
                <Text style={{ fontSize: 28, marginBottom: 6 }}>{cat.emoji}</Text>
                <Text variant="h">{cat.title}</Text>
                <Text variant="meta">{cat.sub}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <Text variant="h" style={{ marginBottom: 10 }}>How soon?</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          {severities.map((sev) => (
            <Pressable key={sev.key} onPress={() => setSeverity(sev.key)} style={{ flex: 1 }}>
              <Card
                tone={severity === sev.key ? (sev.color as any) : 'paper-2'}
                style={{ flex: 1, padding: 14, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 20, marginBottom: 4 }}>
                  {sev.key === 'urgent' ? '🔴' : sev.key === 'today' ? '🟡' : '🟢'}
                </Text>
                <Text variant="h">{sev.label}</Text>
                <Text variant="meta">{sev.sub}</Text>
              </Card>
            </Pressable>
          ))}
        </View>

        <Card style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note (optional)"
            placeholderTextColor={COLOR.muted}
            multiline
            numberOfLines={3}
            maxLength={280}
            style={{ fontFamily: 'Nunito', fontSize: 15, padding: 16, color: COLOR.ink, minHeight: 80 }}
          />
        </Card>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
          <Button variant="paper" size="md" onPress={addPhoto} leftIcon={<Camera size={18} color={COLOR.ink} />} style={{ flex: 1 }}>
            {photo ? 'Photo added' : 'Add photo'}
          </Button>
          <Button variant="paper" size="md" onPress={captureLocation} leftIcon={<MapPin size={18} color={COLOR.ink} />} style={{ flex: 1 }}>
            {locationMetadata ? 'Location added' : 'Add GPS'}
          </Button>
        </View>

        <Card tone="paper-2" style={{ marginBottom: 20, padding: 14 }}>
          <Text variant="body">
            {locationMetadata
              ? `Exact location saved for ops only. Accuracy about ${locationMetadata.location_accuracy_meters ?? 'unknown'}m.`
              : 'Area text is enough. GPS is optional and only shown to ops.'}
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Text variant="meta">OPS REVIEW QUEUE</Text>
          <Button variant="coral" size="md" onPress={handleSubmit} disabled={!canSubmit || submitting} loading={submitting}>
            Send for help
          </Button>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
