import React, { useCallback, useEffect, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Plus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing, typography } from '../theme';
import { NAV_DESTINATIONS, SEGMENT_ANGLE } from './destinations';
import { angleFromCenter, segmentIndexForAngle } from '../types/navigation';
import { CircularNavigationItem } from './CircularNavigationItem';
import { useHaptics } from '../hooks/useHaptics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useAppDispatch } from '../store/hooks';
import { setLastDestination } from '../store/slices/navigationSlice';

const WHEEL_SIZE = 296;
const BUTTON_SIZE = 64;
const ITEM_RADIUS = WHEEL_SIZE / 2 - 48;
const LONG_PRESS_MS = 220;
/** Angle math runs relative to the button's own layout box — the Pan gesture is attached to the button, and RNGH keeps reporting coordinates in that view's space even once the finger moves well beyond its visual bounds. */
const BUTTON_CENTER = { x: BUTTON_SIZE / 2, y: BUTTON_SIZE / 2 };

/**
 * The iPod-wheel-inspired circular navigation. Mounted once near the root
 * so it floats above every screen without remounting on navigation.
 *
 * Interaction model: a single Gesture.Pan with `activateAfterLongPress`
 * covers both spec'd modes with one gesture recognizer instead of racing
 * several — press-and-hold-then-rotate activates the pan itself (Mode A),
 * while a quick tap that never reaches the long-press threshold falls
 * through to the sibling Pressable's `onPress` (Mode B, open-only; rotate
 * or tap a destination afterward). Releasing the pan always confirms
 * whatever segment is currently highlighted, in either mode.
 */
export function CircularNavigation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const { impact, selection, notify } = useHaptics();
  const reducedMotion = useReducedMotion();

  const [isOpen, setIsOpen] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  const selectedIndex = useSharedValue(0);
  const openProgress = useSharedValue(0);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setScreenReaderEnabled).catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReaderEnabled);
    return () => subscription.remove();
  }, []);

  const closeWheel = useCallback(() => setIsOpen(false), []);

  const requestClose = useCallback(() => {
    const duration = reducedMotion ? 0 : 200;
    openProgress.value = withTiming(0, { duration }, (finished) => {
      if (finished) runOnJS(closeWheel)();
    });
  }, [closeWheel, openProgress, reducedMotion]);

  const openWheel = useCallback(() => {
    impact();
    setIsOpen(true);
    const duration = reducedMotion ? 0 : 260;
    openProgress.value = withTiming(1, { duration, easing: Easing.out(Easing.cubic) });
  }, [impact, openProgress, reducedMotion]);

  const handleSegmentChange = useCallback(() => {
    selection();
  }, [selection]);

  const confirmSelection = useCallback(
    (index: number) => {
      const destination = NAV_DESTINATIONS[index];
      dispatch(setLastDestination(destination.id));
      notify();
      router.push(destination.route as never);
      requestClose();
    },
    [dispatch, notify, router, requestClose],
  );

  const selectDirect = useCallback(
    (index: number) => {
      confirmSelection(index);
    },
    [confirmSelection],
  );

  const panGesture = Gesture.Pan()
    .activateAfterLongPress(LONG_PRESS_MS)
    .maxPointers(1)
    .onStart(() => {
      'worklet';
      runOnJS(openWheel)();
    })
    .onUpdate((e) => {
      'worklet';
      const angle = angleFromCenter({ x: e.x, y: e.y }, BUTTON_CENTER);
      const index = segmentIndexForAngle(angle, NAV_DESTINATIONS.length);
      if (index !== selectedIndex.value) {
        selectedIndex.value = index;
        runOnJS(handleSegmentChange)();
      }
    })
    .onEnd(() => {
      'worklet';
      runOnJS(confirmSelection)(selectedIndex.value);
    });

  const wheelStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
    transform: [{ scale: 0.7 + openProgress.value * 0.3 }],
  }));

  const buttonIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - openProgress.value,
  }));

  const closeIconStyle = useAnimatedStyle(() => ({
    opacity: openProgress.value,
  }));

  return (
    <View pointerEvents="box-none" style={[styles.root, { bottom: insets.bottom + spacing.lg }]}>
      {isOpen ? (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={requestClose}
          accessibilityRole="button"
          accessibilityLabel="Close navigation"
        />
      ) : null}

      <View style={styles.anchor} pointerEvents="box-none">
        {isOpen ? (
          <Animated.View style={[styles.wheel, wheelStyle]} pointerEvents="none">
            <BlurView intensity={60} tint="dark" style={styles.wheelHalfLeft} />
            <BlurView intensity={60} tint="dark" style={styles.wheelHalfRight} />
            <View style={styles.wheelBorder} />
            {NAV_DESTINATIONS.map((destination, index) => {
              const angleRad = (index * SEGMENT_ANGLE * Math.PI) / 180;
              const x = ITEM_RADIUS * Math.sin(angleRad);
              const y = -ITEM_RADIUS * Math.cos(angleRad);
              return (
                <CircularNavigationItem
                  key={destination.id}
                  destination={destination}
                  index={index}
                  x={x}
                  y={y}
                  selectedIndex={selectedIndex}
                  openProgress={openProgress}
                />
              );
            })}
          </Animated.View>
        ) : null}

        {isOpen && screenReaderEnabled ? (
          <AccessibleDestinationList onSelect={selectDirect} onClose={requestClose} />
        ) : null}

        <GestureDetector gesture={panGesture}>
          <Pressable
            onPress={isOpen ? requestClose : openWheel}
            accessibilityRole="button"
            accessibilityLabel={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
            accessibilityHint={isOpen ? undefined : 'Press and hold, then rotate your finger to choose a destination'}
            style={[styles.button, shadows.glowAccent]}
          >
            <BlurView intensity={40} tint="dark" style={styles.buttonBlur}>
              <Animated.View style={[styles.buttonIcon, buttonIconStyle]}>
                <Plus size={26} color={colors.accent.primary} />
              </Animated.View>
              <Animated.View style={[styles.buttonIcon, styles.buttonIconOverlay, closeIconStyle]}>
                <X size={22} color={colors.text.primary} />
              </Animated.View>
            </BlurView>
          </Pressable>
        </GestureDetector>
      </View>
    </View>
  );
}

function AccessibleDestinationList({
  onSelect,
  onClose,
}: {
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <View style={styles.accessibleList}>
      <BlurView intensity={48} tint="dark" style={styles.accessibleListBlur}>
        {NAV_DESTINATIONS.map((destination, index) => (
          <Pressable
            key={destination.id}
            onPress={() => onSelect(index)}
            accessibilityRole="button"
            accessibilityLabel={destination.label}
            style={styles.accessibleRow}
          >
            <Text style={[typography.body, { color: colors.text.primary }]}>{destination.label}</Text>
          </Pressable>
        ))}
        <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" style={styles.accessibleRow}>
          <Text style={[typography.bodyStrong, { color: colors.semantic.danger }]}>Close</Text>
        </Pressable>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  anchor: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheel: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelHalfLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: WHEEL_SIZE / 2 - 1,
    height: WHEEL_SIZE,
    borderTopLeftRadius: WHEEL_SIZE / 2,
    borderBottomLeftRadius: WHEEL_SIZE / 2,
    backgroundColor: colors.glass.surfaceStrong,
    overflow: 'hidden',
  },
  wheelHalfRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: WHEEL_SIZE / 2 - 1,
    height: WHEEL_SIZE,
    borderTopRightRadius: WHEEL_SIZE / 2,
    borderBottomRightRadius: WHEEL_SIZE / 2,
    backgroundColor: colors.glass.surface,
    overflow: 'hidden',
  },
  wheelBorder: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    overflow: 'hidden',
  },
  buttonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.accent.primary,
    backgroundColor: colors.glass.surfaceStrong,
  },
  buttonIcon: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIconOverlay: {},
  accessibleList: {
    position: 'absolute',
    bottom: BUTTON_SIZE + spacing.lg,
    width: 240,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  accessibleListBlur: {
    backgroundColor: colors.glass.surfaceStrong,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
    paddingVertical: spacing.sm,
  },
  accessibleRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
