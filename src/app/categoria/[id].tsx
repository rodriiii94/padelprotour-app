import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { searchUsers } from '@/api/categories';
import type {
  Match,
  Pair,
  Phase,
  Ranking,
  Registration,
  PublicUserSummary,
  RegistrationStatus,
  UserSummary,
} from '@/api/types';
import { MatchStatusBadge, ScoreRows } from '@/components/match/match-scoreboard';
import { ActionChip } from '@/components/ui/action-chip';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { SectionLabel } from '@/components/ui/section-label';
import { PlayerNames } from '@/components/ui/player-names';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';
import { useCategoryDetail } from '@/hooks/use-category-detail';
import { useColors } from '@/hooks/use-theme';
import { bookingPlace } from '@/lib/booking';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  waitlisted: 'Lista de espera',
  rejected: 'Rechazada',
};

const makeStatusColor = (colors: ColorPalette): Record<RegistrationStatus, string> => ({
  pending: colors.secondaryContainer,
  confirmed: colors.primaryContainer,
  waitlisted: colors.onSurfaceVariant,
  rejected: colors.error,
});

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

function playerName(summary: UserSummary | undefined, fallbackId: number): string {
  return summary?.name ?? `Jugador #${fallbackId}`;
}

function pairLabel(
  pair: Pick<Pair, 'name' | 'player1' | 'player2' | 'player1_id' | 'player2_id'>
): string {
  if (pair.name) return pair.name;
  return `${playerName(pair.player1, pair.player1_id)} / ${playerName(pair.player2, pair.player2_id)}`;
}

type PlayerRef = { id: number; name: string };

function pairPlayers(
  pair: Pick<Pair, 'player1' | 'player2' | 'player1_id' | 'player2_id'>
): PlayerRef[] {
  return [
    { id: pair.player1_id, name: playerName(pair.player1, pair.player1_id) },
    { id: pair.player2_id, name: playerName(pair.player2, pair.player2_id) },
  ];
}


/** Ranking rows only carry ids — resolve a label from the registrations already loaded. */
function rankingLabel(ranking: Ranking, registrations: Registration[]): string {
  if (ranking.pair_id !== null) {
    const registration = registrations.find((r) => r.pair_id === ranking.pair_id);
    return registration?.pair ? pairLabel(registration.pair) : `Pareja #${ranking.pair_id}`;
  }
  const registration = registrations.find((r) => r.player_id === ranking.player_id);
  return registration?.player?.name ?? `Jugador #${ranking.player_id}`;
}

export default function CategoryDetailScreen() {
  const { id, invite } = useLocalSearchParams<{ id: string; invite?: string }>();
  const goBack = useGoBack();
  const { user } = useAuth();
  const categoryId = Number(id);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const statusColor = useMemo(() => makeStatusColor(colors), [colors]);
  const {
    category,
    competition,
    registrations,
    myPairs,
    phases,
    matchesByPhase,
    rankings,
    isLoading,
    isMutating,
    error,
    refetch,
    confirmRegistration,
    rejectRegistration,
    joinWithPair,
    joinIndividually,
    formPairAndJoin,
    generateCalendar,
  } = useCategoryDetail(categoryId, invite);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isOrganizer = competition?.organizer_id === user?.id;
  const isIndividual = category?.registration_mode === 'individual_rotating';
  const myRegistration = registrations.find((r) =>
    isIndividual
      ? r.player_id === user?.id
      : r.pair_id !== null && myPairs.some((pair) => pair.id === r.pair_id)
  );
  const availablePairs = myPairs.filter(
    (pair) => !registrations.some((r) => r.pair_id === pair.id && r.status !== 'rejected')
  );
  const confirmedCount = registrations.filter((r) => r.status === 'confirmed').length;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {category && (
        <>
          <View>
            <Text style={styles.title}>{category.name}</Text>
            {competition && <Text style={styles.meta}>{competition.name}</Text>}
          </View>

          {(category.match_format || category.slots) && (
            <View style={styles.pills}>
              {category.match_format && (
                <InfoPill icon="sports-tennis" label={category.match_format} />
              )}
              {category.slots && <InfoPill icon="groups" label={`${category.slots} plazas`} />}
            </View>
          )}

          {myRegistration ? (
            <GlassPanel style={styles.card}>
              <View style={styles.rowBetween}>
                <SectionLabel icon="how-to-reg" label="Tu inscripción" />
                <View
                  style={[styles.statusPill, { borderColor: statusColor[myRegistration.status] + '80' }]}>
                  <Text style={[styles.statusPillLabel, { color: statusColor[myRegistration.status] }]}>
                    {STATUS_LABEL[myRegistration.status]}
                  </Text>
                </View>
              </View>
            </GlassPanel>
          ) : isIndividual ? (
            <GlassPanel style={styles.card}>
              <SectionLabel icon="person-add-alt" label="Únete" />
              <Text style={styles.meta}>
                En esta liga te inscribes tú solo: las parejas rotan en cada jornada.
              </Text>
              <ActionChip
                icon="check"
                label="Inscribirme"
                tone="accent"
                disabled={isMutating || !user}
                onPress={() => user && joinIndividually(user.id)}
              />
            </GlassPanel>
          ) : (
            <JoinSection
              availablePairs={availablePairs}
              isMutating={isMutating}
              onJoinWithPair={joinWithPair}
              onFormPairAndJoin={formPairAndJoin}
            />
          )}

          {isOrganizer && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inscripciones</Text>
              {registrations.length === 0 ? (
                <GlassPanel style={styles.card}>
                  <Text style={styles.body}>Todavía no hay inscripciones.</Text>
                </GlassPanel>
              ) : (
                <View style={styles.list}>
                  {registrations.map((registration) => (
                    <RegistrationRow
                      key={registration.id}
                      registration={registration}
                      isMutating={isMutating}
                      onConfirm={() => confirmRegistration(registration.id)}
                      onReject={() => rejectRegistration(registration.id)}
                    />
                  ))}
                </View>
              )}

              {phases.length === 0 && (
                <GlassPanel style={styles.card}>
                  <Text style={styles.cardTitle}>Calendario</Text>
                  <Text style={styles.body}>
                    {confirmedCount < 2
                      ? 'Necesitas al menos 2 parejas confirmadas para generar el calendario.'
                      : 'Genera el calendario round-robin para esta categoría.'}
                  </Text>
                  <Button
                    title={isMutating ? 'Generando…' : 'Generar calendario'}
                    onPress={generateCalendar}
                    disabled={isMutating || confirmedCount < 2}
                  />
                </GlassPanel>
              )}
            </View>
          )}

          {phases.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Calendario</Text>
              <View style={styles.list}>
                {phases.map((phase) => (
                  <PhaseSection
                    key={phase.id}
                    phase={phase}
                    matches={matchesByPhase[phase.id] ?? []}
                    isOrganizer={isOrganizer}
                    currentUserId={user?.id}
                  />
                ))}
              </View>
            </View>
          )}

          {rankings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clasificación</Text>
              <GlassPanel style={styles.rankingCard}>
                {rankings.map((ranking, index) => {
                  const podium = PODIUM[ranking.position];
                  return (
                    <View
                      key={ranking.id}
                      style={[styles.rankingRow, index > 0 && styles.rankingDivider]}>
                      <View
                        style={[
                          styles.rankingBadge,
                          podium && { borderColor: podium + '99', backgroundColor: podium + '22' },
                        ]}>
                        <Text style={[styles.rankingPosition, podium && { color: podium }]}>
                          {ranking.position}
                        </Text>
                      </View>
                      <Text
                        style={[styles.rankingName, ranking.position === 1 && styles.rankingNameFirst]}
                        numberOfLines={2}>
                        {rankingLabel(ranking, registrations)}
                      </Text>
                      <View style={styles.rankingPointsWrap}>
                        <Text style={styles.rankingPoints}>{ranking.points}</Text>
                        <Text style={styles.rankingPointsUnit}>pts</Text>
                      </View>
                    </View>
                  );
                })}
              </GlassPanel>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function InfoPill({ icon, label }: { icon: 'sports-tennis' | 'groups'; label: string }) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <View style={styles.infoPill}>
      <MaterialIcons name={icon} size={14} color={colors.onSurfaceVariant} />
      <Text style={styles.infoPillLabel}>{label}</Text>
    </View>
  );
}

function JoinSection({
  availablePairs,
  isMutating,
  onJoinWithPair,
  onFormPairAndJoin,
}: {
  availablePairs: Pair[];
  isMutating: boolean;
  onJoinWithPair: (pairId: number) => void;
  onFormPairAndJoin: (partnerId: number, name?: string) => void;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [pairName, setPairName] = useState('');
  const [results, setResults] = useState<PublicUserSummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  async function handleSearch() {
    if (query.trim().length < 2) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      setResults(await searchUsers(query.trim()));
    } catch {
      setSearchError('No se pudo buscar jugadores.');
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <GlassPanel style={styles.card}>
      <SectionLabel icon="person-add-alt" label="Únete" />

      {availablePairs.map((pair) => (
        <View key={pair.id} style={styles.rowBetween}>
          {pair.name ? (
            <Text style={styles.meta}>{pair.name}</Text>
          ) : (
            <PlayerNames style={styles.meta} players={pairPlayers(pair)} />
          )}
          <ActionChip
            label="Inscribir"
            tone="accent"
            fill={false}
            disabled={isMutating}
            onPress={() => onJoinWithPair(pair.id)}
          />
        </View>
      ))}

      {!showSearch ? (
        <ActionChip icon="person-add" label="Formar nueva pareja" onPress={() => setShowSearch(true)} />
      ) : (
        <View style={{ gap: Spacing.xs }}>
          <TextField
            placeholder="Buscar por nombre"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          <ActionChip
            icon="search"
            label={isSearching ? 'Buscando…' : 'Buscar'}
            onPress={handleSearch}
            disabled={isSearching || query.trim().length < 2}
          />
          {searchError && <Text style={styles.error}>{searchError}</Text>}
          {results.length > 0 && (
            <TextField
              placeholder="Nombre de la pareja (opcional)"
              value={pairName}
              onChangeText={setPairName}
            />
          )}
          {results.map((result) => (
            <View key={result.id} style={styles.rowBetween}>
              <PlayerNames style={styles.meta} players={[{ id: result.id, name: result.name }]} />
              <ActionChip
                label="Formar pareja"
                tone="accent"
                fill={false}
                disabled={isMutating}
                onPress={() => onFormPairAndJoin(result.id, pairName.trim() || undefined)}
              />
            </View>
          ))}
        </View>
      )}
    </GlassPanel>
  );
}

function RegistrationRow({
  registration,
  isMutating,
  onConfirm,
  onReject,
}: {
  registration: Registration;
  isMutating: boolean;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const statusColor = useMemo(() => makeStatusColor(colors), [colors]);
  const fallbackLabel = registration.pair_id
    ? `Pareja #${registration.pair_id}`
    : `Jugador #${registration.player_id}`;

  return (
    <GlassPanel style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={[styles.row, { flex: 1 }]}>
          <MaterialIcons name="groups" size={20} color={colors.onSurfaceVariant} />
          <View style={{ flex: 1 }}>
            {registration.pair ? (
              registration.pair.name ? (
                <>
                  <Text style={styles.registrationName} numberOfLines={2}>
                    {registration.pair.name}
                  </Text>
                  <PlayerNames style={styles.meta} players={pairPlayers(registration.pair)} />
                </>
              ) : (
                <PlayerNames style={styles.registrationName} players={pairPlayers(registration.pair)} />
              )
            ) : registration.player ? (
              <PlayerNames style={styles.registrationName} players={[registration.player]} />
            ) : (
              <Text style={styles.registrationName} numberOfLines={2}>
                {fallbackLabel}
              </Text>
            )}
          </View>
        </View>
        <View
          style={[
            styles.statusPill,
            { borderColor: statusColor[registration.status] + '80' },
          ]}>
          <Text style={[styles.statusPillLabel, { color: statusColor[registration.status] }]}>
            {STATUS_LABEL[registration.status]}
          </Text>
        </View>
      </View>
      {registration.status === 'pending' && (
        <View style={styles.actionsRow}>
          <ActionChip label="Rechazar" tone="danger" fill={false} disabled={isMutating} onPress={onReject} />
          <ActionChip label="Confirmar" tone="accent" fill={false} disabled={isMutating} onPress={onConfirm} />
        </View>
      )}
    </GlassPanel>
  );
}

function MatchRow({
  match,
  isFirst,
  isOrganizer,
  currentUserId,
}: {
  match: Match;
  isFirst: boolean;
  isOrganizer: boolean;
  currentUserId?: number;
}) {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <Pressable
      onPress={() => router.push(`/partido/${match.id}?isOrganizer=${isOrganizer ? '1' : '0'}`)}
      style={({ pressed }) => [styles.matchCard, !isFirst && styles.matchCardGap, pressed && styles.matchPressed]}>
      <View style={styles.matchHeader}>
        <MatchStatusBadge status={match.status} small />
        <View style={styles.matchWhen}>
          <MaterialIcons name="location-on" size={13} color={colors.onSurfaceVariant} />
          <Text style={styles.matchMeta} numberOfLines={1}>
            {bookingPlace(match) ?? 'Pista sin asignar'}
            {match.scheduled_at ? ` · ${dateFormatter.format(new Date(match.scheduled_at))}` : ''}
          </Text>
        </View>
      </View>
      <ScoreRows match={match} compact currentUserId={currentUserId} />
    </Pressable>
  );
}

function PhaseSection({
  phase,
  matches,
  isOrganizer,
  currentUserId,
}: {
  phase: Phase;
  matches: Match[];
  isOrganizer: boolean;
  currentUserId?: number;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <GlassPanel style={styles.card}>
      <SectionLabel icon="event" label={phase.name} />
      {matches.map((match, index) => (
        <MatchRow
          key={match.id}
          match={match}
          isFirst={index === 0}
          isOrganizer={isOrganizer}
          currentUserId={currentUserId}
        />
      ))}
    </GlassPanel>
  );
}

const PODIUM: Record<number, string> = {
  1: '#ffc857',
  2: '#c9d1c0',
  3: '#d99a6c',
};

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    rankingCard: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.base,
    },
    rankingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      paddingVertical: Spacing.xs + 2,
    },
    rankingDivider: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.glassBorder,
    },
    rankingBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glassFill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rankingPosition: {
      fontFamily: FontFamilies.display,
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    rankingName: {
      flex: 1,
      minWidth: 0,
      ...Typography.bodyMd,
      color: colors.onSurface,
    },
    rankingNameFirst: {
      fontFamily: FontFamilies.bodyBold,
      color: colors.primary,
    },
    rankingPointsWrap: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    rankingPoints: {
      fontFamily: FontFamilies.display,
      fontSize: 20,
      color: colors.primaryContainer,
    },
    rankingPointsUnit: {
      ...Typography.bodySm,
      fontSize: 12,
      color: colors.onSurfaceVariant,
    },
    matchCard: {
      paddingVertical: Spacing.xs,
    },
    matchCardGap: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.glassBorder,
      paddingTop: Spacing.xs + 2,
    },
    matchPressed: {
      opacity: 0.7,
    },
    matchHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.xs,
      marginBottom: 2,
    },
    matchWhen: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      flexShrink: 1,
    },
    registrationName: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 16,
      lineHeight: 22,
      color: colors.primary,
      flexShrink: 1,
    },
    pills: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.xs,
    },
    infoPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: Spacing.xs + 4,
      borderRadius: Radii.full,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      backgroundColor: colors.glassFill,
    },
    infoPillLabel: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
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
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    card: {
      padding: Spacing.sm,
      gap: Spacing.xs,
    },
    cardTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
      flexShrink: 1,
    },
    section: {
      gap: Spacing.sm,
    },
    sectionTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    list: {
      gap: Spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
    },
    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: Spacing.xs,
      marginTop: Spacing.xs,
      paddingTop: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
    },
    statusPill: {
      borderWidth: 1,
      borderRadius: Radii.full,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 3,
    },
    statusPillLabel: {
      ...Typography.labelCaps,
      fontSize: 11,
    },
    matchMeta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      fontSize: 13,
    },
    error: {
      ...Typography.bodySm,
      color: colors.error,
    },
  });
