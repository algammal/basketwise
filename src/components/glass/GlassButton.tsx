import React from 'react';
import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing, typography } from '../../theme';
import { useHaptics } from '../../hooks/useHaptics';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  accessibilityHint?: string;
}

export function GlassButton({
  label,
  onPress,
  variant = 'secondary',
  icon,
  style,
  disabled = false,
  accessibilityHint,
}: GlassButtonProps) {
  const { selection } = useHaptics();

  const handlePress = () => {
    selection();
    onPress();
  };

  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isGhost = variant === 'ghost';

  const backgroundColor = isPrimary
    ? colors.accent.primaryMuted
    : isDanger
      ? colors.semantic.dangerMuted
      : isGhost
        ? 'transparent'
        : colors.glass.surface;

  const borderColor = isPrimary
    ? colors.accent.primary
    : isDanger
      ? colors.semantic.danger
      : colors.glass.border;

  const textColor = isPrimary ? colors.accent.primary : isDanger ? colors.semantic.danger : colors.text.primary;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.75 : 1 }, style]}
    >
      <BlurView
        intensity={isGhost ? 0 : 24}
        tint="dark"
        style={[styles.base, { backgroundColor, borderColor }]}
      >
        {icon}
        <Text style={[typography.bodyStrong, { color: textColor }]}>{label}</Text>
      </BlurView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
