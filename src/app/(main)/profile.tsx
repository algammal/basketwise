import React from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { UserRound, Store, Bell, Accessibility } from 'lucide-react-native';
import { MainLayout } from '../../layouts/MainLayout';
import { GlassCard } from '../../components/glass/GlassCard';
import { SectionHeader } from '../../components/common/SectionHeader';
import { colors, radius, spacing, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setNotificationsEnabled, setReduceMotion, setCurrency } from '../../store/slices/preferencesSlice';
import { SAMPLE_SUPERMARKETS } from '../../constants/supermarkets';
import { SupermarketLogo } from '../../components/common/SupermarketLogo';
import type { CurrencyCode } from '../../types/entities';

const CURRENCIES: CurrencyCode[] = ['EGP', 'USD', 'EUR'];

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const preferences = useAppSelector((state) => state.preferences);

  return (
    <MainLayout>
      <Text style={[typography.heading1, { color: colors.text.primary, marginBottom: spacing.lg }]}>Profile</Text>

      <GlassCard elevated style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: radius.pill,
              backgroundColor: colors.accent.primaryMuted,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <UserRound size={28} color={colors.accent.primary} />
          </View>
          <View>
            <Text style={[typography.heading3, { color: colors.text.primary }]}>{user?.name ?? 'Guest'}</Text>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>{user?.email ?? 'No email set'}</Text>
          </View>
        </View>
      </GlassCard>

      <SectionHeader title="Currency" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {CURRENCIES.map((currency) => (
            <Pressable
              key={currency}
              onPress={() => dispatch(setCurrency(currency))}
              style={{
                flex: 1,
                paddingVertical: spacing.sm,
                borderRadius: radius.md,
                alignItems: 'center',
                backgroundColor: preferences.currency === currency ? colors.accent.primaryMuted : colors.glass.surface,
                borderWidth: 1,
                borderColor: preferences.currency === currency ? colors.accent.primary : colors.glass.border,
              }}
            >
              <Text style={[typography.bodyStrong, { color: colors.text.primary }]}>{currency}</Text>
            </Pressable>
          ))}
        </View>
      </GlassCard>

      <SectionHeader title="Supermarkets" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        {SAMPLE_SUPERMARKETS.map((sm) => (
          <View key={sm.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
            <SupermarketLogo supermarketId={sm.id} size={28} />
            <Text style={[typography.body, { color: colors.text.primary }]}>{sm.name}</Text>
          </View>
        ))}
      </GlassCard>

      <SectionHeader title="Preferences" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        <SettingRow
          icon={<Bell size={18} color={colors.text.secondary} />}
          label="Notifications"
          value={preferences.notificationsEnabled}
          onChange={(value) => dispatch(setNotificationsEnabled(value))}
        />
        <SettingRow
          icon={<Accessibility size={18} color={colors.text.secondary} />}
          label="Reduce motion"
          value={preferences.reduceMotion}
          onChange={(value) => dispatch(setReduceMotion(value))}
        />
      </GlassCard>

      <SectionHeader title="About" />
      <GlassCard style={{ marginBottom: spacing.xl }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Store size={18} color={colors.text.secondary} />
          <Text style={[typography.caption, { color: colors.text.secondary, flex: 1 }]}>
            BasketWise v1.0.0 — household financial intelligence, not an ecommerce app.
          </Text>
        </View>
      </GlassCard>
    </MainLayout>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {icon}
        <Text style={[typography.body, { color: colors.text.primary }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.glass.surfaceStrong, true: colors.accent.primary }}
        thumbColor={colors.text.primary}
      />
    </View>
  );
}
