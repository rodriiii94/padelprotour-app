import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { searchCompetitions } from '@/api/competitions';
import { searchUsers } from '@/api/categories';
import type { Competition, PublicUserSummary } from '@/api/types';
import { CompetitionCard } from '@/components/ui/competition-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { PlayerRow } from '@/components/ui/player-row';
import { Screen } from '@/components/ui/screen';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

type Kind = 'players' | 'competitions';

const MIN_QUERY = 2;
const DEBOUNCE_MS = 350;

/** Buscador de jugadores (por nombre) y de competiciones públicas (por nombre o sede). */
export default function BuscarScreen() {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const [kind, setKind] = useState<Kind>('players');
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState<PublicUserSummary[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const term = query.trim();
  const canSearch = term.length >= MIN_QUERY;

  useEffect(() => {
    if (!canSearch) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setError(null);
      try {
        if (kind === 'players') {
          const result = await searchUsers(term);
          if (!cancelled) setPlayers(result);
        } else {
          const result = await searchCompetitions(term);
          if (!cancelled) setCompetitions(result.data);
        }
      } catch {
        if (!cancelled) setError('No se pudo buscar. Inténtalo de nuevo.');
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term, kind, canSearch]);

  const results = kind === 'players' ? players : competitions;

  return (
    <Screen>
      <Text style={styles.title}>Buscar</Text>

      <TextField
        value={query}
        onChangeText={setQuery}
        placeholder={kind === 'players' ? 'Nombre del jugador' : 'Nombre o sede de la competición'}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      <SegmentedControl<Kind>
        options={[
          { value: 'players', label: 'Jugadores' },
          { value: 'competitions', label: 'Competiciones' },
        ]}
        value={kind}
        onChange={(value) => value && setKind(value)}
      />

      {!canSearch && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>
            Escribe al menos {MIN_QUERY} letras para buscar{' '}
            {kind === 'players' ? 'jugadores' : 'competiciones públicas'}.
          </Text>
        </GlassPanel>
      )}

      {canSearch && isSearching && (
        <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />
      )}

      {canSearch && error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {canSearch && !isSearching && !error && results.length === 0 && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>No hay resultados para “{term}”.</Text>
        </GlassPanel>
      )}

      {canSearch && kind === 'players' && players.map((player) => <PlayerRow key={player.id} player={player} />)}

      {canSearch && kind === 'competitions' && (
        <View style={styles.list}>
          {competitions.map((competition) => (
            <CompetitionCard key={competition.id} competition={competition} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    title: {
      ...Typography.headlineLg,
      color: colors.primary,
    },
    spinner: {
      marginTop: Spacing.sm,
    },
    card: {
      padding: Spacing.sm,
    },
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    list: {
      gap: Spacing.sm,
    },
  });
