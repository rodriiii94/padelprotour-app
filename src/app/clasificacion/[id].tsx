import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import type { Ranking } from '@/api/types';
import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { useGoBack } from '@/hooks/use-go-back';
import { useStandings } from '@/hooks/use-standings';
import { useColors } from '@/hooks/use-theme';
import {
  PODIUM_COLORS,
  signedDiff,
  standingName,
  standingPlayerIds,
  standingSummary,
} from '@/lib/standings';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/** A partir de este ancho cabe la tabla completa; por debajo, una tarjeta por fila. */
const TABLE_MIN_WIDTH = 720;

/** Columnas numéricas de la tabla, en orden. */
const COLUMNS: { key: string; label: string; value: (ranking: Ranking) => string | number }[] = [
  { key: 'played', label: 'PJ', value: (r) => r.played },
  { key: 'won', label: 'PG', value: (r) => r.won },
  { key: 'lost', label: 'PP', value: (r) => r.lost },
  { key: 'sets_won', label: 'SF', value: (r) => r.sets_won },
  { key: 'sets_lost', label: 'SC', value: (r) => r.sets_lost },
  { key: 'sets_diff', label: 'DS', value: (r) => signedDiff(r.sets_won, r.sets_lost) },
  { key: 'games_won', label: 'JF', value: (r) => r.games_won },
  { key: 'games_lost', label: 'JC', value: (r) => r.games_lost },
  { key: 'games_diff', label: 'DJ', value: (r) => signedDiff(r.games_won, r.games_lost) },
];

const LEGEND =
  'PJ: partidos jugados · PG: ganados · PP: perdidos · SF/SC: sets a favor y en contra · ' +
  'DS: diferencia de sets · JF/JC: juegos a favor y en contra · DJ: diferencia de juegos';

export default function StandingsScreen() {
  const { id, invite } = useLocalSearchParams<{ id: string; invite?: string }>();
  const goBack = useGoBack();
  const { user } = useAuth();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const showTable = useWindowDimensions().width >= TABLE_MIN_WIDTH;
  const { category, competition, rankings, isLoading, error, refetch } = useStandings(Number(id), invite);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const isMine = (ranking: Ranking) => user !== null && standingPlayerIds(ranking).includes(user.id);

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Volver">
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
      </View>

      <View>
        <Text role="heading" aria-level={1} style={styles.title}>
          Clasificación
        </Text>
        {category && (
          <Text style={styles.meta}>
            {category.name}
            {competition ? ` · ${competition.name}` : ''}
          </Text>
        )}
      </View>

      {isLoading && <ActivityIndicator color={colors.primaryContainer} style={styles.spinner} />}

      {error && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>{error}</Text>
        </GlassPanel>
      )}

      {!isLoading && !error && rankings.length === 0 && (
        <GlassPanel style={styles.card}>
          <Text style={styles.body}>
            Todavía no hay clasificación. Aparecerá cuando haya inscripciones confirmadas.
          </Text>
        </GlassPanel>
      )}

      {rankings.length > 0 &&
        (showTable ? (
          <GlassPanel role="table" aria-label="Clasificación" style={styles.table}>
            <View role="row" style={styles.tableHeader}>
              <Text role="columnheader" style={[styles.headerCell, styles.positionCell]}>
                #
              </Text>
              <Text role="columnheader" style={[styles.headerCell, styles.nameCell]}>
                {rankings[0].pair ? 'Pareja' : 'Jugador'}
              </Text>
              {COLUMNS.map((column) => (
                <Text key={column.key} role="columnheader" style={[styles.headerCell, styles.statCell]}>
                  {column.label}
                </Text>
              ))}
              <Text role="columnheader" style={[styles.headerCell, styles.pointsCell]}>
                Pts
              </Text>
            </View>
            {rankings.map((ranking) => {
              const { title, subtitle } = standingName(ranking);
              return (
                <View key={ranking.id} role="row" style={[styles.tableRow, isMine(ranking) && styles.mine]}>
                  <View role="cell" style={styles.positionCell}>
                    <PositionBadge position={ranking.position} styles={styles} />
                  </View>
                  <View role="cell" style={styles.nameCell}>
                    <Text style={[styles.name, isMine(ranking) && styles.nameMine]} numberOfLines={1}>
                      {title}
                    </Text>
                    {subtitle && (
                      <Text style={styles.subtitle} numberOfLines={1}>
                        {subtitle}
                      </Text>
                    )}
                  </View>
                  {COLUMNS.map((column) => (
                    <Text key={column.key} role="cell" style={[styles.cell, styles.statCell]}>
                      {column.value(ranking)}
                    </Text>
                  ))}
                  <Text role="cell" style={[styles.points, styles.pointsCell]}>
                    {ranking.points}
                  </Text>
                </View>
              );
            })}
          </GlassPanel>
        ) : (
          <View role="list" style={styles.cards}>
            {rankings.map((ranking) => {
              const { title, subtitle } = standingName(ranking);
              return (
                <GlassPanel
                  key={ranking.id}
                  role="listitem"
                  accessible
                  accessibilityLabel={standingSummary(ranking)}
                  style={[styles.rowCard, isMine(ranking) && styles.mine]}>
                  <View style={styles.rowCardTop}>
                    <PositionBadge position={ranking.position} styles={styles} />
                    <View style={styles.rowCardName}>
                      <Text style={[styles.name, isMine(ranking) && styles.nameMine]}>{title}</Text>
                      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    <View style={styles.rowCardPoints}>
                      <Text style={styles.pointsLarge}>{ranking.points}</Text>
                      <Text style={styles.pointsUnit}>pts</Text>
                    </View>
                  </View>
                  <View style={styles.statGrid}>
                    <Stat label="Jugados" value={ranking.played} styles={styles} />
                    <Stat label="G – P" value={`${ranking.won} – ${ranking.lost}`} styles={styles} />
                    <Stat
                      label="Sets"
                      value={`${ranking.sets_won} – ${ranking.sets_lost}`}
                      detail={signedDiff(ranking.sets_won, ranking.sets_lost)}
                      styles={styles}
                    />
                    <Stat
                      label="Juegos"
                      value={`${ranking.games_won} – ${ranking.games_lost}`}
                      detail={signedDiff(ranking.games_won, ranking.games_lost)}
                      styles={styles}
                    />
                  </View>
                </GlassPanel>
              );
            })}
          </View>
        ))}

      {rankings.length > 0 && (
        <View style={styles.notes}>
          {showTable && <Text style={styles.note}>{LEGEND}</Text>}
          <Text style={styles.note}>
            Victoria: 3 puntos. A igualdad de puntos desempata el enfrentamiento directo (si son dos),
            después la diferencia de sets, la de juegos y los juegos ganados. Solo cuentan los
            partidos con resultado confirmado.
          </Text>
        </View>
      )}
    </Screen>
  );
}

type Styles = ReturnType<typeof makeStyles>;

function PositionBadge({ position, styles }: { position: number; styles: Styles }) {
  const podium = PODIUM_COLORS[position];
  return (
    <View style={[styles.badge, podium ? { borderColor: podium + '80', backgroundColor: podium + '1f' } : null]}>
      <Text style={[styles.badgeText, podium ? { color: podium } : null]}>{position}</Text>
    </View>
  );
}

function Stat({
  label,
  value,
  detail,
  styles,
}: {
  label: string;
  value: string | number;
  /** Diferencia con signo, bajo el valor. */
  detail?: string;
  styles: Styles;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {detail ? <Text style={styles.statDetail}>{detail}</Text> : null}
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
    table: {
      paddingVertical: Spacing.xs,
    },
    tableHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingBottom: Spacing.xs,
      gap: Spacing.xs,
    },
    tableRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.sm,
      paddingVertical: 10,
      gap: Spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
    },
    headerCell: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 11,
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
    },
    positionCell: {
      width: 36,
    },
    nameCell: {
      flex: 1,
      minWidth: 0,
    },
    statCell: {
      width: 38,
      textAlign: 'center',
    },
    pointsCell: {
      width: 44,
      textAlign: 'right',
    },
    cell: {
      ...Typography.bodySm,
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
    points: {
      fontFamily: FontFamilies.headline,
      fontSize: 17,
      color: colors.primaryContainer,
      fontVariant: ['tabular-nums'],
    },
    name: {
      ...Typography.bodyMd,
      color: colors.onSurface,
    },
    nameMine: {
      fontFamily: FontFamilies.bodyBold,
    },
    subtitle: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    mine: {
      backgroundColor: colors.primaryContainer + '14',
    },
    badge: {
      width: 30,
      height: 30,
      borderRadius: Radii.full,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontFamily: FontFamilies.headline,
      fontSize: 14,
      color: colors.onSurfaceVariant,
    },
    cards: {
      gap: Spacing.xs,
    },
    rowCard: {
      padding: Spacing.sm,
      gap: Spacing.sm,
    },
    rowCardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
    },
    rowCardName: {
      flex: 1,
      minWidth: 0,
    },
    rowCardPoints: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: 4,
    },
    pointsLarge: {
      fontFamily: FontFamilies.display,
      fontSize: 24,
      color: colors.primaryContainer,
    },
    pointsUnit: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    stat: {
      flexGrow: 1,
      flexBasis: '20%',
      gap: 2,
    },
    statLabel: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 10,
      letterSpacing: 1,
      textTransform: 'uppercase',
      color: colors.onSurfaceVariant,
    },
    statValue: {
      ...Typography.bodyMd,
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
    },
    statDetail: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
    notes: {
      gap: Spacing.xs,
    },
    note: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
  });
