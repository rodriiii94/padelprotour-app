import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import type { Competition } from '@/api/types';
import { useColors } from '@/hooks/use-theme';
import { formatDateRange } from '@/lib/dates';
import { Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

export function CompetitionCard({ competition }: { competition: Competition }) {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const typeMeta = useMemo(
    () => ({
      tournament: { icon: 'emoji-events', label: 'Torneo', color: colors.secondaryContainer },
      league: { icon: 'sports-tennis', label: 'Liga', color: colors.primaryContainer },
    } as const),
    [colors]
  );
  const meta = typeMeta[competition.type];
  const registrationOpen =
    competition.registration_closes_at !== null &&
    new Date(competition.registration_closes_at) > new Date();

  return (
    <Pressable onPress={() => router.push(`/competicion/${competition.id}`)}>
      <GlassPanel style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.name}>{competition.name}</Text>
          <MaterialIcons name={meta.icon} size={22} color={meta.color} />
        </View>

        {competition.venue && (
          <View style={styles.row}>
            <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
            <Text style={styles.meta}>{competition.venue}</Text>
          </View>
        )}

        <View style={styles.row}>
          <MaterialIcons name="calendar-today" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.meta}>
            {formatDateRange(competition.start_date, competition.end_date)}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.row}>
            <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
            {competition.cancelled_at && <Text style={styles.cancelledBadge}>Cancelada</Text>}
          </View>
          {registrationOpen && (
            <Text style={styles.registrationLabel}>
              Inscripciones abiertas hasta{' '}
              {dateFormatter.format(new Date(competition.registration_closes_at as string))}
            </Text>
          )}
        </View>
      </GlassPanel>
    </Pressable>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    card: {
      padding: Spacing.sm,
      gap: Spacing.base,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: Spacing.xs,
    },
    name: {
      ...Typography.headlineSm,
      color: colors.primary,
      flex: 1,
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
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: Spacing.base,
    },
    typeLabel: {
      ...Typography.labelCaps,
      backgroundColor: colors.glassFill,
      borderRadius: Radii.sm,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
    },
    cancelledBadge: {
      ...Typography.labelCaps,
      color: colors.onErrorContainer,
      backgroundColor: colors.errorContainer,
      borderRadius: Radii.sm,
      paddingHorizontal: Spacing.xs,
      paddingVertical: 2,
    },
    registrationLabel: {
      ...Typography.bodySm,
      color: colors.primaryContainer,
      fontSize: 12,
    },
  });
