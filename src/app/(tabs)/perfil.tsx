import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';

import { PlayerProfileView } from '@/components/profile/player-profile-view';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { usePlayerProfile } from '@/hooks/use-player-profile';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function PerfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <Screen>
      {user ? <MyProfile userId={user.id} /> : null}
      <Text style={styles.email}>{user?.email}</Text>
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

  // Al volver de editar el perfil, la ficha se refresca sola.
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <>
      {isLoading && !profile ? (
        <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />
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

const styles = StyleSheet.create({
  spinner: {
    marginTop: Spacing.lg,
  },
  card: {
    padding: Spacing.sm,
  },
  body: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  email: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
});
