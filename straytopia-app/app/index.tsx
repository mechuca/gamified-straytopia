import { Redirect } from 'expo-router';
import { useApp } from '@/app/store/app';

export default function Index() {
  const onboardingComplete = useApp((s) => s.onboardingComplete);

  if (onboardingComplete) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding/location" />;
}
