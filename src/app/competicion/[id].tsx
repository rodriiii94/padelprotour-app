import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useCompetitionDetail } from '@/hooks/use-competition-detail';
import { inviteUrl } from '@/lib/invite';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';
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
  const [linkCopied, setLinkCopied] = useState(false);
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
  } = useCompetitionDetail(Number(id));

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isOrganizer = competition?.organizer_id === user?.id;

  const confirmCancel = useCallback(() => {
    Alert.alert(
      'Cancelar competición',
      'Se marcará como cancelada. No se podrán apuntar más parejas, pero los datos y el historial se conservan.',
      [
        { text: 'Volver', style: 'cancel' },
        { text: 'Cancelar competición', style: 'destructive', onPress: cancelCompetition },
      ]
    );
  }, [cancelCompetition]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      'Eliminar competición',
      'Se borrará para siempre, junto con sus categorías, partidos e inscripciones. Esta acción no se puede deshacer.',
      [
        { text: 'Volver', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            deleteCompetition()
              .then(() => router.back())
              .catch(() => {});
          },
        },
      ]
    );
  }, [deleteCompetition, router]);

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
            <GlassPanel style={styles.card}>
              <View style={styles.privacyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>
                    {competition.is_private ? 'Privada' : 'Pública'}
                  </Text>
                  <Text style={styles.meta}>
                    {competition.is_private
                      ? 'Solo visible por invitación.'
                      : 'Visible para cualquiera en Competiciones.'}
                  </Text>
                </View>
                <Button
                  title={competition.is_private ? 'Hacer pública' : 'Hacer privada'}
                  variant="secondary"
                  disabled={isUpdating}
                  onPress={togglePrivacy}
                />
              </View>

              {competition.is_private && (
                <View style={styles.inviteBox}>
                  {competition.invite_token ? (
                    <>
                      <Text style={styles.meta}>Enlace de invitación</Text>
                      <Text style={styles.inviteToken}>{inviteUrl(competition.invite_token)}</Text>
                      <Button
                        title={linkCopied ? '¡Enlace copiado!' : 'Copiar enlace'}
                        variant="secondary"
                        onPress={async () => {
                          await Clipboard.setStringAsync(inviteUrl(competition.invite_token!));
                          setLinkCopied(true);
                          setTimeout(() => setLinkCopied(false), 2000);
                        }}
                      />
                      <Button
                        title="Compartir enlace"
                        variant="ghost"
                        onPress={() =>
                          Share.share({
                            message: `Únete a "${competition.name}" en PadelProTour: ${inviteUrl(competition.invite_token!)}`,
                          })
                        }
                      />
                    </>
                  ) : (
                    <Text style={styles.meta}>
                      Esta competición no tiene código de invitación todavía.
                    </Text>
                  )}
                </View>
              )}

              <View style={styles.dangerZone}>
                {!competition.cancelled_at && (
                  <Button
                    title="Cancelar competición"
                    variant="danger"
                    disabled={isUpdating}
                    onPress={confirmCancel}
                  />
                )}
                <Button
                  title="Eliminar competición"
                  variant="danger"
                  disabled={isUpdating}
                  onPress={confirmDelete}
                />
              </View>
            </GlassPanel>
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
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inviteBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    gap: Spacing.xs,
    alignItems: 'flex-start',
  },
  dangerZone: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    gap: Spacing.xs,
  },
  inviteToken: {
    ...Typography.bodyMd,
    fontFamily: FontFamilies.bodyBold,
    color: Colors.primaryContainer,
    fontSize: 14,
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
