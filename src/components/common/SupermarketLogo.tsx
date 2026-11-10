import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../../theme';
import { SAMPLE_SUPERMARKETS } from '../../constants/supermarkets';

interface SupermarketLogoProps {
  supermarketId: string;
  size?: number;
}

const INITIAL_COLORS: Record<string, string> = {
  'sm-carrefour': '#0033A0',
  'sm-spinneys': '#C8102E',
  'sm-metro-market': colors.accent.secondary,
  'sm-hyper-one': colors.semantic.warning,
};

/**
 * Text-badge placeholder until real supermarket logo assets are added.
 * Deliberately secondary in visual weight — financial figures carry the
 * emphasis on every screen that uses this.
 */
export function SupermarketLogo({ supermarketId, size = 32 }: SupermarketLogoProps) {
  const supermarket = SAMPLE_SUPERMARKETS.find((s) => s.id === supermarketId);
  const initial = supermarket?.name.charAt(0) ?? '?';
  const backgroundColor = INITIAL_COLORS[supermarketId] ?? colors.glass.surfaceStrong;

  return (
    <View style={[styles.badge, { width: size, height: size, borderRadius: size / 2, backgroundColor }]}>
      <Text style={[typography.captionStrong, { color: colors.text.primary, fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

export function getSupermarketName(supermarketId: string): string {
  return SAMPLE_SUPERMARKETS.find((s) => s.id === supermarketId)?.name ?? 'Unknown Supermarket';
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
});
