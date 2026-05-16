import React from 'react';
import { View, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/app/components/primitives/Text';
import { Button } from '@/app/components/primitives/Button';
import { COLOR } from '@/app/lib/theme';
import { Camera, AlertTriangle, X } from 'lucide-react-native';

export default function MissionActionScreen() {
  const router = useRouter();

  return (
    <Modal transparent visible animationType="fade">
      <TouchableWithoutFeedback onPress={() => router.back()}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: COLOR.paper,
              borderTopLeftRadius: 32, borderTopRightRadius: 32,
              padding: 24, paddingBottom: 40,
            }}>
              <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: COLOR.hairline2, alignSelf: 'center', marginBottom: 20 }} />
              <Text variant="title" style={{ marginBottom: 20, textAlign: 'center' }}>Quick Action</Text>
              <View style={{ gap: 12 }}>
                <Button variant="jungle" size="lg" leftIcon={<Camera size={22} color="#fff" />} onPress={() => router.push('/mission/task')}>
                  Submit a Feed Proof
                </Button>
                <Button variant="coral" size="lg" leftIcon={<AlertTriangle size={22} color="#fff" />} onPress={() => router.push('/report/new')}>
                  File a Report
                </Button>
                <Button variant="ghost" size="md" onPress={() => router.back()}>
                  Cancel
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
