import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, interpolateColor, type SharedValue } from 'react-native-reanimated';
import * as LucideIcons from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';
import type { NavDestination } from './destinations';

interface CircularNavigationItemProps {
  destination: NavDestination;
  index: number;
  x: number;
  y: number;
  selectedIndex: SharedValue<number>;
  openProgress: SharedValue<number>;
}

/**
 * One destination positioned around the wheel. Reads the shared selection
 * value directly inside the animated style worklet so the highlighted
 * segment updates on the UI thread during a drag without any React
 * re-render on the JS side.
 */
export function CircularNavigationItem({
  destination,
  index,
  x,
  y,
  selectedIndex,
  openProgress,
}: CircularNavigationItemProps) {
  const IconComponent = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[
    toPascalCase(destination.icon)
  ];

  const containerStyle = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === index;
    return {
      transform: [
        { translateX: x },
        { translateY: y },
        { scale: openProgress.value * (isSelected ? 1.18 : 1) },
      ],
      opacity: openProgress.value,
    };
  });

  const iconWrapStyle = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === index;
    return {
      backgroundColor: interpolateColor(
        isSelected ? 1 : 0,
        [0, 1],
        [
          destination.emphasized ? colors.accent.primaryMuted : colors.glass.surfaceStrong,
          colors.accent.primary,
        ],
      ),
      borderColor: isSelected ? colors.accent.primary : colors.glass.border,
    };
  });

  const labelStyle = useAnimatedStyle(() => ({
    opacity: selectedIndex.value === index ? 1 : 0.6,
  }));

  return (
    <Animated.View
      style={[styles.container, containerStyle]}
      accessible
      accessibilityRole="button"
      accessibilityLabel={destination.label}
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.iconWrap, iconWrapStyle]}>
        {IconComponent ? <IconComponent size={22} color={colors.text.primary} /> : null}
      </Animated.View>
      <Animated.Text style={[typography.micro, styles.label, labelStyle]}>{destination.label}</Animated.Text>
    </Animated.View>
  );
}

function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    width: 64,
    gap: spacing.xxs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  label: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
