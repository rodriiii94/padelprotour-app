import { useMemo } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useIsNarrowWeb } from '@/hooks/use-is-narrow-web';
import { useColors } from '@/hooks/use-theme';
import { Spacing, type ColorPalette } from '@/theme/tokens';

/** Content column width on wide viewports — same prop signature as native, no per-screen tuning. */
const MAX_CONTENT_WIDTH = 880;

export function Screen({ style, children, ...rest }: ScrollViewProps) {
  const isNarrow = useIsNarrowWeb();
  const colors = useColors();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => makeStyles(colors, width, height), [colors, width, height]);

  // Móvil: sin ScrollView interno. Scrollea el documento (ver src/app/+html.tsx) para
  // que el navegador pueda esconder su barra de URL.
  if (isNarrow) {
    return (
      <View style={styles.root}>
        <Glows styles={styles} />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.scrollContent}>
            <View style={[styles.content, style]}>{children}</View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Glows styles={styles} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          {...rest}>
          <View style={[styles.content, style]}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

/**
 * Círculos de fondo, fijados al tamaño real de la ventana (no al contenedor): en la vista
 * móvil web es el documento el que crece con el contenido y hace scroll (ver más abajo), así
 * que un `top` en "%" o `StyleSheet.absoluteFill` sobre ese contenedor se calcularía sobre el
 * alto del contenido largo, no el de la pantalla, y el fondo saldría deformado.
 */
function Glows({ styles }: { styles: ReturnType<typeof makeStyles> }) {
  return (
    <View pointerEvents="none" style={styles.glowLayer}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />
      <View style={styles.glowTertiary} />
      <View style={styles.glowQuaternary} />
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
    scrollContent: {
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.lg,
      alignItems: 'center',
    },
    content: {
      width: '100%',
      maxWidth: MAX_CONTENT_WIDTH,
      alignSelf: 'center',
      gap: Spacing.lg,
    },
    glowLayer: {
      // `fixed` y `sticky` mantienen el fondo siempre a la vista, pero los dos le quitan a
      // Safari en iOS su desenfoque nativo bajo la barra de estado (sale sólido, no
      // difuminado). Con `absolute` sí desenfoca como siempre -- a cambio, en la vista móvil
      // (el documento entero hace scroll, `root` crece con el contenido) el fondo se queda
      // atrás y desaparece al bajar del todo en una página larga. Decisión: mejor eso que
      // perder el desenfoque.
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
