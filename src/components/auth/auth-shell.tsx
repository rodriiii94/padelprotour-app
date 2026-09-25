import { MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

/** Marco común de las pantallas de acceso: marca arriba, tarjeta con el formulario y enlace legal. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Screen>
      <View style={styles.wrap}>
        <View style={styles.brand}>
          <View style={styles.mark}>
            <MaterialIcons name="sports-tennis" size={34} color={Colors.onPrimary} />
          </View>
          <Text style={styles.wordmark}>PadelProTour</Text>
          <Text style={styles.tagline}>Tus ligas y torneos de pádel</Text>
        </View>

        <GlassPanel style={styles.card}>
          <View style={styles.heading}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {children}
        </GlassPanel>

        <View style={styles.footer}>
          {footer}
          <Link href="/privacidad" style={styles.legal}>
            Política de privacidad
          </Link>
        </View>
      </View>
    </Screen>
  );
}

/** Campo con su etiqueta encima. */
export function LabeledField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {children}
    </View>
  );
}

/** Contraseña con botón para mostrarla u ocultarla. */
export function PasswordField({
  value,
  onChangeText,
  autoComplete,
  onSubmitEditing,
}: {
  value: string;
  onChangeText: (value: string) => void;
  autoComplete: 'current-password' | 'new-password';
  onSubmitEditing?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.passwordWrap}>
      <TextField
        style={styles.passwordInput}
        placeholder="Tu contraseña"
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        hitSlop={10}
        accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        style={styles.eye}>
        <MaterialIcons
          name={visible ? 'visibility-off' : 'visibility'}
          size={20}
          color={Colors.onSurfaceVariant}
        />
      </Pressable>
    </View>
  );
}

/** Separador "o" entre el acceso con email y el acceso social. */
export function OrDivider() {
  // Sin Google configurado no hay nada al otro lado del separador.
  if (!process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) return null;

  return (
    <View style={styles.orRow}>
      <View style={styles.orLine} />
      <Text style={styles.orText}>o</Text>
      <View style={styles.orLine} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mark: {
    width: 68,
    height: 68,
    borderRadius: Radii.xl,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    ...Typography.display,
    fontSize: 30,
    lineHeight: 36,
    color: Colors.primary,
    textAlign: 'center',
  },
  tagline: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  card: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  heading: {
    gap: 4,
    marginBottom: Spacing.base,
  },
  title: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  field: {
    gap: 6,
  },
  label: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Colors.onSurfaceVariant,
  },
  passwordWrap: {
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eye: {
    position: 'absolute',
    right: Spacing.sm,
    zIndex: 2,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.glassBorder,
  },
  orText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  footer: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legal: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
});
