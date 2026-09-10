import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function PerfilScreen() {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Perfil</Text>
      <GlassPanel style={styles.card}>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </GlassPanel>
      <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.base,
  },
  name: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  email: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
