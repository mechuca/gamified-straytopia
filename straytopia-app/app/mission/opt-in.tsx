import React from 'react';
import { View, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from '@/app/components/primitives/Text';
import { Button } from '@/app/components/primitives/Button';
import { Biscuit } from '@/app/components/mascot/Biscuit';
import { Bob } from '@/app/components/motion/Bob';
import { useUser } from '@/app/store/user';
import { COLOR } from '@/app/lib/theme';
import { Trophy, Shield, Award, Users, Eye, X } from 'lucide-react-native';

export default function LeaderboardOptInScreen() {
  const router = useRouter();
  const setLeaderboardOptedIn = useUser((s) => s.setLeaderboardOptedIn);
  const setLeaderboardChoiceMade = useUser((s) => s.setLeaderboardChoiceMade);

  const handleJoin = () => {
    setLeaderboardOptedIn(true);
    setLeaderboardChoiceMade();
    router.push('/register');
  };

  const handlePrivate = () => {
    setLeaderboardOptedIn(false);
    setLeaderboardChoiceMade();
    router.push('/mission/task');
  };

  return (
    <Modal transparent visible animationType="fade">
      <TouchableWithoutFeedback onPress={handlePrivate}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' }}>
          <TouchableWithoutFeedback>
            <View style={{
              backgroundColor: COLOR.paper,
              borderTopLeftRadius: 32, borderTopRightRadius: 32,
              padding: 24, paddingBottom: 40,
            }}>
              <View style={{ width: 48, height: 5, borderRadius: 3, backgroundColor: COLOR.hairline2, alignSelf: 'center', marginBottom: 20 }} />

              <View style={{ alignItems: 'center', marginBottom: 20 }}>
                <Bob amplitude={4}>
                  <Biscuit size={100} mood="happy" />
                </Bob>
              </View>

              <Text variant="display-3" align="center" style={{ marginBottom: 8 }}>
                Want your care to inspire others?
              </Text>
              <Text variant="body-l" align="center" style={{ marginBottom: 24 }}>
                Join the local leaderboard, track your impact, unlock badges, and motivate more people to help animals near you.
              </Text>

              <View style={{ gap: 12, marginBottom: 24 }}>
                {[
                  { icon: <Trophy size={20} color={COLOR.gold} />, text: 'Get recognized for verified help' },
                  { icon: <Award size={20} color={COLOR.jungle} />, text: 'Track your local impact' },
                  { icon: <Shield size={20} color={COLOR.sky} />, text: 'Unlock badges' },
                  { icon: <Users size={20} color={COLOR.coral} />, text: 'See your area rank' },
                  { icon: <Eye size={20} color={COLOR.plum} />, text: 'Keep privacy controls' },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {item.icon}
                    <Text variant="body">{item.text}</Text>
                  </View>
                ))}
              </View>

              <Text variant="meta" align="center" style={{ marginBottom: 16 }}>
                Your phone number is never shown publicly.
              </Text>

              <View style={{ gap: 12 }}>
                <Button variant="jungle" size="lg" onPress={handleJoin}>
                  Join Leaderboard
                </Button>
                <Button variant="ghost" size="md" onPress={handlePrivate}>
                  Continue Privately
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
