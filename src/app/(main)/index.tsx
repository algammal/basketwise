import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, UserRound } from 'lucide-react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { FinancialMetric } from '../../components/financial/FinancialMetric';
import { BudgetProgress } from '../../components/financial/BudgetProgress';
import { InsightCard } from '../../components/financial/InsightCard';
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart';
import { CategoryBreakdownBars } from '../../components/charts/CategoryBreakdownBars';
import { ReceiptTransaction } from '../../components/receipts/ReceiptTransaction';
import { EmptyState } from '../../components/common/EmptyState';
import { colors, spacing, typography } from '../../theme';
import { useAppSelector } from '../../store/hooks';
import { selectBudgetDerived, selectCategorySpending } from '../../store/selectors';
import { formatMonthLabel, currentMonthIso } from '../../utils/formatting/date';
import { getPriceMovementInsights, getBudgetAlertInsight } from '../../services/recommendations/insights';

export default function OverviewScreen() {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const receipts = useAppSelector((state) => state.receipts.receipts);
  const products = useAppSelector((state) => state.products.products);
  const priceObservations = useAppSelector((state) => state.products.priceObservations);
  const { snapshot, availableBudget, projectedSpending, projectedBalance, utilizationPercent, status } =
    useAppSelector(selectBudgetDerived);
  const categorySpending = useAppSelector(selectCategorySpending);

  const month = useAppSelector((state) => state.budget.currentBudget?.month) ?? currentMonthIso();

  const recentReceipts = useMemo(() => receipts.slice(0, 3), [receipts]);

  const trendData = useMemo(
    () => [
      { label: 'Jun', amount: 8200 },
      { label: 'Jul', amount: 7600 },
      { label: 'Aug', amount: 9100 },
      { label: 'Sep', amount: 8700 },
      { label: 'Oct', amount: 9400 },
      { label: 'Nov', amount: snapshot.actualSpending },
    ],
    [snapshot.actualSpending],
  );

  const insights = useMemo(() => {
    const budgetAlert = getBudgetAlertInsight(snapshot);
    const priceMoves = getPriceMovementInsights(
      products.map((p) => p.id),
      priceObservations,
      (id) => products.find((p) => p.id === id)?.name ?? 'Product',
    );
    return [budgetAlert, ...priceMoves].filter((i): i is NonNullable<typeof i> => i !== null).slice(0, 4);
  }, [snapshot, products, priceObservations]);

  return (
    <MainLayout>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <View>
          <Text style={[typography.caption, { color: colors.text.secondary }]}>{formatMonthLabel(month)}</Text>
          <Text style={[typography.heading1, { color: colors.text.primary }]}>
            Welcome back{user?.name ? `, ${user.name}` : ''}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Pressable accessibilityRole="button" accessibilityLabel="Notifications">
            <Bell size={22} color={colors.text.secondary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Profile"
            onPress={() => router.push('/(main)/profile')}
          >
            <UserRound size={22} color={colors.text.secondary} />
          </Pressable>
        </View>
      </View>

      <GlassCard elevated style={{ marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.lg }}>
          <FinancialMetric label="Monthly budget" amount={snapshot.monthlyBudget} size="medium" />
          <FinancialMetric label="Remaining" amount={projectedBalance} size="medium" tone={projectedBalance < 0 ? 'negative' : 'positive'} signed />
        </View>
        <BudgetProgress utilizationPercent={utilizationPercent} status={status} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg }}>
          <FinancialMetric label="Actual" amount={snapshot.actualSpending} size="small" />
          <FinancialMetric label="Planned" amount={snapshot.plannedSpending} size="small" />
          <FinancialMetric label="Projected" amount={projectedSpending} size="small" />
          <FinancialMetric label="Available" amount={availableBudget} size="small" tone={availableBudget < 0 ? 'negative' : 'neutral'} />
        </View>
      </GlassCard>

      <SectionHeader title="Spending trend" subtitle="Last 6 months, confirmed receipts" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        <SpendingTrendChart data={trendData} />
      </GlassCard>

      <SectionHeader title="Spending by category" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        {categorySpending.length > 0 ? (
          <CategoryBreakdownBars categories={categorySpending} />
        ) : (
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            Scan a receipt to see your category breakdown.
          </Text>
        )}
      </GlassCard>

      <SectionHeader title="Financial insights" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        {insights.length > 0 ? (
          insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)
        ) : (
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            Nothing needs your attention right now.
          </Text>
        )}
      </GlassCard>

      <SectionHeader
        title="Recent receipts"
        actionLabel="View all"
        onActionPress={() => router.push('/(main)/receipts')}
      />
      <GlassCard style={{ marginBottom: spacing.xl, padding: spacing.xs }}>
        {recentReceipts.length > 0 ? (
          recentReceipts.map((receipt) => (
            <ReceiptTransaction
              key={receipt.id}
              receipt={receipt}
              onPress={() => router.push(`/(main)/receipts?receiptId=${receipt.id}` as never)}
            />
          ))
        ) : (
          <EmptyState title="No receipts yet" message="Scan your first receipt to start building your price history." />
        )}
      </GlassCard>
    </MainLayout>
  );
}
