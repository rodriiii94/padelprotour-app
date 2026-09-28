import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { CompetitionCard } from '@/components/ui/competition-card';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useCompetitions } from '@/hooks/use-competitions';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

export default function CompeticionesScreen() {
  const { competitions, isLoading, isLoadingMore, hasMore, error, refetch, loadMore } =
    useCompetitions();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
          tintColor={colors.primaryContainer}
        />
      }>
      <Text style={styles.title}>Competiciones</Text>

      {isLoading && competitions.length === 0 && (
        <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />
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

      <View style={styles.cardsGrid}>
        {competitions.map((competition) => (
          <View key={competition.id} style={styles.cardsGridItem}>
            <CompetitionCard competition={competition} />
          </View>
        ))}
      </View>

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

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    title: {
      ...Typography.headlineMd,
      color: colors.primary,
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
      color: colors.onSurfaceVariant,
    },
    cardsGrid:
      Platform.OS === 'web'
        ? { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }
        : { gap: Spacing.lg },
    cardsGridItem: Platform.OS === 'web' ? { width: 320 } : {},
  });
