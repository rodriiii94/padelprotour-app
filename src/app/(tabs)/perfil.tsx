import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { PlayerProfileView } from '@/components/profile/player-profile-view';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-label';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerProfile } from '@/hooks/use-player-profile';
import { useColors, useTheme, type ThemePreference } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { preference, setPreference } = useTheme();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Screen>
      {user ? <MyProfile userId={user.id} /> : null}
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.section}>
        <SectionLabel icon="brightness-6" label="Apariencia" />
        <SegmentedControl<ThemePreference>
          options={[
            { value: 'system', label: 'Sistema' },
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Oscuro' },
          ]}
          value={preference}
          onChange={(value) => value && setPreference(value)}
        />
      </View>

      <Button title="Editar perfil" onPress={() => router.push('/editar-perfil')} />
      <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
      <Button title="Política de privacidad" variant="ghost" onPress={() => router.push('/privacidad')} />
      <Button title="Eliminar cuenta" variant="ghost" onPress={() => router.push('/eliminar-cuenta')} />
    </Screen>
  );
}

/** Tu ficha pública, tal como la ven los demás (menos el email, que solo ves tú). */
function MyProfile({ userId }: { userId: number }) {
  const { profile, isLoading, error, refetch } = usePlayerProfile(userId);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  // Al volver de editar el perfil, la ficha se refresca sola.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <>
      {isLoading && !profile ? (
        <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />
      ) : null}
      {error ? (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      ) : null}
      {profile ? <PlayerProfileView profile={profile} /> : null}
    </>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    spinner: {
      marginTop: Spacing.lg,
    },
    card: {
      padding: Spacing.sm,
    },
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    email: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },
    section: {
      gap: Spacing.xs,
    },
  });
