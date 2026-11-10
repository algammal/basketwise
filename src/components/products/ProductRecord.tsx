import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Heart, ShieldCheck } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme';
import { formatCurrency } from '../../utils/formatting/currency';
import type { Product, ProductPreference } from '../../types/entities';
import type { PriceIntelligenceSummary } from '../../services/pricing/priceIntelligence';

interface ProductRecordProps {
  product: Product;
  priceSummary: PriceIntelligenceSummary;
  preference?: ProductPreference;
  onPress?: () => void;
}

export function ProductRecord({ product, priceSummary, preference, onPress }: ProductRecordProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, { opacity: pressed ? 0.7 : 1 }]}>
      <View style={styles.middle}>
        <View style={styles.titleRow}>
          <Text style={[typography.bodyStrong, { color: colors.text.primary }]} numberOfLines={1}>
            {product.name}
          </Text>
          {preference?.isMustBuy ? <ShieldCheck size={14} color={colors.accent.primary} /> : null}
          {preference?.isFavorite ? <Heart size={14} color={colors.semantic.danger} fill={colors.semantic.danger} /> : null}
        </View>
        <Text style={[typography.caption, { color: colors.text.secondary }]} numberOfLines={1}>
          {product.brand ? `${product.brand} · ` : ''}
          {product.unitSize} {product.unit}
        </Text>
      </View>
      <View style={styles.right}>
        {priceSummary.lastObserved ? (
          <Text style={[typography.financialSmall, { color: colors.text.primary }]}>
            {formatCurrency(priceSummary.lastObserved.price)}
          </Text>
        ) : (
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>No price yet</Text>
        )}
        {priceSummary.priceDeltaVsPrevious !== null && priceSummary.priceDeltaVsPrevious !== 0 ? (
          <Text
            style={[
              typography.micro,
              { color: priceSummary.priceDeltaVsPrevious > 0 ? colors.semantic.danger : colors.semantic.savings },
            ]}
          >
            {priceSummary.priceDeltaVsPrevious > 0 ? '▲' : '▼'} {Math.abs(priceSummary.priceDeltaVsPrevious).toFixed(2)}
          </Text>
        ) : null}
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
