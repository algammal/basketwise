import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatting/currency';
import { formatReceiptDate } from '../../utils/formatting/date';
import { SupermarketLogo, getSupermarketName } from '../common/SupermarketLogo';

interface PriceComparisonRowProps {
  supermarketId: string;
  price: number;
  observedAt: string;
  isLowest?: boolean;
  isStale?: boolean;
}

/**
 * One row of a product's cross-supermarket comparison. Always shows the
 * observation date so a historical receipt price is never mistaken for a
 * live price.
 */
export function PriceComparisonRow({ supermarketId, price, observedAt, isLowest, isStale }: PriceComparisonRowProps) {
  return (
    <View style={[styles.row, isLowest && styles.rowHighlighted]}>
      <SupermarketLogo supermarketId={supermarketId} size={28} />
      <View style={styles.middle}>
        <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{getSupermarketName(supermarketId)}</Text>
        <Text style={[typography.micro, { color: isStale ? colors.semantic.warning : colors.text.tertiary }]}>
          Observed {formatReceiptDate(observedAt)}
          {isStale ? ' · stale' : ''}
        </Text>
      </View>
      <Text style={[typography.financialSmall, { color: isLowest ? colors.semantic.savings : colors.text.primary }]}>
        {formatCurrency(price)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  rowHighlighted: {
    backgroundColor: colors.accent.primaryMuted,
  },
  middle: {
    flex: 1,
    gap: spacing.xxs,
  },
});
