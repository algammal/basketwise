import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface MainLayoutProps {
  children: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
}

/**
 * Shared screen chrome for every (main) tab: dark background, horizontal
 * padding, safe-area top inset, and bottom padding tall enough that content
 * never sits under the floating circular-nav button.
 */
export function MainLayout({ children, scrollable = true, contentContainerStyle }: MainLayoutProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = insets.bottom + 140;
  const topPadding = insets.top + spacing.md;

  if (!scrollable) {
    return (
      <View style={[styles.flexBackground, { paddingTop: topPadding, paddingBottom: bottomPadding, paddingHorizontal: spacing.lg }]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flexBackground}
      contentContainerStyle={[
        { paddingTop: topPadding, paddingBottom: bottomPadding, paddingHorizontal: spacing.lg },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flexBackground: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
