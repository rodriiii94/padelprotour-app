import { StyleSheet, Text } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function RankingScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Ranking</Text>
      <GlassPanel style={styles.card}>
        <Text style={styles.body}>
          Clasificación de tus categorías — pendiente de conectar a GET
          /categories/{'{category}'}/rankings.
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
