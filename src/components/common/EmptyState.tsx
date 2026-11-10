import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { GlassButton } from '../glass/GlassButton';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({ icon, title, message, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon}
      <Text style={[typography.heading3, { color: colors.text.primary, marginTop: spacing.md }]}>{title}</Text>
      {message ? (
        <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs }]}>
          {message}
        </Text>
      ) : null}
      {actionLabel && onActionPress ? (
        <GlassButton label={actionLabel} onPress={onActionPress} variant="primary" style={{ marginTop: spacing.lg }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
});
