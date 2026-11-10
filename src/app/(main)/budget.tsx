import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassButton } from '../../components/glass/GlassButton';
import { SectionHeader } from '../../components/common/SectionHeader';
import { FinancialMetric } from '../../components/financial/FinancialMetric';
import { BudgetProgress } from '../../components/financial/BudgetProgress';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectBudgetDerived, selectCategorySpending } from '../../store/selectors';
import { updateMonthlyAmount } from '../../store/slices/budgetSlice';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import { formatCurrency } from '../../utils/formatting/currency';
import { formatMonthLabel } from '../../utils/formatting/date';

export default function BudgetScreen() {
  const dispatch = useAppDispatch();
  const budget = useAppSelector((state) => state.budget.currentBudget);
  const history = useAppSelector((state) => state.budget.history);
  const { snapshot, availableBudget, projectedSpending, projectedBalance, utilizationPercent, status } =
    useAppSelector(selectBudgetDerived);
  const categorySpending = useAppSelector(selectCategorySpending);

  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(String(budget?.monthlyAmount ?? 0));

  if (!budget) return null;

  const handleSaveBudget = () => {
    const value = Number(budgetInput);
    if (!Number.isNaN(value) && value > 0) {
      dispatch(updateMonthlyAmount(value));
    }
    setIsEditingBudget(false);
  };

  return (
    <MainLayout>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Text style={[typography.heading1, { color: colors.text.primary }]}>Budget</Text>
        <Pressable
          onPress={() => {
            setBudgetInput(String(budget.monthlyAmount));
            setIsEditingBudget(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Edit monthly budget"
        >
          <Pencil size={20} color={colors.accent.secondary} />
        </Pressable>
      </View>

      <GlassCard elevated style={{ marginBottom: spacing.xl }}>
        <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>
          {formatMonthLabel(budget.month)}
        </Text>
        <FinancialMetric label="Monthly budget" amount={budget.monthlyAmount} size="large" />
        <View style={{ marginTop: spacing.lg }}>
          <BudgetProgress utilizationPercent={utilizationPercent} status={status} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }}>
          <FinancialMetric label="Actual" amount={snapshot.actualSpending} size="small" />
          <FinancialMetric label="Planned" amount={snapshot.plannedSpending} size="small" />
          <FinancialMetric label="Projected" amount={projectedSpending} size="small" />
        </View>
        <View style={{ marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.glass.border }}>
          <FinancialMetric
            label="Available budget"
            amount={availableBudget}
            size="medium"
            tone={availableBudget < 0 ? 'negative' : 'positive'}
            signed
          />
          <Text style={[typography.caption, { color: colors.text.tertiary, marginTop: spacing.xs }]}>
            Projected balance: {formatCurrency(projectedBalance)}
          </Text>
        </View>
      </GlassCard>

      <SectionHeader title="Category budgets" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        {budget.categoryAllocations.map((allocation) => {
          const meta = PRODUCT_CATEGORIES.find((c) => c.id === allocation.categoryId);
          const actual = categorySpending.find((c) => c.categoryId === allocation.categoryId)?.actualAmount ?? 0;
          const utilization = allocation.allocatedAmount > 0 ? (actual / allocation.allocatedAmount) * 100 : 0;
          return (
            <View key={allocation.categoryId} style={{ marginBottom: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs }}>
                <Text style={[typography.body, { color: colors.text.primary }]}>{meta?.label}</Text>
                <Text style={[typography.caption, { color: colors.text.secondary }]}>
                  {formatCurrency(actual)} / {formatCurrency(allocation.allocatedAmount)}
                </Text>
              </View>
              <BudgetProgress
                utilizationPercent={utilization}
                status={utilization >= 100 ? 'over-budget' : utilization >= 90 ? 'near-limit' : 'within-budget'}
                label=""
              />
            </View>
          );
        })}
      </GlassCard>

      <SectionHeader title="Budget history" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        {history.length > 0 ? (
          history.map((h) => (
            <View key={h.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm }}>
              <Text style={[typography.body, { color: colors.text.primary }]}>{formatMonthLabel(h.month)}</Text>
              <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{formatCurrency(h.monthlyAmount)}</Text>
            </View>
          ))
        ) : (
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            Budget history will appear here once a new month starts.
          </Text>
        )}
      </GlassCard>

      <Modal visible={isEditingBudget} transparent animationType="fade" onRequestClose={() => setIsEditingBudget(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.overlay.scrim, padding: spacing.xl }}>
          <View style={{ width: '100%', backgroundColor: colors.background.secondary, borderRadius: radius.xl, padding: spacing.lg }}>
            <Text style={[typography.heading2, { color: colors.text.primary, marginBottom: spacing.md }]}>Edit monthly budget</Text>
            <TextInput
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="decimal-pad"
              style={{ backgroundColor: colors.glass.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, padding: spacing.md, color: colors.text.primary, marginBottom: spacing.lg, fontSize: 18 }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <GlassButton label="Cancel" onPress={() => setIsEditingBudget(false)} variant="ghost" style={{ flex: 1 }} />
              <GlassButton label="Save" onPress={handleSaveBudget} variant="primary" style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
}
