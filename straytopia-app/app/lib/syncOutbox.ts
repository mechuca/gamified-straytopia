import AsyncStorage from '@react-native-async-storage/async-storage';

const SYNC_OUTBOX_KEY = 'straytopia-sync-outbox';

export type SyncOperation = {
  id: string;
  type: 'report' | 'mission_task' | 'mission_proof';
  payload: Record<string, unknown>;
  attempts: number;
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
};

async function readOutbox() {
  const raw = await AsyncStorage.getItem(SYNC_OUTBOX_KEY);
  if (!raw) return [] as SyncOperation[];
  try {
    return JSON.parse(raw) as SyncOperation[];
  } catch {
    return [] as SyncOperation[];
  }
}

async function writeOutbox(items: SyncOperation[]) {
  await AsyncStorage.setItem(SYNC_OUTBOX_KEY, JSON.stringify(items));
}

export async function enqueueSyncOperation(type: SyncOperation['type'], payload: Record<string, unknown>, error?: unknown) {
  const items = await readOutbox();
  const id = `${type}:${String(payload.id ?? payload.missionId ?? Date.now())}`;
  const now = Date.now();
  const next: SyncOperation = {
    id,
    type,
    payload,
    attempts: 0,
    lastError: error instanceof Error ? error.message : error ? String(error) : null,
    createdAt: items.find((item) => item.id === id)?.createdAt ?? now,
    updatedAt: now,
  };
  await writeOutbox([next, ...items.filter((item) => item.id !== id)].slice(0, 50));
}

export async function getSyncOutbox() {
  return readOutbox();
}

export async function getSyncOutboxCount() {
  const items = await readOutbox();
  return items.length;
}

export async function drainSyncOutbox(handler: (operation: SyncOperation) => Promise<void>) {
  const items = await readOutbox();
  const remaining: SyncOperation[] = [];

  for (const item of items) {
    try {
      await handler(item);
    } catch (error) {
      remaining.push({
        ...item,
        attempts: item.attempts + 1,
        lastError: error instanceof Error ? error.message : String(error),
        updatedAt: Date.now(),
      });
    }
  }

  await writeOutbox(remaining.slice(0, 50));
  return remaining.length;
}
