import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/theme/tokens';

const TAB_BAR_CLEARANCE = 100;

export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <View style={styles.root}>
      <View style={[styles.glowPrimary]} />
      <View style={[styles.glowSecondary]} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[styles.content, style]}
          showsVerticalScrollIndicator={false}
          {...rest}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.safeMargin,
    paddingTop: Spacing.sm,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: Spacing.lg,
  },
  glowPrimary: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    top: -100,
    left: -100,
    backgroundColor: Colors.primaryContainer,
    opacity: 0.12,
  },
  glowSecondary: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    top: '25%',
    right: -150,
    backgroundColor: Colors.secondaryContainer,
    opacity: 0.08,
  },
});
