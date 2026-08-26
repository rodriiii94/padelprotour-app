import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { isCompetitionActive } from '@/api/competitions';
import type { Competition } from '@/api/types';
import { Button } from '@/components/ui/button';
import { CompetitionCard } from '@/components/ui/competition-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useMyCompetitions } from '@/hooks/use-my-competitions';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

type Role = 'jugador' | 'organizador';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [role, setRole] = useState<Role>('jugador');
  const { competitions, isLoading, error, refetch } = useMyCompetitions();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const { organizing, playing } = useMemo(() => {
    const organizing: Competition[] = [];
    const playing: Competition[] = [];
    for (const competition of competitions) {
      (competition.organizer_id === user?.id ? organizing : playing).push(competition);
    }
    return { organizing, playing };
  }, [competitions, user?.id]);

  const visible = role === 'jugador' ? playing : organizing;
  const activeCount = visible.filter(isCompetitionActive).length;

  return (
    <Screen>
      <View>
        <Text style={styles.greeting}>¡Hola, {user?.name.split(' ')[0] ?? ''}!</Text>
        {user?.level && <Text style={styles.level}>Nivel {user.level}</Text>}
      </View>

      <View style={styles.roleSelector}>
        <RoleButton label="Jugador" active={role === 'jugador'} onPress={() => setRole('jugador')} />
        <RoleButton
          label="Organizador"
          active={role === 'organizador'}
          onPress={() => setRole('organizador')}
        />
      </View>

      <GlassPanel style={styles.statCard}>
        <Text style={styles.statLabel}>COMPETICIONES ACTIVAS</Text>
        <Text style={styles.statValue}>{activeCount}</Text>
      </GlassPanel>

      {role === 'organizador' && (
        <Button
          title="Crear competición"
          onPress={() => router.push('/crear-competicion')}
        />
      )}

      {isLoading && competitions.length === 0 && (
        <ActivityIndicator color={Colors.primaryContainer} style={styles.spinner} />
      )}

      {error && (
        <GlassPanel style={styles.messageCard}>
          <Text style={styles.messageText}>{error}</Text>
          <Button title="Reintentar" variant="secondary" onPress={refetch} />
        </GlassPanel>
      )}

      {!isLoading && !error && visible.length === 0 && (
        <GlassPanel style={styles.messageCard}>
          <Text style={styles.messageText}>
            {role === 'jugador'
              ? 'Todavía no estás inscrito en ninguna competición.'
              : 'Todavía no organizas ninguna competición.'}
          </Text>
        </GlassPanel>
      )}

      {visible.map((competition) => (
        <CompetitionCard key={competition.id} competition={competition} />
      ))}
    </Screen>
  );
}

function RoleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleButton, active && styles.roleButtonActive]}>
      <Text style={[styles.roleButtonLabel, active && styles.roleButtonLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  level: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
    marginTop: Spacing.base,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.full,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  roleButtonLabel: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  roleButtonLabelActive: {
    color: Colors.onPrimary,
    fontFamily: FontFamilies.bodyBold,
  },
  statCard: {
    padding: Spacing.sm,
    gap: Spacing.base,
  },
  statLabel: {
    ...Typography.labelCaps,
    color: Colors.onSurfaceVariant,
  },
  statValue: {
    ...Typography.display,
    fontSize: 40,
    color: Colors.primary,
  },
  spinner: {
    marginTop: Spacing.lg,
  },
  messageCard: {
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  messageText: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
