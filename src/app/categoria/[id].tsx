import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { searchUsers } from '@/api/categories';
import type { Match, Pair, Phase, Registration, RegistrationStatus, User, UserSummary } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
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

function pairLabel(pair: Pick<Pair, 'player1' | 'player2' | 'player1_id' | 'player2_id'>): string {
  return `${playerName(pair.player1, pair.player1_id)} / ${playerName(pair.player2, pair.player2_id)}`;
}

export default function CategoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
    isLoading,
    isMutating,
    error,
    confirmRegistration,
    rejectRegistration,
    joinWithPair,
    formPairAndJoin,
    generateCalendar,
  } = useCategoryDetail(categoryId);

  const isOrganizer = competition?.organizer_id === user?.id;
  const myRegistration = registrations.find(
    (r) => r.pair_id !== null && myPairs.some((pair) => pair.id === r.pair_id)
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
            <GlassPanel style={styles.card}>
              {category.match_format && <Text style={styles.meta}>{category.match_format}</Text>}
              {category.slots && <Text style={styles.meta}>{category.slots} plazas</Text>}
            </GlassPanel>
          )}

          {!isOrganizer &&
            (myRegistration ? (
              <GlassPanel style={styles.card}>
                <Text style={styles.cardTitle}>Tu inscripción</Text>
                <Text style={[styles.meta, { color: STATUS_COLOR[myRegistration.status] }]}>
                  {STATUS_LABEL[myRegistration.status]}
                </Text>
              </GlassPanel>
            ) : (
              <JoinSection
                availablePairs={availablePairs}
                isMutating={isMutating}
                onJoinWithPair={joinWithPair}
                onFormPairAndJoin={formPairAndJoin}
              />
            ))}

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
                  <PhaseSection key={phase.id} phase={phase} matches={matchesByPhase[phase.id] ?? []} />
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </Screen>
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
  onFormPairAndJoin: (partnerId: number) => void;
}) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
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
      <Text style={styles.cardTitle}>Únete</Text>

      {availablePairs.map((pair) => (
        <View key={pair.id} style={styles.rowBetween}>
          <Text style={styles.meta}>{pairLabel(pair)}</Text>
          <Button
            title="Inscribir"
            variant="secondary"
            disabled={isMutating}
            onPress={() => onJoinWithPair(pair.id)}
          />
        </View>
      ))}

      {!showSearch ? (
        <Button title="Formar nueva pareja" variant="ghost" onPress={() => setShowSearch(true)} />
      ) : (
        <View style={{ gap: Spacing.xs }}>
          <TextField
            placeholder="Buscar por nombre o email"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSearch}
            autoCapitalize="none"
          />
          <Button
            title={isSearching ? 'Buscando…' : 'Buscar'}
            variant="secondary"
            onPress={handleSearch}
            disabled={isSearching || query.trim().length < 2}
          />
          {searchError && <Text style={styles.error}>{searchError}</Text>}
          {results.map((result) => (
            <View key={result.id} style={styles.rowBetween}>
              <Text style={styles.meta}>{result.name}</Text>
              <Button
                title="Formar pareja"
                disabled={isMutating}
                onPress={() => onFormPairAndJoin(result.id)}
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
  const label = registration.pair
    ? pairLabel(registration.pair)
    : registration.player
      ? registration.player.name
      : registration.pair_id
        ? `Pareja #${registration.pair_id}`
        : `Jugador #${registration.player_id}`;

  return (
    <GlassPanel style={styles.card}>
      <View style={styles.rowBetween}>
        <View style={[styles.row, { flex: 1 }]}>
          <MaterialIcons name="groups" size={20} color={Colors.onSurfaceVariant} />
          <Text style={styles.cardTitle} numberOfLines={2}>
            {label}
          </Text>
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
          <Button title="Rechazar" variant="ghost" disabled={isMutating} onPress={onReject} />
          <Button title="Confirmar" variant="secondary" disabled={isMutating} onPress={onConfirm} />
        </View>
      )}
    </GlassPanel>
  );
}

function MatchSide({ label }: { label: string }) {
  return (
    <View style={styles.matchSide}>
      <View style={styles.matchSideDot} />
      <Text style={styles.matchSideLabel}>{label}</Text>
    </View>
  );
}

function MatchRow({ match, isFirst }: { match: Match; isFirst: boolean }) {
  const hasScore = match.match_sets && match.match_sets.length > 0;
  return (
    <View style={[styles.matchCard, !isFirst && styles.matchCardDivider]}>
      <MatchSide
        label={`${playerName(match.side1_player1, match.side1_player1_id)} / ${playerName(match.side1_player2, match.side1_player2_id)}`}
      />
      <Text style={styles.vsLabel}>vs</Text>
      <MatchSide
        label={`${playerName(match.side2_player1, match.side2_player1_id)} / ${playerName(match.side2_player2, match.side2_player2_id)}`}
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
        {hasScore && (
          <Text style={styles.score}>
            {match.match_sets!.map((set) => `${set.side1_games}-${set.side2_games}`).join(', ')}
          </Text>
        )}
      </View>
    </View>
  );
}

function PhaseSection({ phase, matches }: { phase: Phase; matches: Match[] }) {
  return (
    <GlassPanel style={styles.card}>
      <View style={styles.row}>
        <MaterialIcons name="calendar-today" size={18} color={Colors.primaryContainer} />
        <Text style={styles.cardTitle}>{phase.name}</Text>
      </View>
      {matches.map((match, index) => (
        <MatchRow key={match.id} match={match} isFirst={index === 0} />
      ))}
    </GlassPanel>
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
