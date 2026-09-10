import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { createMatchSet, getMatch, updateMatchStatus } from '@/api/categories';
import { ApiError, type Match } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { Colors, Spacing, Typography } from '@/theme/tokens';

function sideLabel(
  a: { name: string } | undefined,
  b: { name: string } | undefined,
  idA: number,
  idB: number
): string {
  return `${a?.name ?? `Jugador #${idA}`} / ${b?.name ?? `Jugador #${idB}`}`;
}

/** Sets won by each side, to derive a winner or detect a tie. */
function countSetsWon(match: Match): { side1: number; side2: number } {
  const sets = match.match_sets ?? [];
  return {
    side1: sets.filter((set) => set.side1_games > set.side2_games).length,
    side2: sets.filter((set) => set.side2_games > set.side1_games).length,
  };
}

export default function MatchDetailScreen() {
  const { id, isOrganizer: isOrganizerParam } = useLocalSearchParams<{
    id: string;
    isOrganizer?: string;
  }>();
  const router = useRouter();
  const isOrganizer = isOrganizerParam === '1';
  const matchId = Number(id);

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [side1Games, setSide1Games] = useState('');
  const [side2Games, setSide2Games] = useState('');

  const refetch = useCallback(async () => {
    try {
      setMatch(await getMatch(matchId));
    } catch {
      setError('No se pudo cargar el partido.');
    }
  }, [matchId]);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        setMatch(await getMatch(matchId));
      } catch {
        setError('No se pudo cargar el partido.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [matchId]);

  async function handleAddSet() {
    if (!match || side1Games === '' || side2Games === '') return;
    setIsSubmitting(true);
    setError(null);
    try {
      await createMatchSet(match.id, {
        set_number: (match.match_sets?.length ?? 0) + 1,
        side1_games: Number(side1Games),
        side2_games: Number(side2Games),
      });
      setSide1Games('');
      setSide2Games('');
      await refetch();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo guardar el set.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleComplete() {
    if (!match) return;
    const { side1, side2 } = countSetsWon(match);
    if (side1 === side2) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await updateMatchStatus(match.id, {
        status: 'completed',
        winner_side: side1 > side2 ? 1 : 2,
      });
      // La respuesta del PUT no trae los nombres embebidos (solo GET los
      // incluye) — recargamos el partido completo para no perderlos.
      await refetch();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo completar el partido.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const setsWon = match ? countSetsWon(match) : { side1: 0, side2: 0 };
  const canComplete = (match?.match_sets?.length ?? 0) > 0 && setsWon.side1 !== setsWon.side2;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />}

      {match && (
        <>
          <View>
            <Text style={styles.title}>Resultado del partido</Text>
            {match.court && <Text style={styles.meta}>{match.court}</Text>}
          </View>

          <GlassPanel style={styles.card}>
            <View style={styles.sideRow}>
              {match.status === 'completed' && match.winner_side === 1 && (
                <MaterialIcons name="emoji-events" size={18} color={Colors.secondaryContainer} />
              )}
              <Text style={styles.sideLabel}>
                {sideLabel(
                  match.side1_player1,
                  match.side1_player2,
                  match.side1_player1_id,
                  match.side1_player2_id
                )}
              </Text>
            </View>
            <Text style={styles.vsLabel}>vs</Text>
            <View style={styles.sideRow}>
              {match.status === 'completed' && match.winner_side === 2 && (
                <MaterialIcons name="emoji-events" size={18} color={Colors.secondaryContainer} />
              )}
              <Text style={styles.sideLabel}>
                {sideLabel(
                  match.side2_player1,
                  match.side2_player2,
                  match.side2_player1_id,
                  match.side2_player2_id
                )}
              </Text>
            </View>

            {match.match_sets && match.match_sets.length > 0 && (
              <View style={styles.setsRow}>
                {match.match_sets.map((set) => (
                  <View key={set.id} style={styles.setPill}>
                    <Text style={styles.setPillText}>
                      {set.side1_games}-{set.side2_games}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </GlassPanel>

          {error && (
            <GlassPanel style={styles.card}>
              <Text style={styles.errorText}>{error}</Text>
            </GlassPanel>
          )}

          {match.status !== 'completed' && isOrganizer && (
            <GlassPanel style={styles.card}>
              <Text style={styles.cardTitle}>Añadir set {(match.match_sets?.length ?? 0) + 1}</Text>
              <View style={styles.setInputRow}>
                <TextField
                  style={styles.setInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={side1Games}
                  onChangeText={setSide1Games}
                />
                <Text style={styles.meta}>–</Text>
                <TextField
                  style={styles.setInput}
                  placeholder="0"
                  keyboardType="number-pad"
                  value={side2Games}
                  onChangeText={setSide2Games}
                />
                <Button
                  title="Añadir"
                  variant="secondary"
                  disabled={isSubmitting || side1Games === '' || side2Games === ''}
                  onPress={handleAddSet}
                />
              </View>

              <Button
                title={isSubmitting ? 'Guardando…' : 'Marcar como completado'}
                disabled={isSubmitting || !canComplete}
                onPress={handleComplete}
              />
              {(match.match_sets?.length ?? 0) > 0 && setsWon.side1 === setsWon.side2 && (
                <Text style={styles.meta}>Empate en sets — añade uno más para desempatar.</Text>
              )}
            </GlassPanel>
          )}

          {match.status !== 'completed' && !isOrganizer && (
            <GlassPanel style={styles.card}>
              <Text style={styles.meta}>Partido pendiente de resultado.</Text>
            </GlassPanel>
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  title: {
    ...Typography.headlineLg,
    color: Colors.primary,
  },
  meta: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  cardTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  sideRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sideLabel: {
    ...Typography.bodyMd,
    color: Colors.primary,
    flexShrink: 1,
  },
  vsLabel: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  setsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.base,
  },
  setPill: {
    backgroundColor: Colors.glassFill,
    borderRadius: 8,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
  },
  setPillText: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
  },
  setInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  setInput: {
    width: 56,
    textAlign: 'center',
  },
  errorText: {
    ...Typography.bodySm,
    color: Colors.error,
  },
});
