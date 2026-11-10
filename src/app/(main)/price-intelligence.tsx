import React, { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Search } from 'lucide-react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PriceComparisonRow } from '../../components/financial/PriceComparisonRow';
import { SpendingTrendChart } from '../../components/charts/SpendingTrendChart';
import { FinancialMetric } from '../../components/financial/FinancialMetric';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppSelector } from '../../store/hooks';
import { PRODUCT_CATEGORIES } from '../../constants/categories';
import { summarizePriceHistory, compareAcrossSupermarkets, isObservationStale } from '../../services/pricing/priceIntelligence';
import type { ProductCategoryId } from '../../types/entities';

export default function PriceIntelligenceScreen() {
  const products = useAppSelector((state) => state.products.products);
  const priceObservations = useAppSelector((state) => state.products.priceObservations);

  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategoryId | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(products[0]?.id ?? null);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
        const matchesCategory = !categoryFilter || p.categoryId === categoryFilter;
        return matchesQuery && matchesCategory;
      }),
    [products, query, categoryFilter],
  );

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const summary = selectedProductId ? summarizePriceHistory(selectedProductId, priceObservations) : null;
  const comparison = selectedProductId ? compareAcrossSupermarkets(selectedProductId, priceObservations) : [];
  const lowestPrice = comparison[0]?.price;

  const historyForChart = useMemo(() => {
    if (!selectedProductId) return [];
    return priceObservations
      .filter((o) => o.productId === selectedProductId)
      .sort((a, b) => new Date(a.observedAt).getTime() - new Date(b.observedAt).getTime())
      .map((o) => ({ label: o.observedAt.slice(5), amount: o.price }));
  }, [priceObservations, selectedProductId]);

  return (
    <MainLayout>
      <Text style={[typography.heading1, { color: colors.text.primary, marginBottom: spacing.lg }]}>Price Intelligence</Text>

      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass.surface, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.glass.border, paddingHorizontal: spacing.md, marginBottom: spacing.md }}>
        <Search size={18} color={colors.text.tertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search products"
          placeholderTextColor={colors.text.tertiary}
          style={[typography.body, { color: colors.text.primary, flex: 1, paddingVertical: spacing.sm, paddingLeft: spacing.sm }]}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg }}>
        <Pressable
          onPress={() => setCategoryFilter(null)}
          style={{
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.md,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: !categoryFilter ? colors.accent.secondary : colors.glass.border,
            backgroundColor: !categoryFilter ? colors.accent.secondaryMuted : 'transparent',
          }}
        >
          <Text style={[typography.caption, { color: colors.text.primary }]}>All</Text>
        </Pressable>
        {PRODUCT_CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => setCategoryFilter(cat.id)}
            style={{
              paddingVertical: spacing.xs,
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: categoryFilter === cat.id ? colors.accent.secondary : colors.glass.border,
              backgroundColor: categoryFilter === cat.id ? colors.accent.secondaryMuted : 'transparent',
            }}
          >
            <Text style={[typography.caption, { color: colors.text.primary }]}>{cat.label}</Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader title="Products" subtitle={`${filteredProducts.length} results`} />
      <View style={{ gap: spacing.xs, marginBottom: spacing.xl }}>
        {filteredProducts.map((product) => (
          <Pressable
            key={product.id}
            onPress={() => setSelectedProductId(product.id)}
            style={{
              padding: spacing.md,
              borderRadius: radius.md,
              backgroundColor: selectedProductId === product.id ? colors.accent.primaryMuted : colors.glass.surface,
              borderWidth: 1,
              borderColor: selectedProductId === product.id ? colors.accent.primary : colors.glass.border,
            }}
          >
            <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{product.name}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {product.brand} · {product.unitSize} {product.unit}
            </Text>
          </Pressable>
        ))}
      </View>

      {selectedProduct && summary ? (
        <>
          <SectionHeader title={selectedProduct.name} subtitle="Based on your scanned receipts" />
          <GlassCard elevated style={{ marginBottom: spacing.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md }}>
              <FinancialMetric label="Lowest observed" amount={summary.lowestPrice?.price ?? 0} size="small" tone="positive" />
              <FinancialMetric label="Average observed" amount={summary.averagePrice ?? 0} size="small" />
              <FinancialMetric label="Last observed" amount={summary.lastObserved?.price ?? 0} size="small" />
            </View>
            {historyForChart.length >= 2 ? <SpendingTrendChart data={historyForChart} height={100} /> : null}
          </GlassCard>

          <SectionHeader title="Compare supermarkets" />
          <GlassCard style={{ marginBottom: spacing.xl }}>
            {comparison.length > 0 ? (
              comparison.map((entry) => (
                <PriceComparisonRow
                  key={entry.supermarketId}
                  supermarketId={entry.supermarketId}
                  price={entry.price}
                  observedAt={entry.observedAt}
                  isLowest={entry.price === lowestPrice}
                  isStale={isObservationStale(entry.observedAt)}
                />
              ))
            ) : (
              <Text style={[typography.caption, { color: colors.text.tertiary }]}>No price history for this product yet.</Text>
            )}
          </GlassCard>
        </>
      ) : (
        <EmptyState title="Select a product" message="Choose a product above to see its price history across supermarkets." />
      )}
    </MainLayout>
  );
}
