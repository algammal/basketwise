import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { Platform } from 'react-native';

/**
 * Thin wrapper around expo-haptics that swallows failures on devices/
 * simulators without haptic hardware, so callers never need try/catch.
 */
export function useHaptics() {
  const impact = useCallback((style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
    if (Platform.OS === 'web') return;
    Haptics.impactAsync(style).catch(() => {});
  }, []);

  const selection = useCallback(() => {
    if (Platform.OS === 'web') return;
    Haptics.selectionAsync().catch(() => {});
  }, []);

  const notify = useCallback((type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success) => {
    if (Platform.OS === 'web') return;
    Haptics.notificationAsync(type).catch(() => {});
  }, []);

  return { impact, selection, notify };
}
