import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { searchUsers } from '@/api/categories';
import type { Match, Phase, Registration, RegistrationStatus, User } from '@/api/types';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { TextField } from '@/components/ui/text-field';
import { useAuth } from '@/hooks/use-auth';
import { useCategoryDetail } from '@/hooks/use-category-detail';
import { Colors, Spacing, Typography } from '@/theme/tokens';

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
            <View>
              <Text style={styles.sectionTitle}>Inscripciones</Text>
              {registrations.length === 0 ? (
                <GlassPanel style={styles.card}>
                  <Text style={styles.body}>Todavía no hay inscripciones.</Text>
                </GlassPanel>
              ) : (
                registrations.map((registration) => (
                  <RegistrationRow
                    key={registration.id}
                    registration={registration}
                    isMutating={isMutating}
                    onConfirm={() => confirmRegistration(registration.id)}
                    onReject={() => rejectRegistration(registration.id)}
                  />
                ))
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
            <View>
              <Text style={styles.sectionTitle}>Calendario</Text>
              {phases.map((phase) => (
                <PhaseSection key={phase.id} phase={phase} matches={matchesByPhase[phase.id] ?? []} />
              ))}
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
  availablePairs: { id: number; player1_id: number; player2_id: number }[];
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
          <Text style={styles.meta}>Pareja #{pair.id}</Text>
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
  return (
    <GlassPanel style={styles.card}>
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.cardTitle}>
            {registration.pair_id ? `Pareja #${registration.pair_id}` : `Jugador #${registration.player_id}`}
          </Text>
          <Text style={[styles.meta, { color: STATUS_COLOR[registration.status] }]}>
            {STATUS_LABEL[registration.status]}
          </Text>
        </View>
        {registration.status === 'pending' && (
          <View style={{ flexDirection: 'row', gap: Spacing.xs }}>
            <Button title="Rechazar" variant="ghost" disabled={isMutating} onPress={onReject} />
            <Button title="Confirmar" variant="secondary" disabled={isMutating} onPress={onConfirm} />
          </View>
        )}
      </View>
    </GlassPanel>
  );
}

function PhaseSection({ phase, matches }: { phase: Phase; matches: Match[] }) {
  return (
    <GlassPanel style={styles.card}>
      <Text style={styles.cardTitle}>{phase.name}</Text>
      {matches.map((match) => (
        <View key={match.id} style={styles.matchRow}>
          <Text style={styles.meta}>
            Jugador #{match.side1_player1_id} / #{match.side1_player2_id} vs. Jugador #
            {match.side2_player1_id} / #{match.side2_player2_id}
          </Text>
          <View style={styles.rowBetween}>
            <Text style={styles.meta}>
              {match.court ?? 'Pista sin asignar'}
              {match.scheduled_at ? ` · ${dateFormatter.format(new Date(match.scheduled_at))}` : ''}
            </Text>
            {match.match_sets && match.match_sets.length > 0 && (
              <Text style={styles.score}>
                {match.match_sets.map((set) => `${set.side1_games}-${set.side2_games}`).join(', ')}
              </Text>
            )}
          </View>
        </View>
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
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  matchRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingTop: Spacing.xs,
    marginTop: Spacing.xs,
    gap: 2,
  },
  score: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
    fontSize: 12,
  },
  error: {
    ...Typography.bodySm,
    color: Colors.error,
  },
});
