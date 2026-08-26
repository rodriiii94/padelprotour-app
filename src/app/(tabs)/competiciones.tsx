import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, Text } from 'react-native';

import { CompetitionCard } from '@/components/ui/competition-card';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useCompetitions } from '@/hooks/use-competitions';
import { Colors, Spacing, Typography } from '@/theme/tokens';

export default function CompeticionesScreen() {
  const { competitions, isLoading, isLoadingMore, hasMore, error, refetch, loadMore } =
    useCompetitions();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return (
    <Screen
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refetch}
          tintColor={Colors.primaryContainer}
        />
      }>
      <Text style={styles.title}>Competiciones</Text>

      {isLoading && competitions.length === 0 && (
        <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />
      )}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
          <Button title="Reintentar" variant="secondary" onPress={refetch} />
        </GlassPanel>
      )}

      {!isLoading && !error && competitions.length === 0 && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>No hay competiciones activas en este momento.</Text>
        </GlassPanel>
      )}

      {competitions.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} />
      ))}

      {hasMore && !isLoading && (
        <Button
          title={isLoadingMore ? 'Cargando…' : 'Cargar más'}
          variant="secondary"
          onPress={loadMore}
          disabled={isLoadingMore}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    ...Typography.headlineMd,
    color: Colors.primary,
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  body: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
