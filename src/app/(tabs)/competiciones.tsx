import { StyleSheet, Text } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function CompeticionesScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Competiciones</Text>
      <GlassPanel style={styles.card}>
        <Text style={styles.body}>
          Listado de torneos y ligas — pendiente de conectar a GET /competitions.
        </Text>
      </GlassPanel>
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
  },
  body: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
