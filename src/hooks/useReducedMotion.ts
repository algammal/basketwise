import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useAppSelector } from '../store/hooks';

/**
 * Combines the OS-level "reduce motion" accessibility setting with the
 * in-app preference toggle. Either one being on disables the circular
 * navigation's decorative animation and falls back to simple fades.
 */
export function useReducedMotion(): boolean {
  const preferenceReduceMotion = useAppSelector((state) => state.preferences.reduceMotion);
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled?.().then(setSystemReduceMotion).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);
    return () => subscription.remove();
  }, []);

  return preferenceReduceMotion || systemReduceMotion;
}
