import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera as CameraIcon, Image as ImageIcon, X, Check, Trash2 } from 'lucide-react-native';
import { colors, radius, spacing, typography } from '../theme';
import { GlassButton } from '../components/glass/GlassButton';
import { LoadingState } from '../components/common/LoadingState';
import { SAMPLE_SUPERMARKETS } from '../constants/supermarkets';
import { ocrService, type OcrExtractedItem } from '../services/ocr';
import { useAppDispatch } from '../store/hooks';
import { addReceipt } from '../store/slices/receiptSlice';
import { validateReceiptDraft, calculateReceiptTotal } from '../utils/validation/receipt';
import { formatCurrency } from '../utils/formatting/currency';

type ScanStep = 'capture' | 'processing' | 'review';

export default function ScanReceiptScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<ScanStep>('capture');
  const [supermarketId, setSupermarketId] = useState<string>(SAMPLE_SUPERMARKETS[0].id);
  const [items, setItems] = useState<OcrExtractedItem[]>([]);
  const [ocrSource, setOcrSource] = useState<'mock' | 'provider' | null>(null);

  const processImage = async (imageUri: string) => {
    setStep('processing');
    const result = await ocrService.recognizeReceipt(imageUri);
    setOcrSource(result.source);
    if (result.supermarketNameGuess) {
      const match = SAMPLE_SUPERMARKETS.find((s) => s.name.toLowerCase() === result.supermarketNameGuess?.toLowerCase());
      if (match) setSupermarketId(match.id);
    }
    setItems(result.items);
    setStep('review');
  };

  const handleCapture = async () => {
    // Expo Go / simulators without a camera stream still exercise the OCR flow with a placeholder URI.
    await processImage('captured-receipt.jpg');
  };

  const handlePickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (result.canceled || !result.assets?.[0]) return;
    await processImage(result.assets[0].uri);
  };

  const updateItem = (index: number, changes: Partial<OcrExtractedItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const draftItems = items.map((item) => ({
      rawName: item.rawName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discountAmount: item.discountAmount,
    }));
    const errors = validateReceiptDraft({ supermarketId, purchaseDate: new Date().toISOString(), items: draftItems });
    if (errors.length > 0) {
      Alert.alert('Check the details', errors[0].message);
      return;
    }

    const receiptId = `r-${Date.now()}`;
    const total = calculateReceiptTotal(draftItems);
    dispatch(
      addReceipt({
        receipt: {
          id: receiptId,
          supermarketId,
          purchaseDate: new Date().toISOString().slice(0, 10),
          totalAmount: total,
          currency: 'EGP',
          status: 'confirmed',
          itemCount: items.length,
          createdAt: new Date().toISOString(),
        },
        items: draftItems.map((item, index) => ({
          id: `${receiptId}-item-${index}`,
          receiptId,
          rawName: item.rawName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountAmount: item.discountAmount,
          lineTotal: item.unitPrice * item.quantity - item.discountAmount,
        })),
      }),
    );
    router.replace('/(main)/receipts');
  };

  if (step === 'processing') {
    return (
      <View style={styles.centered}>
        <LoadingState label="Reading your receipt…" />
      </View>
    );
  }

  if (step === 'review') {
    return (
      <View style={styles.flex}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.lg, paddingBottom: spacing.xxxl }}>
          <View style={styles.headerRow}>
            <Text style={[typography.heading1, { color: colors.text.primary }]}>Review receipt</Text>
            <Pressable onPress={() => setStep('capture')} accessibilityRole="button" accessibilityLabel="Cancel">
              <X size={24} color={colors.text.secondary} />
            </Pressable>
          </View>

          {ocrSource === 'mock' ? (
            <View style={styles.mockBanner}>
              <Text style={[typography.caption, { color: colors.semantic.warning }]}>
                Development preview: this used sample recognition data, not a real OCR provider. Review every field before saving.
              </Text>
            </View>
          ) : null}

          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: spacing.sm }]}>Supermarket</Text>
          <View style={styles.supermarketRow}>
            {SAMPLE_SUPERMARKETS.map((sm) => (
              <Pressable
                key={sm.id}
                onPress={() => setSupermarketId(sm.id)}
                style={[styles.supermarketChip, supermarketId === sm.id && styles.supermarketChipActive]}
              >
                <Text style={[typography.caption, { color: supermarketId === sm.id ? colors.text.primary : colors.text.secondary }]}>
                  {sm.name}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[typography.caption, { color: colors.text.secondary, marginTop: spacing.lg, marginBottom: spacing.sm }]}>
            Items ({items.length})
          </Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <TextInput
                value={item.rawName}
                onChangeText={(text) => updateItem(index, { rawName: text })}
                style={[styles.input, { flex: 1 }, typography.body, { color: colors.text.primary }]}
                placeholderTextColor={colors.text.tertiary}
              />
              <TextInput
                value={String(item.quantity)}
                onChangeText={(text) => updateItem(index, { quantity: Number(text) || 0 })}
                keyboardType="numeric"
                style={[styles.input, styles.inputSmall, typography.body, { color: colors.text.primary }]}
              />
              <TextInput
                value={String(item.unitPrice)}
                onChangeText={(text) => updateItem(index, { unitPrice: Number(text) || 0 })}
                keyboardType="decimal-pad"
                style={[styles.input, styles.inputSmall, typography.body, { color: colors.text.primary }]}
              />
              <Pressable onPress={() => removeItem(index)} accessibilityRole="button" accessibilityLabel="Remove item">
                <Trash2 size={18} color={colors.semantic.danger} />
              </Pressable>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>Total</Text>
            <Text style={[typography.financialMedium, { color: colors.text.primary }]}>
              {formatCurrency(calculateReceiptTotal(items))}
            </Text>
          </View>

          <GlassButton label="Save receipt" onPress={handleConfirm} variant="primary" icon={<Check size={18} color={colors.accent.primary} />} style={{ marginTop: spacing.xl }} />
        </ScrollView>
      </View>
    );
  }

  if (!permission) {
    return <View style={styles.flex} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, { padding: spacing.xl }]}>
        <Text style={[typography.heading3, { color: colors.text.primary, textAlign: 'center', marginBottom: spacing.md }]}>
          Camera access needed
        </Text>
        <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.lg }]}>
          BasketWise scans your receipts to build your price history. You can also upload a photo instead.
        </Text>
        <GlassButton label="Grant camera access" onPress={requestPermission} variant="primary" />
        <GlassButton label="Upload from gallery" onPress={handlePickFromGallery} variant="secondary" style={{ marginTop: spacing.md }} />
        <GlassButton label="Cancel" onPress={() => router.back()} variant="ghost" style={{ marginTop: spacing.md }} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView style={styles.flex} facing="back">
        <View style={[styles.overlay, { paddingTop: insets.top + spacing.md }]}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close scanner" style={styles.closeButton}>
            <X size={22} color={colors.text.primary} />
          </Pressable>
        </View>
        <View style={styles.guideFrame} pointerEvents="none" />
        <View style={[styles.controls, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Pressable onPress={handlePickFromGallery} accessibilityRole="button" accessibilityLabel="Upload from gallery" style={styles.secondaryControl}>
            <ImageIcon size={22} color={colors.text.primary} />
          </Pressable>
          <Pressable onPress={handleCapture} accessibilityRole="button" accessibilityLabel="Capture receipt" style={styles.captureButton}>
            <CameraIcon size={28} color={colors.text.inverse} />
          </Pressable>
          <View style={styles.secondaryControl} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background.primary },
  overlay: { paddingHorizontal: spacing.lg },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideFrame: {
    position: 'absolute',
    top: '20%',
    left: '8%',
    right: '8%',
    bottom: '28%',
    borderWidth: 2,
    borderColor: colors.accent.primary,
    borderRadius: radius.lg,
    opacity: 0.8,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xl,
  },
  secondaryControl: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: radius.pill,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  mockBanner: {
    backgroundColor: colors.semantic.warningMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  supermarketRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  supermarketChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  supermarketChipActive: {
    backgroundColor: colors.accent.primaryMuted,
    borderColor: colors.accent.primary,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.glass.surface,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  inputSmall: {
    width: 64,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
  },
});
