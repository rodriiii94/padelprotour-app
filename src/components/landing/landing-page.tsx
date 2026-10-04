import { MaterialIcons } from '@expo/vector-icons';
import { useMemo, type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useIsNarrowWeb } from '@/hooks/use-is-narrow-web';
import { useColors } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

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
 */
export function LandingPage() {
  const colors = useColors();
  const isNarrow = useIsNarrowWeb();
  const styles = useMemo(() => makeStyles(colors, isNarrow), [colors, isNarrow]);

  return (
    <Screen>
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
    </Screen>
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

const makeStyles = (colors: ColorPalette, isNarrow: boolean) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    brand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      flexShrink: 1,
    },
    mark: {
      width: isNarrow ? 32 : 38,
      height: isNarrow ? 32 : 38,
      borderRadius: Radii.md,
      backgroundColor: colors.primaryContainer,
      alignItems: 'center',
      justifyContent: 'center',
    },
    wordmark: {
      fontFamily: FontFamilies.display,
      fontSize: isNarrow ? 16 : 20,
      color: colors.primary,
    },
    hero: {
      flexDirection: isNarrow ? 'column' : 'row',
      alignItems: isNarrow ? 'stretch' : 'center',
      gap: Spacing.lg,
      paddingVertical: isNarrow ? Spacing.sm : Spacing.lg,
    },
    heroText: {
      flex: isNarrow ? undefined : 1.2,
      gap: Spacing.sm,
    },
    heroTitle: {
      ...(isNarrow ? Typography.headlineLg : Typography.display),
      color: colors.primary,
    },
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
      flex: isNarrow ? undefined : 1,
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
      flexBasis: isNarrow ? '100%' : '30%',
      flexGrow: 1,
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
      flexDirection: isNarrow ? 'column' : 'row',
      gap: Spacing.sm,
    },
    step: {
      flex: isNarrow ? undefined : 1,
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
