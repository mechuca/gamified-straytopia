import { Stack } from 'expo-router';

export default function MissionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="action" />
      <Stack.Screen name="detail" />
      <Stack.Screen name="accept-confirm" />
      <Stack.Screen name="opt-in" />
      <Stack.Screen name="task" />
      <Stack.Screen name="proof" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="success" />
    </Stack>
  );
}
