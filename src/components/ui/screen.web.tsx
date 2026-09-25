import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useIsNarrowWeb } from '@/hooks/use-is-narrow-web';
import { Colors, Spacing } from '@/theme/tokens';

/** Content column width on wide viewports — same prop signature as native, no per-screen tuning. */
const MAX_CONTENT_WIDTH = 880;

export function Screen({ style, children, ...rest }: ScrollViewProps) {
  const isNarrow = useIsNarrowWeb();

  // Móvil: sin ScrollView interno. Scrollea el documento (ver src/app/+html.tsx) para
  // que el navegador pueda esconder su barra de URL.
  if (isNarrow) {
    return (
      <View style={styles.root}>
        <Glows />
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
      <Glows />
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
 * Círculos de fondo. Van en una capa aparte que es la que recorta lo que sobresale:
 * si el recorte estuviera en un ancestro de los campos de texto, ese ancestro tendría
 * desborde horizontal oculto y el navegador lo desplazaría al enfocar un campo,
 * dejando la página movida a la izquierda con un hueco en blanco a la derecha.
 */
function Glows() {
  return (
    <View pointerEvents="none" style={styles.glowLayer}>
      <View style={styles.glowPrimary} />
      <View style={styles.glowSecondary} />
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
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
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
