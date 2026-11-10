import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatPercentage } from '../../utils/formatting/currency';
import type { BudgetStatus } from '../../utils/finance/budget';

interface BudgetProgressProps {
  utilizationPercent: number;
  status: BudgetStatus;
  label?: string;
}

const STATUS_COLOR: Record<BudgetStatus, string> = {
  'within-budget': colors.semantic.savings,
  'near-limit': colors.semantic.warning,
  'over-budget': colors.semantic.danger,
};

const STATUS_LABEL: Record<BudgetStatus, string> = {
  'within-budget': 'Within budget',
  'near-limit': 'Near limit',
  'over-budget': 'Over budget',
};

export function BudgetProgress({ utilizationPercent, status, label = 'Budget utilization' }: BudgetProgressProps) {
  const widthAnim = useRef(new Animated.Value(0)).current;
  const clamped = Math.min(100, Math.max(0, utilizationPercent));

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: clamped,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [clamped, widthAnim]);

  const color = STATUS_COLOR[status];

  return (
    <View>
      <View style={styles.headerRow}>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>{label}</Text>
        <Text style={[typography.captionStrong, { color }]}>
          {formatPercentage(utilizationPercent)} · {STATUS_LABEL[status]}
        </Text>
      </View>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.glass.surfaceStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
