import * as Location from 'expo-location';

export type CareLocationMetadata = {
  latitude: number;
  longitude: number;
  location_accuracy_meters: number | null;
  location_captured_at: string;
  location_privacy: 'exact_ops_only' | 'area' | 'public_safe';
};

export async function getCareLocation(): Promise<CareLocationMetadata | null> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return null;

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      location_accuracy_meters: location.coords.accuracy == null ? null : Math.round(location.coords.accuracy),
      location_captured_at: new Date(location.timestamp).toISOString(),
      location_privacy: 'exact_ops_only',
    };
  } catch {
    return null;
  }
}
