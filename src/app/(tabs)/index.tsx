import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { isCompetitionActive } from '@/api/competitions';
import type { Competition } from '@/api/types';
import { Button } from '@/components/ui/button';
import { CompetitionCard } from '@/components/ui/competition-card';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useMyCompetitions } from '@/hooks/use-my-competitions';
import { useColors } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

type Role = 'jugador' | 'organizador';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [role, setRole] = useState<Role>('jugador');
  const { competitions, isLoading, error, refetch } = useMyCompetitions();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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
        <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />
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

      <View style={styles.cardsGrid}>
        {visible.map((competition) => (
          <View key={competition.id} style={styles.cardsGridItem}>
            <CompetitionCard competition={competition} />
          </View>
        ))}
      </View>
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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleButton, active && styles.roleButtonActive]}>
      <Text style={[styles.roleButtonLabel, active && styles.roleButtonLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    greeting: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    level: {
      ...Typography.bodySm,
      color: colors.primaryContainer,
      marginTop: Spacing.base,
    },
    roleSelector: {
      flexDirection: 'row',
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.glassBorder,
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
      backgroundColor: colors.primaryContainer,
    },
    roleButtonLabel: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    roleButtonLabelActive: {
      color: colors.onPrimary,
      fontFamily: FontFamilies.bodyBold,
    },
    statCard: {
      padding: Spacing.sm,
      gap: Spacing.base,
    },
    statLabel: {
      ...Typography.labelCaps,
      color: colors.onSurfaceVariant,
    },
    statValue: {
      ...Typography.display,
      fontSize: 40,
      color: colors.primary,
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
      color: colors.onSurfaceVariant,
    },
    cardsGrid:
      Platform.OS === 'web'
        ? { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }
        : { gap: Spacing.lg },
    cardsGridItem: Platform.OS === 'web' ? { width: 320 } : {},
  });
