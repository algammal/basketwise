import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatting/currency';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import type { CategorySpending } from '../../utils/finance/spending';

interface CategoryBreakdownBarsProps {
  categories: CategorySpending[];
}

export function CategoryBreakdownBars({ categories }: CategoryBreakdownBarsProps) {
  const maxAmount = Math.max(1, ...categories.map((c) => c.actualAmount));

  return (
    <View style={styles.container}>
      {categories.map((category) => {
        const meta = PRODUCT_CATEGORIES.find((c) => c.id === category.categoryId);
        const widthPercent = (category.actualAmount / maxAmount) * 100;
        return (
          <View key={category.categoryId} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={[typography.caption, { color: colors.text.primary }]}>{meta?.label ?? category.categoryId}</Text>
              <Text style={[typography.captionStrong, { color: colors.text.secondary }]}>
                {formatCurrency(category.actualAmount)}
              </Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${widthPercent}%` }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  track: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.glass.surfaceStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent.secondary,
  },
});
