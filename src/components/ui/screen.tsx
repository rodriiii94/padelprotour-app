import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColors } from '@/hooks/use-theme';
import { Spacing, type ColorPalette } from '@/theme/tokens';

const TAB_BAR_CLEARANCE = 100;

export function Screen({ style, children, ...rest }: ScrollViewProps) {
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(colors, width, height), [colors, width, height]);

  return (
    <View style={styles.root}>
      {/*
        Tamaño en píxeles de la ventana, no en porcentaje del contenido: los círculos van
        fuera del ScrollView (no se desplazan), pero un `top` en "%" se calcula sobre la
        altura del contenedor -- y esa altura puede acabar siendo la del contenido largo,
        no la de la pantalla, deformando el fondo.
      */}
      <View pointerEvents="none" style={styles.glowLayer}>
        <View style={styles.glowPrimary} />
        <View style={styles.glowSecondary} />
        <View style={styles.glowTertiary} />
        <View style={styles.glowQuaternary} />
      </View>
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

const makeStyles = (colors: ColorPalette, width: number, height: number) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
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
    glowLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height,
      overflow: 'hidden',
    },
    glowPrimary: {
      position: 'absolute',
      width: 400,
      height: 400,
      borderRadius: 200,
      top: -100,
      left: -100,
      backgroundColor: colors.primaryContainer,
      opacity: 0.12,
    },
    glowSecondary: {
      position: 'absolute',
      width: 300,
      height: 300,
      borderRadius: 150,
      top: height * 0.25,
      right: -150,
      backgroundColor: colors.secondaryContainer,
      opacity: 0.08,
    },
    glowTertiary: {
      position: 'absolute',
      width: 260,
      height: 260,
      borderRadius: 130,
      top: height * 0.68,
      left: -90,
      backgroundColor: colors.primaryContainer,
      opacity: 0.07,
    },
    glowQuaternary: {
      position: 'absolute',
      width: 200,
      height: 200,
      borderRadius: 100,
      top: height * 0.55,
      right: -70,
      backgroundColor: colors.secondaryContainer,
      opacity: 0.06,
    },
  });
