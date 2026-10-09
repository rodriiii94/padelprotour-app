import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View, type TextStyle, type ViewStyle } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { useColors } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

/** Id del contenedor de la presentación y clase que la oculta; los usa también +html.tsx. */
export const LANDING_ID = 'landing';
export const HIDE_LANDING_CLASS = 'hide-landing';

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  {
    icon: 'emoji-events',
    title: 'Ligas y torneos',
    body: 'Crea tu competición en un minuto, pública o privada, con las categorías que quieras.',
  },
  {
    icon: 'event',
    title: 'Calendario automático',
    body: 'Todos contra todos, a una vuelta o ida y vuelta. Las jornadas se generan solas.',
  },
  {
    icon: 'fact-check',
    title: 'Resultados sin discusiones',
    body: 'Un jugador apunta el marcador y un rival lo confirma. Nadie se inventa un 6-0.',
  },
  {
    icon: 'leaderboard',
    title: 'Clasificación al día',
    body: 'Se recalcula con cada resultado, con desempates por enfrentamiento directo, sets y juegos.',
  },
  {
    icon: 'place',
    title: 'Reserva y chat de partido',
    body: 'Apunta día, hora y club, enlaza el partido de Playtomic y queda con tus rivales en el chat.',
  },
  {
    icon: 'person',
    title: 'Tu perfil de jugador',
    body: 'Estadísticas, rachas, logros y tu compañero habitual. Sigue a otros jugadores.',
  },
];

const STEPS = [
  { title: 'Crea la competición', body: 'Elige liga o torneo, ponle nombre y añade una categoría.' },
  { title: 'Invita con un enlace', body: 'Compártelo por WhatsApp. Cada pareja se apunta desde su móvil.' },
  { title: 'Jugad y apuntad', body: 'El calendario y la clasificación se actualizan solos.' },
];

const SAMPLE_STANDINGS = [
  { name: 'Los Cracks', points: 9 },
  { name: 'Bandeja Team', points: 6 },
  { name: 'Víbora Club', points: 3 },
];

/**
 * Página de presentación para quien llega sin sesión a la raíz de la web. Los enlaces son
 * `href` reales (recarga completa): aquí todavía no hay ningún navegador montado.
 *
 * Va escrita en el HTML estático de "/" para que los buscadores la lean sin ejecutar
 * JavaScript, así que tiene que pintarse igual en el servidor que en el navegador: nada de
 * leer el ancho de la ventana (por eso no usa `Screen`). El diseño se adapta solo con
 * `flexWrap` y unidades CSS (`vh`, `clamp`), que react-native-web pasa tal cual.
 */
export function LandingPage() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={styles.root}>
      <View pointerEvents="none" style={styles.glowLayer}>
        <View style={[styles.glow, styles.glowPrimary]} />
        <View style={[styles.glow, styles.glowSecondary]} />
        <View style={[styles.glow, styles.glowTertiary]} />
      </View>
      <View style={styles.scroller}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brand}>
              <View style={styles.mark}>
                <MaterialIcons name="sports-tennis" size={22} color={colors.onPrimary} />
              </View>
              <Text style={styles.wordmark}>PadelProTour</Text>
            </View>
            <LinkButton href="/login" label="Iniciar sesión" variant="outline" compact styles={styles} />
          </View>

          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text role="heading" aria-level={1} style={styles.heroTitle}>
                Tu liga de pádel, sin hojas de cálculo
              </Text>
              <Text style={styles.heroSubtitle}>
                Organiza ligas y torneos con tus amigos: inscripciones, calendario, resultados y
                clasificación en un solo sitio, desde el móvil o el ordenador.
              </Text>
              <View style={styles.ctaRow}>
                <LinkButton href="/register" label="Crear cuenta" variant="primary" styles={styles} />
                <LinkButton href="/login" label="Ya tengo cuenta" variant="outline" styles={styles} />
              </View>
            </View>

            <GlassPanel style={styles.preview}>
              <View style={styles.previewHeader}>
                <MaterialIcons name="leaderboard" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.previewLabel}>CLASIFICACIÓN · EJEMPLO</Text>
              </View>
              {SAMPLE_STANDINGS.map((row, index) => (
                <View key={row.name} style={[styles.previewRow, index > 0 && styles.previewRowBorder]}>
                  <Text style={styles.previewPosition}>{index + 1}</Text>
                  <Text style={styles.previewName}>{row.name}</Text>
                  <Text style={styles.previewPoints}>{row.points} pts</Text>
                </View>
              ))}
              <View style={styles.previewMatch}>
                <Text style={styles.previewMatchLabel}>Último resultado</Text>
                <Text style={styles.previewMatchScore}>Los Cracks 6-3 · 7-5 Bandeja Team</Text>
              </View>
            </GlassPanel>
          </View>

          <View style={styles.section}>
            <Text role="heading" aria-level={2} style={styles.sectionTitle}>
              Todo lo que necesita tu liga
            </Text>
            <View style={styles.grid}>
              {FEATURES.map((feature) => (
                <GlassPanel key={feature.title} style={styles.feature}>
                  <MaterialIcons name={feature.icon} size={26} color={colors.primaryContainer} />
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureBody}>{feature.body}</Text>
                </GlassPanel>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text role="heading" aria-level={2} style={styles.sectionTitle}>
              Cómo funciona
            </Text>
            <View style={styles.steps}>
              {STEPS.map((step, index) => (
                <View key={step.title} style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepText}>
                    <Text style={styles.featureTitle}>{step.title}</Text>
                    <Text style={styles.featureBody}>{step.body}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <GlassPanel style={styles.closing}>
            <Text role="heading" aria-level={2} style={styles.sectionTitle}>
              ¿Montamos la tuya?
            </Text>
            <Text style={styles.heroSubtitle}>Crea tu cuenta y ten la liga lista antes del próximo partido.</Text>
            <LinkButton href="/register" label="Crear cuenta" variant="primary" styles={styles} />
          </GlassPanel>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© {new Date().getFullYear()} PadelProTour</Text>
            <Text {...linkProps('/privacidad')} style={styles.footerLink}>
              Política de privacidad
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

/** `href` hace que react-native-web pinte un `<a>` real; los tipos de RN no lo conocen. */
function linkProps(href: string): object {
  return { href, role: 'link' };
}

function LinkButton({
  href,
  label,
  variant,
  compact = false,
  styles,
}: {
  href: string;
  label: string;
  variant: 'primary' | 'outline';
  /** Versión pequeña para la cabecera, que en móvil comparte fila con la marca. */
  compact?: boolean;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <Pressable
      {...linkProps(href)}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' ? styles.buttonPrimary : styles.buttonOutline,
        compact && styles.buttonCompact,
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.buttonLabel, variant === 'primary' ? styles.buttonLabelPrimary : styles.buttonLabelOutline]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** Valores CSS que react-native-web acepta pero los tipos de React Native no conocen. */
const css = <T extends ViewStyle | TextStyle>(style: Record<string, unknown>) => style as T;

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Misma idea que en `Screen`: los círculos ocupan una pantalla y no dependen del alto
    // del contenido (aquí con `vh` en vez de medir la ventana).
    glowLayer: css<ViewStyle>({
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
    }),
    glow: {
      position: 'absolute',
      borderRadius: Radii.full,
    },
    glowPrimary: {
      width: 400,
      height: 400,
      top: -100,
      left: -100,
      backgroundColor: colors.primaryContainer,
      opacity: 0.12,
    },
    glowSecondary: css<ViewStyle>({
      width: 300,
      height: 300,
      top: '25vh',
      right: -150,
      backgroundColor: colors.secondaryContainer,
      opacity: 0.08,
    }),
    glowTertiary: css<ViewStyle>({
      width: 260,
      height: 260,
      top: '68vh',
      left: -90,
      backgroundColor: colors.primaryContainer,
      opacity: 0.07,
    }),
    // En escritorio el documento no hace scroll (ver +html.tsx): lo hace este contenedor.
    // En móvil no tiene alto fijo, crece con el contenido y hace scroll el documento.
    scroller: css<ViewStyle>({
      flex: 1,
      overflowY: 'auto',
    }),
    content: css<ViewStyle>({
      width: '100%',
      maxWidth: 880 + Spacing.lg * 2,
      alignSelf: 'center',
      paddingHorizontal: 'clamp(20px, 5vw, 32px)',
      paddingTop: 'max(24px, env(safe-area-inset-top))',
      paddingBottom: Spacing.lg,
      gap: Spacing.lg,
    }),
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.xs,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flexShrink: 1,
    },
    mark: {
      width: 34,
      height: 34,
      borderRadius: Radii.md,
      backgroundColor: colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wordmark: css<TextStyle>({
      fontFamily: FontFamilies.display,
      fontSize: 'clamp(16px, 4.4vw, 20px)',
      color: colors.primary,
    }),
    hero: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: Spacing.lg,
      paddingVertical: Spacing.sm,
    },
    heroText: {
      flexBasis: 360,
      flexGrow: 1.2,
      flexShrink: 1,
      gap: Spacing.sm,
    },
    heroTitle: css<TextStyle>({
      fontFamily: FontFamilies.display,
      fontSize: 'clamp(32px, 5.2vw, 42px)',
      lineHeight: '1.12',
      color: colors.primary,
    }),
    heroSubtitle: {
      ...Typography.bodyLg,
      color: colors.onSurfaceVariant,
    },
    ctaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
      marginTop: Spacing.xs,
    },
    button: {
      borderRadius: Radii.md,
      paddingVertical: 12,
      paddingHorizontal: Spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      alignSelf: 'flex-start',
    },
    buttonCompact: {
      paddingVertical: 8,
      paddingHorizontal: Spacing.sm,
      flexShrink: 0,
    },
    buttonPrimary: {
      backgroundColor: colors.primaryContainer,
      borderColor: colors.primaryContainer,
    },
    buttonOutline: {
      backgroundColor: colors.glassFill,
      borderColor: colors.glassBorder,
    },
    buttonLabel: {
      fontFamily: FontFamilies.headline,
      fontSize: 15,
    },
    buttonLabelPrimary: {
      color: colors.onPrimary,
    },
    buttonLabelOutline: {
      color: colors.onSurface,
    },
    pressed: {
      opacity: 0.75,
    },
    preview: {
      flexBasis: 280,
      flexGrow: 1,
      flexShrink: 1,
      padding: Spacing.sm,
    },
    previewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: Spacing.xs,
    },
    previewLabel: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 11,
      letterSpacing: 1.2,
      color: colors.onSurfaceVariant,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      paddingVertical: 10,
    },
    previewRowBorder: {
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
    },
    previewPosition: {
      fontFamily: FontFamilies.headline,
      fontSize: 16,
      width: 20,
      color: colors.primaryContainer,
    },
    previewName: {
      ...Typography.bodyMd,
      flex: 1,
      color: colors.onSurface,
    },
    previewPoints: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 14,
      color: colors.onSurface,
    },
    previewMatch: {
      marginTop: Spacing.xs,
      paddingTop: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
      gap: 2,
    },
    previewMatchLabel: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    previewMatchScore: {
      ...Typography.bodySm,
      color: colors.onSurface,
    },
    section: {
      gap: Spacing.sm,
    },
    sectionTitle: {
      ...Typography.headlineMd,
      color: colors.primary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    feature: {
      flexBasis: 240,
      flexGrow: 1,
      flexShrink: 1,
      padding: Spacing.sm,
      gap: Spacing.xs,
    },
    featureTitle: {
      ...Typography.headlineSm,
      fontSize: 17,
      lineHeight: 24,
      color: colors.onSurface,
    },
    featureBody: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    steps: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    step: {
      flexBasis: 230,
      flexGrow: 1,
      flexShrink: 1,
      flexDirection: 'row',
      gap: Spacing.xs,
    },
    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: Radii.full,
      borderWidth: 1,
      borderColor: colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumberText: {
      fontFamily: FontFamilies.headline,
      fontSize: 15,
      color: colors.primaryContainer,
    },
    stepText: {
      flex: 1,
      gap: 2,
    },
    closing: {
      padding: Spacing.md,
      gap: Spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: Spacing.xs,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
    },
    footerText: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    footerLink: {
      ...Typography.bodySm,
      color: colors.primaryContainer,
    },
  });
