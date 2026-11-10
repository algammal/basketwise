import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../theme';

export interface SpendingTrendPoint {
  label: string;
  amount: number;
}

interface SpendingTrendChartProps {
  data: SpendingTrendPoint[];
  height?: number;
}

/**
 * Plain React Native bar trend — deliberately avoids any native graphics
 * library (Skia/SVG) so it renders in Expo Go without a custom dev client.
 * Victory Native XL remains available for a future dev-build setup; this is
 * the Expo-Go-compatible stand-in in the meantime.
 */
export function SpendingTrendChart({ data, height = 140 }: SpendingTrendChartProps) {
  if (data.length < 2) {
    return null;
  }

  const maxAmount = Math.max(1, ...data.map((p) => p.amount));

  return (
    <View>
      <View style={[styles.row, { height }]}>
        {data.map((point) => {
          const barHeight = Math.max(4, (point.amount / maxAmount) * height);
          return (
            <View key={point.label} style={styles.barColumn}>
              <LinearGradient
                colors={[colors.accent.primary, colors.accent.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[styles.bar, { height: barHeight }]}
              />
            </View>
          );
        })}
      </View>
      <View style={styles.labelRow}>
        {data.map((point) => (
          <Text key={point.label} style={[typography.micro, { color: colors.text.tertiary }]}>
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: '70%',
    borderRadius: radius.sm,
    opacity: 0.85,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
});
