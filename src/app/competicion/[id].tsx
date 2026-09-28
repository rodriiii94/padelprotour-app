import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { OrganizerPanel } from '@/components/competition/organizer-panel';
import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';
import { useCompetitionDetail } from '@/hooks/use-competition-detail';
import { useColors } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { formatDateRange } from '@/lib/dates';
import { Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';
import type { Category, RegistrationMode } from '@/api/types';

const REGISTRATION_MODE_LABEL: Record<Exclude<RegistrationMode, null>, string> = {
  fixed_pair: 'Pareja fija',
  individual_rotating: 'Individual (rotación)',
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export default function CompetitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const goBack = useGoBack();
  const { user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const typeMeta = useMemo(
    () => ({
      tournament: { icon: 'emoji-events', label: 'Torneo', color: colors.secondaryContainer },
      league: { icon: 'sports-tennis', label: 'Liga', color: colors.primaryContainer },
    } as const),
    [colors]
  );
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

      {competition && (
        <>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{competition.name}</Text>
              <MaterialIcons
                name={typeMeta[competition.type].icon}
                size={26}
                color={typeMeta[competition.type].color}
              />
            </View>
            <View style={styles.row}>
              <Text style={[styles.typeLabel, { color: typeMeta[competition.type].color }]}>
                {typeMeta[competition.type].label}
              </Text>
              {competition.cancelled_at && (
                <Text style={styles.cancelledBadge}>Cancelada</Text>
              )}
            </View>
          </View>

          <GlassPanel style={styles.card}>
            {competition.venue && (
              <View style={styles.row}>
                <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
                <Text style={styles.meta}>{competition.venue}</Text>
              </View>
            )}
            <View style={styles.row}>
              <MaterialIcons name="calendar-today" size={16} color={colors.onSurfaceVariant} />
              <Text style={styles.meta}>
                {formatDateRange(competition.start_date, competition.end_date, { year: true })}
              </Text>
            </View>
            {competition.registration_closes_at && (
              <View style={styles.row}>
                <MaterialIcons name="how-to-reg" size={16} color={colors.onSurfaceVariant} />
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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable onPress={() => router.push(`/categoria/${category.id}`)}>
      <GlassPanel style={styles.card}>
        <Text style={styles.cardTitle}>{category.name}</Text>
        <View style={styles.row}>
          <MaterialIcons name="groups" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.meta}>
            {category.registration_mode
              ? REGISTRATION_MODE_LABEL[category.registration_mode]
              : REGISTRATION_MODE_LABEL.fixed_pair}
            {category.slots ? ` · ${category.slots} plazas` : ''}
          </Text>
        </View>
        {category.match_format && (
          <View style={styles.row}>
            <MaterialIcons name="sports-tennis" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.meta}>{category.match_format}</Text>
          </View>
        )}
      </GlassPanel>
    </Pressable>
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
    titleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.xs,
    },
    title: {
      ...Typography.headlineLg,
      color: colors.primary,
      flex: 1,
    },
    typeLabel: {
      ...Typography.labelCaps,
      marginTop: Spacing.base,
    },
    cancelledBadge: {
      ...Typography.labelCaps,
      marginTop: Spacing.base,
      color: colors.onErrorContainer,
      backgroundColor: colors.errorContainer,
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
      color: colors.primary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.base,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    sectionTitle: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
  });
