import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { ReceiptTransaction } from '../../components/receipts/ReceiptTransaction';
import { FinancialMetric } from '../../components/financial/FinancialMetric';
import { getSupermarketName } from '../../components/common/SupermarketLogo';
import { colors, spacing, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteReceipt } from '../../store/slices/receiptSlice';
import { formatCurrency } from '../../utils/formatting/currency';
import { formatReceiptDate } from '../../utils/formatting/date';
import { getTotalActualSpending } from '../../utils/finance/spending';

export default function ReceiptsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const receipts = useAppSelector((state) => state.receipts.receipts);
  const itemsByReceiptId = useAppSelector((state) => state.receipts.itemsByReceiptId);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

  const totalThisList = getTotalActualSpending(receipts);

  const handleDelete = (id: string) => {
    Alert.alert('Delete receipt?', 'This removes the receipt and its line items. Price history already recorded stays intact.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => dispatch(deleteReceipt(id)) },
    ]);
  };

  return (
    <MainLayout>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <Text style={[typography.heading1, { color: colors.text.primary }]}>Receipts</Text>
        <Pressable onPress={() => router.push('/scan')} accessibilityRole="button" accessibilityLabel="Scan a new receipt">
          <Plus size={24} color={colors.accent.primary} />
        </Pressable>
      </View>

      <GlassCard style={{ marginBottom: spacing.xl }}>
        <FinancialMetric label={`${receipts.length} confirmed receipts`} amount={totalThisList} size="medium" />
      </GlassCard>

      <SectionHeader title="All receipts" />
      {receipts.length === 0 ? (
        <EmptyState
          title="No receipts yet"
          message="Scan your first supermarket receipt to start tracking prices."
          actionLabel="Scan Receipt"
          onActionPress={() => router.push('/scan')}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {receipts.map((receipt) => {
            const isExpanded = expandedReceiptId === receipt.id;
            const items = itemsByReceiptId[receipt.id] ?? [];
            return (
              <GlassCard key={receipt.id} padding={0}>
                <ReceiptTransaction
                  receipt={receipt}
                  onPress={() => setExpandedReceiptId(isExpanded ? null : receipt.id)}
                />
                {isExpanded ? (
                  <View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, gap: spacing.sm }}>
                    {items.map((item) => (
                      <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={[typography.body, { color: colors.text.primary }]} numberOfLines={1}>
                          {item.quantity} × {item.rawName}
                        </Text>
                        <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>
                          {formatCurrency(item.lineTotal)}
                        </Text>
                      </View>
                    ))}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs }}>
                      <Text style={[typography.caption, { color: colors.text.tertiary }]}>
                        {getSupermarketName(receipt.supermarketId)} · {formatReceiptDate(receipt.purchaseDate)}
                      </Text>
                      <Pressable
                        onPress={() => handleDelete(receipt.id)}
                        accessibilityRole="button"
                        accessibilityLabel="Delete receipt"
                      >
                        <Trash2 size={18} color={colors.semantic.danger} />
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </GlassCard>
            );
          })}
        </View>
      )}
    </MainLayout>
  );
}
