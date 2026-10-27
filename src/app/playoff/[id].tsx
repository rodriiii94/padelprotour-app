import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { deletePlayoff } from '@/api/categories';
import { ApiError, type PlayoffSide, type PlayoffSlot } from '@/api/types';
import { ActionChip } from '@/components/ui/action-chip';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';
import { usePlayoff } from '@/hooks/use-playoff';
import { useColors } from '@/hooks/use-theme';
import { confirmAction } from '@/lib/confirm';
import { formatBookingWhen } from '@/lib/booking';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/** A partir de este ancho caben las rondas en columnas, como un cuadro de torneo. */
const COLUMNS_MIN_WIDTH = 720;

const TROPHY_COLOR = '#ffc857';

export default function PlayoffScreen() {
  const { id, invite } = useLocalSearchParams<{ id: string; invite?: string }>();
  const categoryId = Number(id);
  const router = useRouter();
  const goBack = useGoBack();
  const { user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const asColumns = useWindowDimensions().width >= COLUMNS_MIN_WIDTH;
  const { category, competition, bracket, isLoading, error, refetch } = usePlayoff(categoryId, invite);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isOrganizer = user !== null && competition?.organizer_id === user.id;
  const hasResults = bracket?.rounds.some((round) => round.matches.some((slot) => slot.status && slot.status !== 'scheduled'));

  const openMatch = (slot: PlayoffSlot) => {
    if (slot.match_id) router.push(`/partido/${slot.match_id}?isOrganizer=${isOrganizer ? '1' : '0'}`);
  };

  const handleDelete = () =>
    confirmAction({
      title: 'Eliminar playoff',
      message: 'Se borrarán el cuadro y sus partidos. La liga no cambia. Podrás crearlo de nuevo.',
      confirmLabel: 'Eliminar',
      onConfirm: async () => {
        setIsDeleting(true);
        setDeleteError(null);
        try {
          await deletePlayoff(categoryId);
          router.replace(`/categoria/${categoryId}`);
        } catch (e) {
          const first = e instanceof ApiError ? Object.values(e.errors ?? {})[0]?.[0] : undefined;
          setDeleteError(first ?? 'No se pudo eliminar el playoff.');
          setIsDeleting(false);
        }
      },
    });

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Volver">
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <View>
        <Text role="heading" aria-level={1} style={styles.title}>
          Playoff
        </Text>
        {category && (
          <Text style={styles.meta}>
            {category.name}
            {competition ? ` · ${competition.name}` : ''}
          </Text>
        )}
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />}

      {(error ?? deleteError) && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error ?? deleteError}</Text>
        </GlassPanel>
      )}

      {bracket?.champion && (
        <GlassPanel style={styles.champion} accessible accessibilityLabel={`Campeón: ${bracket.champion.name}`}>
          <MaterialIcons name="emoji-events" size={32} color={TROPHY_COLOR} />
          <View style={styles.flex}>
            <Text style={styles.championLabel}>CAMPEÓN</Text>
            <Text style={styles.championName}>{bracket.champion.name}</Text>
          </View>
        </GlassPanel>
      )}

      {bracket && (
        <View style={asColumns ? styles.columns : styles.stack}>
          {bracket.rounds.map((round) => (
            <View key={round.phase_id} style={asColumns ? styles.column : styles.round}>
              <Text role="heading" aria-level={2} style={styles.roundTitle}>
                {round.name}
              </Text>
              <View style={asColumns ? styles.columnMatches : styles.roundMatches}>
                {round.matches.map((slot) => (
                  <SlotCard
                    key={slot.position}
                    slot={slot}
                    roundName={round.name}
                    onPress={() => openMatch(slot)}
                    styles={styles}
                  />
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {bracket && (
        <Text style={styles.note}>
          Eliminatorias a partido único: el ganador pasa de ronda en cuanto se confirma su resultado y el del otro
          cruce. El número junto a cada pareja es su posición en la liga.
        </Text>
      )}

      {bracket && isOrganizer && !hasResults && (
        <ActionChip
          icon="delete-outline"
          label={isDeleting ? 'Eliminando…' : 'Eliminar playoff'}
          tone="danger"
          disabled={isDeleting}
          onPress={handleDelete}
        />
      )}
    </Screen>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function slotSummary(slot: PlayoffSlot, roundName: string): string {
  const [a, b] = slot.sides.map((side) => side.name ?? side.placeholder);
  // El marcador viene desde el lado 1: se lee desde el ganador ("ganó X, 6-4 3-6 6-2").
  const winnerScore =
    slot.winner_side === 2
      ? slot.score?.split(' ').map((set) => set.split('-').reverse().join('-')).join(' ')
      : slot.score;
  const result =
    slot.winner_side && winnerScore
      ? `ganó ${slot.sides[slot.winner_side - 1].name}, ${winnerScore}`
      : slot.status === 'pending_validation'
        ? 'resultado pendiente de validar'
        : slot.match_id
          ? 'por jugar'
          : 'por decidir';
  return `${roundName}: ${a} contra ${b}, ${result}`;
}

function SlotCard({
  slot,
  roundName,
  onPress,
  styles,
}: {
  slot: PlayoffSlot;
  roundName: string;
  onPress: () => void;
  styles: Styles;
}) {
  const sets = slot.score?.split(' ').map((set) => set.split('-')) ?? [];
  const isPlayable = slot.match_id !== null;

  return (
    <Pressable
      onPress={onPress}
      disabled={!isPlayable}
      accessibilityRole={isPlayable ? 'link' : undefined}
      accessibilityLabel={slotSummary(slot, roundName)}
      style={({ pressed }) => [pressed && styles.pressed]}>
      <GlassPanel style={styles.slot}>
        {slot.sides.map((side, index) => (
          <SideRow
            key={index}
            side={side}
            games={sets.map((set) => set[index])}
            isWinner={slot.winner_side === index + 1}
            isLoser={slot.winner_side !== null && slot.winner_side !== index + 1}
            styles={styles}
          />
        ))}
        {slot.status === 'pending_validation' ? (
          <Text style={styles.slotFooter}>Resultado por validar</Text>
        ) : isPlayable && !slot.winner_side ? (
          <Text style={styles.slotFooter}>
            {slot.scheduled_at ? formatBookingWhen(slot.scheduled_at) : 'Pendiente de jugar'}
          </Text>
        ) : null}
      </GlassPanel>
    </Pressable>
  );
}

function SideRow({
  side,
  games,
  isWinner,
  isLoser,
  styles,
}: {
  side: PlayoffSide;
  games: (string | undefined)[];
  isWinner: boolean;
  isLoser: boolean;
  styles: Styles;
}) {
  if (side.placeholder !== undefined) {
    return (
      <View style={styles.sideRow}>
        <Text style={styles.seed} />
        <Text style={styles.placeholder} numberOfLines={1}>
          {side.placeholder}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.sideRow}>
      <Text style={styles.seed}>{side.seed ?? ''}</Text>
      <Text
        style={[styles.sideName, isWinner && styles.sideNameWinner, isLoser && styles.sideNameLoser]}
        numberOfLines={1}>
        {side.name}
      </Text>
      {games.map((value, index) => (
        <Text key={index} style={[styles.games, isWinner && styles.gamesWinner]}>
          {value}
        </Text>
      ))}
    </View>
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
    title: {
      ...Typography.headlineLg,
      color: colors.primary,
    },
    meta: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    body: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    card: {
      padding: Spacing.sm,
    },
    flex: {
      flex: 1,
    },
    champion: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      padding: Spacing.sm,
      borderColor: TROPHY_COLOR + '66',
    },
    championLabel: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 11,
      letterSpacing: 1.2,
      color: TROPHY_COLOR,
    },
    championName: {
      ...Typography.headlineSm,
      color: colors.primary,
    },
    columns: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    column: {
      flex: 1,
      gap: Spacing.xs,
    },
    // Cada partido ocupa el mismo hueco vertical que los dos que lo alimentan: así queda
    // a la altura de sus cruces de origen, como en un cuadro.
    columnMatches: {
      flex: 1,
      justifyContent: 'space-around',
      gap: Spacing.sm,
    },
    stack: {
      gap: Spacing.md,
    },
    round: {
      gap: Spacing.xs,
    },
    roundMatches: {
      gap: Spacing.xs,
    },
    roundTitle: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 12,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
    slot: {
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      gap: 2,
      borderRadius: Radii.lg,
    },
    pressed: {
      opacity: 0.7,
    },
    sideRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      minHeight: 28,
    },
    seed: {
      ...Typography.bodySm,
      width: 16,
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      fontVariant: ['tabular-nums'],
    },
    sideName: {
      ...Typography.bodySm,
      flex: 1,
      color: colors.onSurface,
    },
    sideNameWinner: {
      fontFamily: FontFamilies.bodyBold,
      color: colors.primary,
    },
    sideNameLoser: {
      color: colors.onSurfaceVariant,
    },
    placeholder: {
      ...Typography.bodySm,
      flex: 1,
      fontStyle: 'italic',
      color: colors.onSurfaceVariant,
    },
    games: {
      ...Typography.bodySm,
      width: 18,
      textAlign: 'center',
      color: colors.onSurfaceVariant,
      fontVariant: ['tabular-nums'],
    },
    gamesWinner: {
      fontFamily: FontFamilies.bodyBold,
      color: colors.primaryContainer,
    },
    slotFooter: {
      ...Typography.bodySm,
      fontSize: 12,
      color: colors.onSurfaceVariant,
      paddingLeft: 16 + Spacing.xs,
    },
    note: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
  });
