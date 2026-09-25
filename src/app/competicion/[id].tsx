import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { OrganizerPanel } from '@/components/competition/organizer-panel';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useCompetitionDetail } from '@/hooks/use-competition-detail';
import { confirmAction } from '@/lib/confirm';
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens';
import type { Category, RegistrationMode } from '@/api/types';

const TYPE_META = {
  tournament: { icon: 'emoji-events', label: 'Torneo', color: Colors.secondaryContainer },
  league: { icon: 'sports-tennis', label: 'Liga', color: Colors.primaryContainer },
} as const;

const REGISTRATION_MODE_LABEL: Record<Exclude<RegistrationMode, null>, string> = {
  fixed_pair: 'Pareja fija',
  individual_rotating: 'Individual (rotación)',
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function formatDateRange(start: string, end: string | null): string {
  const startLabel = dateFormatter.format(new Date(start));
  if (!end) return startLabel;
  const endLabel = dateFormatter.format(new Date(end));
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const {
    competition,
    categories,
    isLoading,
    isUpdating,
    error,
    refetch,
    togglePrivacy,
    cancelCompetition,
    deleteCompetition,
    regenerateInvite,
  } = useCompetitionDetail(Number(id));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isOrganizer = competition?.organizer_id === user?.id;

  const confirmCancel = useCallback(() => {
    confirmAction({
      title: 'Cancelar competición',
      message:
        'Se marcará como cancelada. No se podrán apuntar más parejas, pero los datos y el historial se conservan.',
      confirmLabel: 'Cancelar competición',
      onConfirm: cancelCompetition,
    });
  }, [cancelCompetition]);

  const confirmDelete = useCallback(() => {
    confirmAction({
      title: 'Eliminar competición',
      message:
        'Se borrará para siempre, junto con sus categorías, partidos e inscripciones. Esta acción no se puede deshacer.',
      confirmLabel: 'Eliminar',
      onConfirm: () => {
        deleteCompetition()
          .then(() => (router.canGoBack() ? router.back() : router.replace('/')))
          .catch(() => {});
      },
    });
  }, [deleteCompetition, router]);

  const confirmRegenerateInvite = useCallback(() => {
    confirmAction({
      title: 'Regenerar enlace',
      message: 'El enlace actual dejará de funcionar. Quien ya lo tenga necesitará el nuevo.',
      confirmLabel: 'Regenerar',
      onConfirm: regenerateInvite,
    });
  }, [regenerateInvite]);

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

      {competition && (
        <>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{competition.name}</Text>
              <MaterialIcons
                name={TYPE_META[competition.type].icon}
                size={26}
                color={TYPE_META[competition.type].color}
              />
            </View>
            <View style={styles.row}>
              <Text style={[styles.typeLabel, { color: TYPE_META[competition.type].color }]}>
                {TYPE_META[competition.type].label}
              </Text>
              {competition.cancelled_at && (
                <Text style={styles.cancelledBadge}>Cancelada</Text>
              )}
            </View>
          </View>

          <GlassPanel style={styles.card}>
            {competition.venue && (
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.meta}>{competition.venue}</Text>
              </View>
            )}
            <View style={styles.row}>
              <MaterialIcons name="calendar-today" size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.meta}>
                {formatDateRange(competition.start_date, competition.end_date)}
              </Text>
            </View>
            {competition.registration_closes_at && (
              <View style={styles.row}>
                <MaterialIcons name="how-to-reg" size={16} color={Colors.onSurfaceVariant} />
                <Text style={styles.meta}>
                  Inscripciones hasta {dateFormatter.format(new Date(competition.registration_closes_at))}
                </Text>
              </View>
            )}
          </GlassPanel>

          {isOrganizer && (
            <OrganizerPanel
              competition={competition}
              disabled={isUpdating}
              onTogglePrivacy={togglePrivacy}
              onRegenerateInvite={confirmRegenerateInvite}
              onCancel={confirmCancel}
              onDelete={confirmDelete}
            />
          )}

          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categorías</Text>
              {isOrganizer && (
                <Button
                  title="Crear categoría"
                  variant="ghost"
                  onPress={() =>
                    router.push({
                      pathname: '/crear-categoria',
                      params: { competitionId: String(competition.id) },
                    })
                  }
                />
              )}
            </View>
            {categories.length === 0 ? (
              <GlassPanel style={styles.card}>
                <Text style={styles.body}>Todavía no hay categorías creadas.</Text>
              </GlassPanel>
            ) : (
              categories.map((category) => <CategoryRow key={category.id} category={category} />)
            )}
          </View>
        </>
      )}
    </Screen>
  );
}

function CategoryRow({ category }: { category: Category }) {
  const router = useRouter();
  return (
    <Pressable onPress={() => router.push(`/categoria/${category.id}`)}>
      <GlassPanel style={styles.card}>
        <Text style={styles.cardTitle}>{category.name}</Text>
        <View style={styles.row}>
          <MaterialIcons name="groups" size={16} color={Colors.onSurfaceVariant} />
          <Text style={styles.meta}>
            {category.registration_mode
              ? REGISTRATION_MODE_LABEL[category.registration_mode]
              : REGISTRATION_MODE_LABEL.fixed_pair}
            {category.slots ? ` · ${category.slots} plazas` : ''}
          </Text>
        </View>
        {category.match_format && (
          <View style={styles.row}>
            <MaterialIcons name="sports-tennis" size={16} color={Colors.onSurfaceVariant} />
            <Text style={styles.meta}>{category.match_format}</Text>
          </View>
        )}
      </GlassPanel>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  title: {
    ...Typography.headlineLg,
    color: Colors.primary,
    flex: 1,
  },
  typeLabel: {
    ...Typography.labelCaps,
    marginTop: Spacing.base,
  },
  cancelledBadge: {
    ...Typography.labelCaps,
    marginTop: Spacing.base,
    color: Colors.onErrorContainer,
    backgroundColor: Colors.errorContainer,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  card: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  meta: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  body: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  sectionTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
});
