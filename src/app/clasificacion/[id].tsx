import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
  standingLines,
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

/** En móvil solo caben las columnas clave; sets y juegos se ven al tocar la fila. */
const COMPACT_COLUMNS: typeof COLUMNS = [
  { key: 'played', label: 'PJ', value: (r) => r.played },
  { key: 'won', label: 'G', value: (r) => r.won },
  { key: 'lost', label: 'P', value: (r) => r.lost },
  { key: 'sets_diff', label: 'DS', value: (r) => signedDiff(r.sets_won, r.sets_lost) },
];

const COMPACT_LEGEND =
  'PJ: jugados · G: ganados · P: perdidos · DS: diferencia de sets. Toca una fila para ver sets y juegos.';

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
  const [expandedId, setExpandedId] = useState<number | null>(null);
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
          <GlassPanel style={styles.compact}>
            <View style={styles.compactHeader}>
              <Text style={[styles.headerCell, styles.compactPosition]}>#</Text>
              <Text style={[styles.headerCell, styles.nameCell]}>{rankings[0].pair ? 'Pareja' : 'Jugador'}</Text>
              {COMPACT_COLUMNS.map((column) => (
                <Text key={column.key} style={[styles.headerCell, styles.compactStat]}>
                  {column.label}
                </Text>
              ))}
              <Text style={[styles.headerCell, styles.compactPoints]}>Pts</Text>
            </View>
            {rankings.map((ranking) => {
              const isExpanded = expandedId === ranking.id;
              return (
                <Pressable
                  key={ranking.id}
                  onPress={() => setExpandedId(isExpanded ? null : ranking.id)}
                  accessibilityRole="button"
                  aria-expanded={isExpanded}
                  accessibilityLabel={standingSummary(ranking)}
                  style={[styles.compactRow, isMine(ranking) && styles.mine]}>
                  <View style={styles.compactLine}>
                    <View style={styles.compactPosition}>
                      <PositionBadge position={ranking.position} styles={styles} small />
                    </View>
                    <View style={styles.nameCell}>
                      {standingLines(ranking).map((line, index) => (
                        <Text
                          key={index}
                          numberOfLines={1}
                          style={[
                            line.secondary ? styles.compactSubtitle : styles.compactName,
                            isMine(ranking) && !line.secondary && styles.nameMine,
                          ]}>
                          {line.text}
                        </Text>
                      ))}
                    </View>
                    {COMPACT_COLUMNS.map((column) => (
                      <Text key={column.key} style={[styles.cell, styles.compactStat]}>
                        {column.value(ranking)}
                      </Text>
                    ))}
                    <Text style={[styles.points, styles.compactPoints]}>{ranking.points}</Text>
                  </View>
                  {isExpanded && (
                    <View style={styles.compactDetail}>
                      <Text style={styles.compactDetailText}>
                        Sets {ranking.sets_won}–{ranking.sets_lost} ({signedDiff(ranking.sets_won, ranking.sets_lost)})
                      </Text>
                      <Text style={styles.compactDetailText}>
                        Juegos {ranking.games_won}–{ranking.games_lost} (
                        {signedDiff(ranking.games_won, ranking.games_lost)})
                      </Text>
                    </View>
                  )}
                </Pressable>
              );
            })}
          </GlassPanel>
        ))}

      {rankings.length > 0 && (
        <View style={styles.notes}>
          <Text style={styles.note}>{showTable ? LEGEND : COMPACT_LEGEND}</Text>
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

function PositionBadge({ position, styles, small = false }: { position: number; styles: Styles; small?: boolean }) {
  const podium = PODIUM_COLORS[position];
  return (
    <View
      style={[
        styles.badge,
        small && styles.badgeSmall,
        podium ? { borderColor: podium + '80', backgroundColor: podium + '1f' } : null,
      ]}>
      <Text style={[styles.badgeText, podium ? { color: podium } : null]}>{position}</Text>
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
    badgeSmall: {
      width: 24,
      height: 24,
    },
    compact: {
      paddingVertical: Spacing.xs,
    },
    compactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingBottom: Spacing.xs,
      gap: 4,
    },
    compactRow: {
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderTopColor: colors.glassBorder,
      gap: 6,
    },
    compactLine: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    compactPosition: {
      width: 28,
    },
    compactStat: {
      width: 22,
      textAlign: 'center',
    },
    compactPoints: {
      width: 26,
      textAlign: 'right',
    },
    compactName: {
      ...Typography.bodySm,
      color: colors.onSurface,
    },
    compactSubtitle: {
      fontFamily: FontFamilies.body,
      fontSize: 12,
      lineHeight: 17,
      color: colors.onSurfaceVariant,
    },
    compactDetail: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      columnGap: Spacing.sm,
      paddingLeft: 32,
    },
    compactDetailText: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      fontVariant: ['tabular-nums'],
    },
    notes: {
      gap: Spacing.xs,
    },
    note: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
  });
