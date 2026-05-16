import React from 'react';
import { View, Text } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { COLOR } from '@/app/lib/theme';
import { Home, BookOpen, Trophy, User, Plus } from 'lucide-react-native';

export default function TabsLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 14, right: 14, bottom: 22,
          height: 76,
          backgroundColor: COLOR.surface,
          borderRadius: 28,
          borderWidth: 2.5,
          borderColor: COLOR.hairline,
          borderBottomWidth: 4,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: COLOR.jungleDeep,
        tabBarInactiveTintColor: COLOR.muted,
        tabBarLabelStyle: {
          fontFamily: 'Nunito',
          fontWeight: '800',
          fontSize: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.06,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Quest',
          tabBarIcon: ({ color, focused }) => (
            <Home size={26} color={color} fill={focused ? color : 'none'} />
          ),
        }}
      />
      <Tabs.Screen
        name="stories"
        options={{
          title: 'Stories',
          tabBarIcon: ({ color }) => <BookOpen size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="action"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={{
              width: 64, height: 64, borderRadius: 22,
              backgroundColor: COLOR.coral,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 3, borderColor: '#fff',
              shadowColor: COLOR.coralDeep,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 1,
              shadowRadius: 0,
              marginTop: -28,
            }}>
              <Plus size={32} color="#fff" />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/mission/action');
          },
        }}
      />
      <Tabs.Screen
        name="league"
        options={{
          title: 'League',
          tabBarIcon: ({ color, focused }) => (
            <Trophy size={26} color={color} fill={focused ? color : 'none'} />
          ),
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          title: 'You',
          tabBarIcon: ({ color, focused }) => (
            <User size={26} color={color} fill={focused ? color : 'none'} />
          ),
        }}
      />
    </Tabs>
  );
}
