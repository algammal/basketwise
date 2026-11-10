import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingUp, TrendingDown, PiggyBank, AlertTriangle } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../../theme';
import type { Insight } from '../../services/recommendations/insights';

interface InsightCardProps {
  insight: Insight;
}

const ICON_BY_KIND = {
  'price-increase': TrendingUp,
  'price-decrease': TrendingDown,
  'savings-opportunity': PiggyBank,
  'budget-alert': AlertTriangle,
};

const COLOR_BY_KIND = {
  'price-increase': colors.semantic.danger,
  'price-decrease': colors.semantic.savings,
  'savings-opportunity': colors.accent.secondary,
  'budget-alert': colors.semantic.warning,
};

export function InsightCard({ insight }: InsightCardProps) {
  const Icon = ICON_BY_KIND[insight.kind];
  const color = COLOR_BY_KIND[insight.kind];

  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: `${color}26`, borderColor: color }]}>
        <Icon size={18} color={color} />
      </View>
      <View style={styles.textBlock}>
        <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{insight.title}</Text>
        <Text style={[typography.caption, { color: colors.text.secondary }]}>{insight.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  textBlock: {
    flex: 1,
    gap: spacing.xxs,
  },
});
