import React from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';

export default function ActionScreen() {
  return <Redirect href="/mission/action" />;
}
