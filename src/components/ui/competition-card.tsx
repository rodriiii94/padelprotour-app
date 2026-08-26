import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import type { Competition } from '@/api/types';
import { Colors, Radii, Spacing, Typography } from '@/theme/tokens';

const TYPE_META = {
  tournament: { icon: 'emoji-events', label: 'Torneo', color: Colors.secondaryContainer },
  league: { icon: 'sports-tennis', label: 'Liga', color: Colors.primaryContainer },
} as const;

const dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

function formatDateRange(start: string, end: string | null): string {
  const startLabel = dateFormatter.format(new Date(start));
  if (!end) {
    return startLabel;
  }
  const endLabel = dateFormatter.format(new Date(end));
  return startLabel === endLabel ? startLabel : `${startLabel} – ${endLabel}`;
}

export function CompetitionCard({ competition }: { competition: Competition }) {
  const meta = TYPE_META[competition.type];
  const registrationOpen =
    competition.registration_closes_at !== null &&
    new Date(competition.registration_closes_at) > new Date();

  return (
    <GlassPanel style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{competition.name}</Text>
        <MaterialIcons name={meta.icon} size={22} color={meta.color} />
      </View>

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

      <View style={styles.footer}>
        <Text style={[styles.typeLabel, { color: meta.color }]}>{meta.label}</Text>
        {registrationOpen && (
          <Text style={styles.registrationLabel}>
            Inscripciones abiertas hasta{' '}
            {dateFormatter.format(new Date(competition.registration_closes_at as string))}
          </Text>
        )}
      </View>
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.primary,
    flex: 1,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.base,
  },
  typeLabel: {
    ...Typography.labelCaps,
    backgroundColor: Colors.glassFill,
    borderRadius: Radii.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  registrationLabel: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
    fontSize: 12,
  },
});
