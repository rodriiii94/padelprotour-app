import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { ActionChip } from '@/components/ui/action-chip';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { SectionLabel } from '@/components/ui/section-label';
import { PlayerNames } from '@/components/ui/player-names';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { useCategoryDetail } from '@/hooks/use-category-detail';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

const STATUS_LABEL: Record<RegistrationStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  waitlisted: 'Lista de espera',
  rejected: 'Rechazada',
};

const STATUS_COLOR: Record<RegistrationStatus, string> = {
  pending: Colors.secondaryContainer,
  confirmed: Colors.primaryContainer,
  waitlisted: Colors.onSurfaceVariant,
  rejected: Colors.error,
};

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

function sidePlayers(match: Match, side: 1 | 2): PlayerRef[] {
  return side === 1
    ? [
        { id: match.side1_player1_id, name: playerName(match.side1_player1, match.side1_player1_id) },
        { id: match.side1_player2_id, name: playerName(match.side1_player2, match.side1_player2_id) },
      ]
    : [
        { id: match.side2_player1_id, name: playerName(match.side2_player1, match.side2_player1_id) },
        { id: match.side2_player2_id, name: playerName(match.side2_player2, match.side2_player2_id) },
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
  const router = useRouter();
  const { user } = useAuth();
  const categoryId = Number(id);
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
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.onSurface} />
        </Pressable>
      </View>

      {isLoading && <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />}

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
                  style={[styles.statusPill, { borderColor: STATUS_COLOR[myRegistration.status] + '80' }]}>
                  <Text style={[styles.statusPillLabel, { color: STATUS_COLOR[myRegistration.status] }]}>
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
                  />
                ))}
              </View>
            </View>
          )}

          {rankings.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Clasificación</Text>
              <GlassPanel style={styles.card}>
                {rankings.map((ranking) => (
                  <View key={ranking.id} style={styles.rankingRow}>
                    <Text style={styles.rankingPosition}>{ranking.position}</Text>
                    <Text style={[styles.meta, styles.rankingName]} numberOfLines={1}>
                      {rankingLabel(ranking, registrations)}
                    </Text>
                    <Text style={styles.rankingPoints}>{ranking.points} pts</Text>
                  </View>
                ))}
              </GlassPanel>
            </View>
          )}
        </>
      )}
    </Screen>
  );
}

function InfoPill({ icon, label }: { icon: 'sports-tennis' | 'groups'; label: string }) {
  return (
    <View style={styles.infoPill}>
      <MaterialIcons name={icon} size={14} color={Colors.onSurfaceVariant} />
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
  const fallbackLabel = registration.pair_id
    ? `Pareja #${registration.pair_id}`
    : `Jugador #${registration.player_id}`;

  return (
    <GlassPanel style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={[styles.row, { flex: 1 }]}>
          <MaterialIcons name="groups" size={20} color={Colors.onSurfaceVariant} />
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
            { borderColor: STATUS_COLOR[registration.status] + '80' },
          ]}>
          <Text style={[styles.statusPillLabel, { color: STATUS_COLOR[registration.status] }]}>
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

function MatchSide({ players, isWinner }: { players: PlayerRef[]; isWinner?: boolean }) {
  return (
    <View style={styles.matchSide}>
      {isWinner ? (
        <MaterialIcons name="emoji-events" size={14} color={Colors.secondaryContainer} />
      ) : (
        <View style={styles.matchSideDot} />
      )}
      <PlayerNames
        style={[styles.matchSideLabel, isWinner && styles.matchSideLabelWinner]}
        players={players}
      />
    </View>
  );
}

function MatchRow({
  match,
  isFirst,
  isOrganizer,
}: {
  match: Match;
  isFirst: boolean;
  isOrganizer: boolean;
}) {
  const router = useRouter();
  const hasScore = match.match_sets && match.match_sets.length > 0;
  const isCompleted = match.status === 'completed';

  return (
    <Pressable
      onPress={() => router.push(`/partido/${match.id}?isOrganizer=${isOrganizer ? '1' : '0'}`)}
      style={[styles.matchCard, !isFirst && styles.matchCardDivider]}>
      <MatchSide
        players={sidePlayers(match, 1)}
        isWinner={isCompleted && match.winner_side === 1}
      />
      <Text style={styles.vsLabel}>vs</Text>
      <MatchSide
        players={sidePlayers(match, 2)}
        isWinner={isCompleted && match.winner_side === 2}
      />

      <View style={styles.matchFooter}>
        <View style={styles.row}>
          <MaterialIcons name="location-on" size={14} color={Colors.onSurfaceVariant} />
          <Text style={styles.matchMeta}>{match.court ?? 'Pista sin asignar'}</Text>
          {match.scheduled_at && (
            <Text style={styles.matchMeta}>
              · {dateFormatter.format(new Date(match.scheduled_at))}
            </Text>
          )}
        </View>
        {hasScore ? (
          <Text style={styles.score}>
            {match.match_sets!.map((set) => `${set.side1_games}-${set.side2_games}`).join(', ')}
          </Text>
        ) : (
          !isCompleted && <Text style={styles.matchMeta}>Sin resultado</Text>
        )}
      </View>
    </Pressable>
  );
}

function PhaseSection({
  phase,
  matches,
  isOrganizer,
}: {
  phase: Phase;
  matches: Match[];
  isOrganizer: boolean;
}) {
  return (
    <GlassPanel style={styles.card}>
      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={18} color={Colors.primaryContainer} />
        <Text style={styles.cardTitle}>{phase.name}</Text>
      </View>
      {matches.map((match, index) => (
        <MatchRow key={match.id} match={match} isFirst={index === 0} isOrganizer={isOrganizer} />
      ))}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  registrationName: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: Colors.primary,
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
    borderColor: Colors.glassBorder,
    backgroundColor: Colors.glassFill,
  },
  infoPillLabel: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
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
  body: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
    flexShrink: 1,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
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
    borderTopColor: Colors.glassBorder,
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
  matchCard: {
    paddingTop: Spacing.sm,
    gap: Spacing.base,
  },
  matchCardDivider: {
    marginTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  matchSide: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  matchSideDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryContainer,
  },
  matchSideLabel: {
    ...Typography.bodyMd,
    color: Colors.primary,
    flexShrink: 1,
  },
  matchSideLabelWinner: {
    fontFamily: FontFamilies.bodyBold,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.base,
  },
  rankingPosition: {
    ...Typography.headlineSm,
    color: Colors.onSurfaceVariant,
    width: 24,
  },
  rankingName: {
    flex: 1,
  },
  rankingPoints: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
    fontFamily: FontFamilies.bodyBold,
  },
  vsLabel: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
    marginLeft: 14,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  matchMeta: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    fontSize: 13,
  },
  score: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
    fontSize: 12,
    fontFamily: FontFamilies.bodyBold,
  },
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
});
