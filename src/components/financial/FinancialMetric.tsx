import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { formatCurrency, formatSignedCurrency } from '../../utils/formatting/currency';
import type { CurrencyCode } from '../../types/entities';

interface FinancialMetricProps {
  label: string;
  amount: number;
  currency?: CurrencyCode;
  size?: 'large' | 'medium' | 'small';
  tone?: 'neutral' | 'positive' | 'negative';
  signed?: boolean;
  caption?: string;
}

const SIZE_STYLE = {
  large: typography.financialLarge,
  medium: typography.financialMedium,
  small: typography.financialSmall,
} as const;

const TONE_COLOR = {
  neutral: colors.text.primary,
  positive: colors.semantic.savings,
  negative: colors.semantic.danger,
} as const;

export function FinancialMetric({
  label,
  amount,
  currency = 'EGP',
  size = 'medium',
  tone = 'neutral',
  signed = false,
  caption,
}: FinancialMetricProps) {
  const formatted = signed ? formatSignedCurrency(amount, currency) : formatCurrency(amount, currency);

  return (
    <View style={styles.container}>
      <Text style={[typography.caption, { color: colors.text.secondary }]}>{label}</Text>
      <Text style={[SIZE_STYLE[size], { color: TONE_COLOR[tone] }]}>{formatted}</Text>
      {caption ? <Text style={[typography.micro, { color: colors.text.tertiary }]}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xxs,
  },
});
