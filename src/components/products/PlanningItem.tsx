import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, ShieldCheck, Minus, Plus as PlusIcon, X } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatting/currency';
import type { ShoppingPlanItem } from '../../types/entities';

interface PlanningItemProps {
  item: ShoppingPlanItem;
  displayName: string;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function PlanningItem({ item, displayName, onQuantityChange, onRemove }: PlanningItemProps) {
  const estimatedTotal = (item.estimatedUnitPrice ?? 0) * item.quantity;

  return (
    <View style={styles.row}>
      <View style={styles.titleColumn}>
        <View style={styles.titleRow}>
          <Text style={[typography.bodyStrong, { color: colors.text.primary }]} numberOfLines={1}>
            {displayName}
          </Text>
          {item.isMustBuy ? <ShieldCheck size={14} color={colors.accent.primary} /> : null}
          {item.isFavorite ? <Heart size={14} color={colors.semantic.danger} fill={colors.semantic.danger} /> : null}
        </View>
        {item.estimatedUnitPrice ? (
          <Text style={[typography.caption, { color: colors.text.secondary }]}>
            {formatCurrency(item.estimatedUnitPrice)} each · {formatCurrency(estimatedTotal)}
          </Text>
        ) : (
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>No price estimate yet</Text>
        )}
      </View>

      <View style={styles.quantityControl}>
        <Pressable onPress={() => onQuantityChange(Math.max(1, item.quantity - 1))} accessibilityRole="button" accessibilityLabel="Decrease quantity">
          <Minus size={16} color={colors.text.secondary} />
        </Pressable>
        <Text style={[typography.bodyStrong, { color: colors.text.primary, minWidth: 24, textAlign: 'center' }]}>
          {item.quantity}
        </Text>
        <Pressable onPress={() => onQuantityChange(item.quantity + 1)} accessibilityRole="button" accessibilityLabel="Increase quantity">
          <PlusIcon size={16} color={colors.text.secondary} />
        </Pressable>
      </View>

      <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={`Remove ${displayName}`}>
        <X size={18} color={colors.text.tertiary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  titleColumn: {
    flex: 1,
    gap: spacing.xxs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.glass.surfaceStrong,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
