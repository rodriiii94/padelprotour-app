import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import {
  confirmMatchResult,
  createMatchSet,
  getMatch,
  proposeMatchResult,
  rejectMatchResult,
  updateMatchStatus,
} from '@/api/categories';
import { ApiError, type Match } from '@/api/types';
import { MatchBooking } from '@/components/match/match-booking';
import { MatchChat } from '@/components/match/match-chat';
import { MatchStatusBadge, ScoreRows } from '@/components/match/match-scoreboard';
import { ActionChip } from '@/components/ui/action-chip';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { SectionLabel } from '@/components/ui/section-label';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';
import { useColors } from '@/hooks/use-theme';
import { Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/** Every set result padel actually allows: 6 with a 2-game margin, 7-5, or a 7-6 tie-break. */
const VALID_SET_SCORES: [number, number][] = [
  [6, 0],
  [6, 1],
  [6, 2],
  [6, 3],
  [6, 4],
  [7, 5],
  [7, 6],
  [0, 6],
  [1, 6],
  [2, 6],
  [3, 6],
  [4, 6],
  [5, 7],
  [6, 7],
];

function isValidSetScore(side1Games: string, side2Games: string): boolean {
  if (side1Games === '' || side2Games === '') return false;
  const s1 = Number(side1Games);
  const s2 = Number(side2Games);
  return VALID_SET_SCORES.some(([a, b]) => a === s1 && b === s2);
}

/** Sets won by each side, to derive a winner or detect a tie. */
function countSetsWon(match: Match): { side1: number; side2: number } {
  const sets = match.match_sets ?? [];
  return {
    side1: sets.filter((set) => set.side1_games > set.side2_games).length,
    side2: sets.filter((set) => set.side2_games > set.side1_games).length,
  };
}

/** Lado (1 o 2) en el que juega el usuario, o null si no juega este partido. */
function sideOf(match: Match, userId: number | undefined): 1 | 2 | null {
  if (userId === undefined) return null;
  if (userId === match.side1_player1_id || userId === match.side1_player2_id) return 1;
  if (userId === match.side2_player1_id || userId === match.side2_player2_id) return 2;
  return null;
}

const AUTO_CONFIRM_HOURS = 48;

const autoConfirmFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  hour: '2-digit',
  minute: '2-digit',
});

/** Cuándo se confirmará solo el resultado propuesto, si nadie responde. */
function autoConfirmText(match: Match): string {
  if (!match.result_proposed_at) return '';
  const at = new Date(new Date(match.result_proposed_at).getTime() + AUTO_CONFIRM_HOURS * 3_600_000);
  return `Si nadie responde, se confirmará automáticamente el ${autoConfirmFormatter.format(at)}.`;
}

/** Nombre de quien propuso el resultado, si está entre los jugadores del partido. */
function proposerName(match: Match): string | null {
  const players = [
    match.side1_player1,
    match.side1_player2,
    match.side2_player1,
    match.side2_player2,
  ];
  const ids = [
    match.side1_player1_id,
    match.side1_player2_id,
    match.side2_player1_id,
    match.side2_player2_id,
  ];
  const index = ids.indexOf(match.result_proposed_by ?? -1);
  return index >= 0 ? (players[index]?.name ?? null) : null;
}

type SetDraft = { side1: string; side2: string };

/** Sets de la propuesta que ya son un marcador válido, en orden, hasta que el partido queda decidido. */
function validDraftSets(drafts: SetDraft[]): { side1_games: number; side2_games: number }[] {
  const sets: { side1_games: number; side2_games: number }[] = [];
  let won1 = 0;
  let won2 = 0;
  for (const draft of drafts) {
    if (won1 === 2 || won2 === 2 || !isValidSetScore(draft.side1, draft.side2)) break;
    const g1 = Number(draft.side1);
    const g2 = Number(draft.side2);
    sets.push({ side1_games: g1, side2_games: g2 });
    if (g1 > g2) won1++;
    else won2++;
  }
  return sets;
}

export default function MatchDetailScreen() {
  const { id, isOrganizer: isOrganizerParam } = useLocalSearchParams<{
    id: string;
    isOrganizer?: string;
  }>();
  const goBack = useGoBack();
  const { user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const isOrganizerParamSet = isOrganizerParam === '1';
  const matchId = Number(id);

  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [side1Games, setSide1Games] = useState('');
  const [side2Games, setSide2Games] = useState('');
  const [drafts, setDrafts] = useState<SetDraft[]>([
    { side1: '', side2: '' },
    { side1: '', side2: '' },
    { side1: '', side2: '' },
  ]);

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
    if (!match || !isValidSetScore(side1Games, side2Games)) return;
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

  async function runAction(action: () => Promise<Match>, failure: string) {
    setIsSubmitting(true);
    setError(null);
    try {
      await action();
      await refetch();
    } catch (e) {
      const first = e instanceof ApiError ? Object.values(e.errors ?? {})[0]?.[0] : undefined;
      setError(first ?? (e instanceof ApiError ? e.message : failure));
    } finally {
      setIsSubmitting(false);
    }
  }

  const mySide = match ? sideOf(match, user?.id) : null;
  // Si el organizador juega este partido, es parte interesada: se le trata como a un
  // jugador más (propone y confirma un rival), igual que hace la API.
  const isOrganizer = isOrganizerParamSet && mySide === null;
  const proposerSide = match?.result_proposed_by ? sideOf(match, match.result_proposed_by) : null;
  const isProposer = !!match?.result_proposed_by && match.result_proposed_by === user?.id;
  // Confirma o rechaza un rival de quien propuso, o el organizador.
  const canReview =
    match?.status === 'pending_validation' &&
    !isProposer &&
    (isOrganizer || (mySide !== null && mySide !== proposerSide));
  const draftSets = validDraftSets(drafts);
  const draftWon1 = draftSets.filter((set) => set.side1_games > set.side2_games).length;
  const draftWon2 = draftSets.length - draftWon1;
  const draftDecided = draftWon1 === 2 || draftWon2 === 2;

  const setsWon = match ? countSetsWon(match) : { side1: 0, side2: 0 };
  const setCount = match?.match_sets?.length ?? 0;
  // Mejor de 3: en cuanto un lado lleva 2 sets ganados, el partido está decidido.
  const isDecided = setsWon.side1 === 2 || setsWon.side2 === 2;
  const canAddSet = setCount < 3 && !isDecided;
  const canComplete = isDecided;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />}

      {match && (
        <>
          <Text style={styles.title}>Resultado del partido</Text>

          <GlassPanel style={styles.scoreboard}>
            <View style={styles.scoreboardHeader}>
              <MatchStatusBadge status={match.status} />
            </View>
            <ScoreRows match={match} currentUserId={user?.id} />
          </GlassPanel>

          <MatchBooking
            match={match}
            canEdit={(mySide !== null || isOrganizerParamSet) && match.status !== 'completed'}
            onSaved={(booking) => setMatch((current) => (current ? { ...current, ...booking } : current))}
          />

          {error && (
            <GlassPanel style={styles.card}>
              <Text style={styles.errorText}>{error}</Text>
            </GlassPanel>
          )}

          {(match.status === 'scheduled' || match.status === 'in_progress') && isOrganizer && (
            <GlassPanel style={styles.card}>
              <SectionLabel icon="edit" label="Anotar resultado" />
              {canAddSet && (
                <>
                  <View style={styles.setInputRow}>
                    <Text style={styles.setLabel}>Set {setCount + 1}</Text>
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
                    <ActionChip
                      icon="add"
                      label="Añadir"
                      fill={false}
                      disabled={isSubmitting || !isValidSetScore(side1Games, side2Games)}
                      onPress={handleAddSet}
                    />
                  </View>
                  {side1Games !== '' &&
                    side2Games !== '' &&
                    !isValidSetScore(side1Games, side2Games) && (
                      <Text style={styles.errorText}>
                        Marcador no válido: 6 juegos con 2 de diferencia, 7-5, o 7-6 (tie-break).
                      </Text>
                    )}
                  {setCount > 0 && (
                    <Text style={styles.meta}>
                      El partido termina cuando un lado gana 2 sets — añade el siguiente.
                    </Text>
                  )}
                </>
              )}

              <ActionChip
                icon="check"
                label={isSubmitting ? 'Guardando…' : 'Marcar como completado'}
                tone="accent"
                disabled={isSubmitting || !canComplete}
                onPress={handleComplete}
              />
            </GlassPanel>
          )}

          {match.status === 'pending_validation' && (
            <GlassPanel style={styles.card}>
              <SectionLabel icon="hourglass-top" label="Pendiente de validar" />
              <Text style={styles.body}>
                {proposerName(match) ? `${proposerName(match)} ha propuesto este resultado. ` : ''}
                {canReview
                  ? 'Si es correcto, confírmalo; si no, recházalo y se borra.'
                  : 'Esperando a que un rival lo confirme.'}
              </Text>
              <Text style={styles.meta}>{autoConfirmText(match)}</Text>
              {canReview && (
                <View style={styles.actionsRow}>
                  <ActionChip
                    icon="close"
                    label="Rechazar"
                    tone="danger"
                    disabled={isSubmitting}
                    onPress={() =>
                      runAction(() => rejectMatchResult(match.id), 'No se pudo rechazar el resultado.')
                    }
                  />
                  <ActionChip
                    icon="check"
                    label="Confirmar"
                    tone="accent"
                    disabled={isSubmitting}
                    onPress={() =>
                      runAction(() => confirmMatchResult(match.id), 'No se pudo confirmar el resultado.')
                    }
                  />
                </View>
              )}
              {isProposer && (
                <ActionChip
                  icon="undo"
                  label="Retirar propuesta"
                  disabled={isSubmitting}
                  onPress={() =>
                    runAction(() => rejectMatchResult(match.id), 'No se pudo retirar la propuesta.')
                  }
                />
              )}
            </GlassPanel>
          )}

          {(match.status === 'scheduled' || match.status === 'in_progress') && !isOrganizer && (
            mySide ? (
              <GlassPanel style={styles.card}>
                <SectionLabel icon="edit" label="Proponer resultado" />
                <Text style={styles.meta}>
                  Juegos de cada lado por set. Un rival tendrá que confirmarlo; si no responde en 48
                  horas, se confirma solo.
                </Text>
                {drafts.map((draft, index) => {
                  const hidden =
                    index === 2 && !(draftSets.length >= 2 && draftWon1 === 1 && draftWon2 === 1);
                  if (hidden) return null;
                  return (
                    <View key={index} style={styles.setInputRow}>
                      <Text style={styles.setLabel}>Set {index + 1}</Text>
                      <TextField
                        style={styles.setInput}
                        placeholder="0"
                        keyboardType="number-pad"
                        value={draft.side1}
                        onChangeText={(value) =>
                          setDrafts((prev) =>
                            prev.map((d, i) => (i === index ? { ...d, side1: value } : d))
                          )
                        }
                      />
                      <Text style={styles.meta}>–</Text>
                      <TextField
                        style={styles.setInput}
                        placeholder="0"
                        keyboardType="number-pad"
                        value={draft.side2}
                        onChangeText={(value) =>
                          setDrafts((prev) =>
                            prev.map((d, i) => (i === index ? { ...d, side2: value } : d))
                          )
                        }
                      />
                    </View>
                  );
                })}
                <Text style={styles.meta}>
                  Marcadores válidos: 6 juegos con 2 de diferencia, 7-5, o 7-6 (tie-break).
                </Text>
                <ActionChip
                  icon="send"
                  label={isSubmitting ? 'Enviando…' : 'Proponer resultado'}
                  tone="accent"
                  disabled={isSubmitting || !draftDecided}
                  onPress={() =>
                    runAction(() => proposeMatchResult(match.id, draftSets), 'No se pudo proponer el resultado.')
                  }
                />
              </GlassPanel>
            ) : (
              <GlassPanel style={styles.card}>
                <Text style={styles.meta}>Partido pendiente de resultado.</Text>
              </GlassPanel>
            )
          )}

          {user && (mySide !== null || isOrganizer) && (
            <MatchChat matchId={match.id} currentUserId={user.id} isOrganizer={isOrganizerParamSet} />
          )}
        </>
      )}
    </Screen>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
    },
    spinner: {
      marginTop: Spacing.lg,
    },
    title: {
      ...Typography.headlineLg,
      color: colors.primary,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    card: {
      padding: Spacing.sm,
      gap: Spacing.sm,
    },
    cardTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    body: {
      ...Typography.bodyMd,
      color: colors.onSurface,
    },
    scoreboard: {
      padding: Spacing.sm,
    },
    scoreboardHeader: {
      flexDirection: 'row',
      marginBottom: Spacing.xs,
    },
    setLabel: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      width: 44,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: Spacing.xs,
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
      color: colors.error,
    },
  });
