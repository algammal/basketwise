import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, shadows } from '../../theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  padding?: number;
}

/**
 * Base glass surface used across the app. Not every section should be a
 * card — reserve this for content that benefits from visual separation
 * (summaries, metrics, grouped rows), not as a default wrapper.
 */
export function GlassCard({ children, style, elevated = false, padding = 16 }: GlassCardProps) {
  return (
    <View style={[styles.wrapper, elevated ? shadows.card : shadows.soft, style]}>
      <BlurView
        intensity={elevated ? 48 : 36}
        tint="dark"
        style={[
          styles.blur,
          {
            backgroundColor: elevated ? colors.glass.surfaceStrong : colors.glass.surface,
            borderColor: elevated ? colors.glass.borderStrong : colors.glass.border,
            borderRadius: elevated ? radius.xl : radius.lg,
            padding,
          },
        ]}
      >
        {children}
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  blur: {
    borderWidth: 1,
    overflow: 'hidden',
  },
});
