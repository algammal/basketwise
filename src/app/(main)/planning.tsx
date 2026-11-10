import React, { useMemo, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { GlassButton } from '../../components/glass/GlassButton';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PlanningItem } from '../../components/products/PlanningItem';
import { FinancialMetric } from '../../components/financial/FinancialMetric';
import { getSupermarketName } from '../../components/common/SupermarketLogo';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addPlanItem, removePlanItem, updatePlanItem } from '../../store/slices/planningSlice';
import {
  buildPriceIndex,
  computeSingleSupermarketStrategy,
  computeMaximumSavingsStrategy,
  computePersonalizedStrategy,
  compareStrategies,
  type OptimizationResult,
} from '../../utils/pricing/optimization';
import { formatCurrency } from '../../utils/formatting/currency';
import { SAMPLE_SUPERMARKETS } from '../../constants/supermarkets';

const STRATEGY_LABEL: Record<OptimizationResult['strategy'], string> = {
  'single-supermarket': 'Single Supermarket',
  'maximum-savings': 'Maximum Savings',
  personalized: 'Personalized Plan',
};

export default function PlanningScreen() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.products);
  const priceObservations = useAppSelector((state) => state.products.priceObservations);
  const plans = useAppSelector((state) => state.planning.plans);
  const activePlanId = useAppSelector((state) => state.planning.activePlanId);
  const plan = plans.find((p) => p.id === activePlanId) ?? plans[0];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customProductName, setCustomProductName] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<OptimizationResult['strategy']>('maximum-savings');

  const displayNameFor = (item: (typeof plan.items)[number]) =>
    item.customName ?? products.find((p) => p.id === item.productId)?.name ?? 'Item';

  const estimatedTotal = plan.items.reduce((sum, item) => sum + (item.estimatedUnitPrice ?? 0) * item.quantity, 0);

  const priceIndex = useMemo(() => buildPriceIndex(priceObservations), [priceObservations]);
  const supermarketIds = SAMPLE_SUPERMARKETS.map((s) => s.id);

  const singleSupermarketResults = useMemo(
    () => computeSingleSupermarketStrategy(plan.items, priceIndex, supermarketIds),
    [plan.items, priceIndex, supermarketIds],
  );
  const maximumSavings = useMemo(() => computeMaximumSavingsStrategy(plan.items, priceIndex), [plan.items, priceIndex]);
  const personalized = useMemo(() => computePersonalizedStrategy(plan.items, priceIndex), [plan.items, priceIndex]);
  const { potentialSavings } = useMemo(
    () => compareStrategies(singleSupermarketResults, maximumSavings),
    [singleSupermarketResults, maximumSavings],
  );

  const activeResult: OptimizationResult | undefined =
    selectedStrategy === 'maximum-savings'
      ? maximumSavings
      : selectedStrategy === 'personalized'
        ? personalized
        : singleSupermarketResults.reduce<OptimizationResult | undefined>(
            (best, r) => (!best || (r.allocations.length > 0 && r.totalEstimatedCost < best.totalEstimatedCost) ? r : best),
            undefined,
          );

  const handleAddCustomItem = () => {
    if (!customProductName.trim()) return;
    dispatch(
      addPlanItem({
        planId: plan.id,
        item: {
          id: `plan-item-${Date.now()}`,
          planId: plan.id,
          customName: customProductName.trim(),
          quantity: 1,
          priority: 'normal',
          isFavorite: false,
          isMustBuy: false,
        },
      }),
    );
    setCustomProductName('');
    setIsAddModalOpen(false);
  };

  const handleAddFromCatalog = (productId: string) => {
    const summaryPrice = priceIndex.get(productId);
    const anyPrice = summaryPrice ? Array.from(summaryPrice.values())[0]?.price : undefined;
    dispatch(
      addPlanItem({
        planId: plan.id,
        item: {
          id: `plan-item-${Date.now()}`,
          planId: plan.id,
          productId,
          quantity: 1,
          estimatedUnitPrice: anyPrice,
          priority: 'normal',
          isFavorite: false,
          isMustBuy: false,
        },
      }),
    );
    setIsAddModalOpen(false);
  };

  return (
    <MainLayout>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Text style={[typography.heading1, { color: colors.text.primary }]}>Planning</Text>
        <Pressable onPress={() => setIsAddModalOpen(true)} accessibilityRole="button" accessibilityLabel="Add item to plan">
          <Plus size={24} color={colors.accent.primary} />
        </Pressable>
      </View>

      <GlassCard style={{ marginBottom: spacing.xl }}>
        <FinancialMetric label={`${plan.items.length} planned items`} amount={estimatedTotal} size="medium" />
      </GlassCard>

      <SectionHeader title="Shopping list" />
      {plan.items.length === 0 ? (
        <EmptyState title="Nothing planned yet" message="Add products your household needs to start planning this month's purchases." />
      ) : (
        <GlassCard style={{ marginBottom: spacing.xl, padding: spacing.sm }}>
          {plan.items.map((item) => (
            <PlanningItem
              key={item.id}
              item={item}
              displayName={displayNameFor(item)}
              onQuantityChange={(quantity) => dispatch(updatePlanItem({ planId: plan.id, itemId: item.id, changes: { quantity } }))}
              onRemove={() => dispatch(removePlanItem({ planId: plan.id, itemId: item.id }))}
            />
          ))}
        </GlassCard>
      )}

      <SectionHeader title="Purchase optimization" subtitle="Based on your recorded price history" />
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {(['single-supermarket', 'maximum-savings', 'personalized'] as const).map((strategy) => (
          <Pressable
            key={strategy}
            onPress={() => setSelectedStrategy(strategy)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              alignItems: 'center',
              backgroundColor: selectedStrategy === strategy ? colors.accent.primaryMuted : colors.glass.surface,
              borderWidth: 1,
              borderColor: selectedStrategy === strategy ? colors.accent.primary : colors.glass.border,
            }}
          >
            <Text style={[typography.micro, { color: colors.text.primary, textAlign: 'center' }]}>
              {STRATEGY_LABEL[strategy]}
            </Text>
          </Pressable>
        ))}
      </View>

      <GlassCard elevated style={{ marginBottom: spacing.xl }}>
        {activeResult && activeResult.allocations.length > 0 ? (
          <>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <FinancialMetric label="Estimated total" amount={activeResult.totalEstimatedCost} size="medium" />
              <FinancialMetric label="Supermarkets needed" amount={activeResult.supermarketIds.length} size="medium" />
            </View>
            {selectedStrategy === 'maximum-savings' && potentialSavings > 0 ? (
              <Text style={[typography.captionStrong, { color: colors.semantic.savings, marginBottom: spacing.md }]}>
                Potential savings vs. a single supermarket: {formatCurrency(potentialSavings)}
              </Text>
            ) : null}
            {activeResult.supermarketIds.map((supermarketId) => {
              const lines = activeResult.allocations.filter((a) => a.supermarketId === supermarketId);
              const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);
              return (
                <View key={supermarketId} style={{ marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{getSupermarketName(supermarketId)}</Text>
                    <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{formatCurrency(subtotal)}</Text>
                  </View>
                  <Text style={[typography.caption, { color: colors.text.secondary }]}>{lines.length} item(s)</Text>
                </View>
              );
            })}
            {activeResult.missingPriceProductIds.length > 0 ? (
              <Text style={[typography.caption, { color: colors.semantic.warning, marginTop: spacing.sm }]}>
                {activeResult.missingPriceProductIds.length} item(s) have no recorded price yet and were excluded.
              </Text>
            ) : null}
            {activeResult.stalePriceProductIds.length > 0 ? (
              <Text style={[typography.caption, { color: colors.semantic.warning }]}>
                {activeResult.stalePriceProductIds.length} item(s) are using prices older than 30 days.
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={[typography.caption, { color: colors.text.tertiary }]}>
            Add items with known prices to see optimized purchasing recommendations.
          </Text>
        )}
      </GlassCard>

      <Modal visible={isAddModalOpen} transparent animationType="slide" onRequestClose={() => setIsAddModalOpen(false)}>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay.scrim }}>
          <View style={{ backgroundColor: colors.background.secondary, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, maxHeight: '70%' }}>
            <Text style={[typography.heading2, { color: colors.text.primary, marginBottom: spacing.md }]}>Add to plan</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
              <TextInput
                value={customProductName}
                onChangeText={setCustomProductName}
                placeholder="Custom product name"
                placeholderTextColor={colors.text.tertiary}
                style={{ flex: 1, backgroundColor: colors.glass.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.text.primary }}
              />
              <GlassButton label="Add" onPress={handleAddCustomItem} variant="primary" />
            </View>
            <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>Or pick from your products</Text>
            {products.map((product) => (
              <Pressable key={product.id} onPress={() => handleAddFromCatalog(product.id)} style={{ paddingVertical: spacing.sm }}>
                <Text style={[typography.body, { color: colors.text.primary }]}>{product.name}</Text>
              </Pressable>
            ))}
            <GlassButton label="Close" onPress={() => setIsAddModalOpen(false)} variant="ghost" style={{ marginTop: spacing.md }} />
          </View>
        </View>
      </Modal>
    </MainLayout>
  );
}
