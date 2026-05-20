import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'straytopia:device_id';

function uuid() {
  // RN/Web: crypto.randomUUID exists in modern runtimes.
  const anyCrypto = globalThis.crypto as any;
  if (anyCrypto?.randomUUID) return anyCrypto.randomUUID();
  // Fallback: non-crypto, but stable enough for prototype identity.
  return `dev_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export async function getDeviceId() {
  const existing = await AsyncStorage.getItem(KEY);
  if (existing) return existing;
  const id = uuid();
  await AsyncStorage.setItem(KEY, id);
  return id;
}
