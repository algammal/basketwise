import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatting/currency';
import { formatReceiptDate } from '../../utils/formatting/date';
import { SupermarketLogo, getSupermarketName } from '../common/SupermarketLogo';
import type { Receipt } from '../../types/entities';

interface ReceiptTransactionProps {
  receipt: Receipt;
  onPress?: () => void;
}

const STATUS_LABEL: Record<Receipt['status'], string> = {
  processing: 'Processing',
  'needs-review': 'Needs review',
  confirmed: 'Confirmed',
};

const STATUS_COLOR: Record<Receipt['status'], string> = {
  processing: colors.semantic.info,
  'needs-review': colors.semantic.warning,
  confirmed: colors.semantic.savings,
};

/** Renders a receipt as a financial transaction row, not a shopping-cart item. */
export function ReceiptTransaction({ receipt, onPress }: ReceiptTransactionProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <SupermarketLogo supermarketId={receipt.supermarketId} />
      <View style={styles.middle}>
        <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>
          {getSupermarketName(receipt.supermarketId)}
        </Text>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>
          {formatReceiptDate(receipt.purchaseDate)} · {receipt.itemCount} item{receipt.itemCount === 1 ? '' : 's'}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={[typography.financialSmall, { color: colors.text.primary }]}>
          {formatCurrency(receipt.totalAmount, receipt.currency)}
        </Text>
        <Text style={[typography.micro, { color: STATUS_COLOR[receipt.status] }]}>{STATUS_LABEL[receipt.status]}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderRadius: radius.md,
  },
  middle: {
    flex: 1,
    gap: spacing.xxs,
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xxs,
  },
});
