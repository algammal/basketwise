import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductRecord } from '../../components/products/ProductRecord';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setFavorite, setMustBuy } from '../../store/slices/productSlice';
import { summarizePriceHistory } from '../../services/pricing/priceIntelligence';

type FilterMode = 'all' | 'favorites' | 'must-buy';

export default function ProductsScreen() {
  const dispatch = useAppDispatch();
  const products = useAppSelector((state) => state.products.products);
  const priceObservations = useAppSelector((state) => state.products.priceObservations);
  const preferences = useAppSelector((state) => state.products.preferences);

  const [filter, setFilter] = useState<FilterMode>('all');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (filter === 'favorites') return products.filter((p) => preferences[p.id]?.isFavorite);
    if (filter === 'must-buy') return products.filter((p) => preferences[p.id]?.isMustBuy);
    return products;
  }, [products, preferences, filter]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const selectedPreference = selectedProductId ? preferences[selectedProductId] : undefined;

  return (
    <MainLayout>
      <Text style={[typography.heading1, { color: colors.text.primary, marginBottom: spacing.lg }]}>Products</Text>

      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        {(['all', 'favorites', 'must-buy'] as const).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setFilter(mode)}
            style={{
              flex: 1,
              paddingVertical: spacing.sm,
              borderRadius: radius.md,
              alignItems: 'center',
              backgroundColor: filter === mode ? colors.accent.primaryMuted : colors.glass.surface,
              borderWidth: 1,
              borderColor: filter === mode ? colors.accent.primary : colors.glass.border,
            }}
          >
            <Text style={[typography.caption, { color: colors.text.primary }]}>
              {mode === 'all' ? 'All' : mode === 'favorites' ? 'Favorites' : 'Must-Buy'}
            </Text>
          </Pressable>
        ))}
      </View>

      {filteredProducts.length === 0 ? (
        <EmptyState title="No products here" message="Scan a receipt to start building your product catalog." />
      ) : (
        <GlassCard style={{ marginBottom: spacing.xl, padding: spacing.xs }}>
          {filteredProducts.map((product) => (
            <ProductRecord
              key={product.id}
              product={product}
              priceSummary={summarizePriceHistory(product.id, priceObservations)}
              preference={preferences[product.id]}
              onPress={() => setSelectedProductId(product.id)}
            />
          ))}
        </GlassCard>
      )}

      {selectedProduct ? (
        <>
          <SectionHeader title={selectedProduct.name} subtitle="Preferences" />
          <GlassCard style={{ marginBottom: spacing.xl }}>
            <PreferenceRow
              title="Favorite"
              description="You prefer this product, but may consider alternatives if they're cheaper."
              active={!!selectedPreference?.isFavorite}
              onToggle={() =>
                dispatch(setFavorite({ productId: selectedProduct.id, isFavorite: !selectedPreference?.isFavorite }))
              }
            />
            <PreferenceRow
              title="Must-Buy"
              description="You'll buy this exact product regardless of price — it's never excluded from recommendations for being more expensive."
              active={!!selectedPreference?.isMustBuy}
              onToggle={() => dispatch(setMustBuy({ productId: selectedProduct.id, isMustBuy: !selectedPreference?.isMustBuy }))}
            />
          </GlassCard>
        </>
      ) : null}
    </MainLayout>
  );
}

function PreferenceRow({
  title,
  description,
  active,
  onToggle,
}: {
  title: string;
  description: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} style={{ paddingVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xxs }}>
        <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{title}</Text>
        <View
          style={{
            width: 44,
            height: 26,
            borderRadius: radius.pill,
            backgroundColor: active ? colors.accent.primary : colors.glass.surfaceStrong,
            padding: 3,
            alignItems: active ? 'flex-end' : 'flex-start',
          }}
        >
          <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: colors.text.primary }} />
        </View>
      </View>
      <Text style={[typography.caption, { color: colors.text.secondary }]}>{description}</Text>
    </Pressable>
  );
}
