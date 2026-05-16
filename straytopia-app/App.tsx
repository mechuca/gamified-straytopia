import 'react-native-gesture-handler';
import { ExpoRoot } from 'expo-router';

// @ts-ignore
const ctx = require.context('./app');

export default function App() {
  return <ExpoRoot context={ctx} />;
}
