import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Ranking, StandingMatch } from '@/api/types';
import { useColors } from '@/hooks/use-theme';
import { formatBookingWhen } from '@/lib/booking';
import { RESULT_COLORS, nextMatch, playedMatches } from '@/lib/standings';
import { FontFamilies, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

/** Detalle de una fila de la clasificación: su próximo partido y sus resultados, cada uno enlazado. */
export function StandingMatches({ ranking, isOrganizer }: { ranking: Ranking; isOrganizer: boolean }) {
  const router = useRouter();
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const upcoming = nextMatch(ranking);
  const played = playedMatches(ranking);

  const open = (match: StandingMatch) => router.push(`/partido/${match.id}?isOrganizer=${isOrganizer ? '1' : '0'}`);

  if (!upcoming && played.length === 0) {
    return <Text style={styles.empty}>Todavía no tiene partidos.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {upcoming && (
        <View style={styles.group}>
          <Text style={styles.label}>PRÓXIMO PARTIDO</Text>
          <MatchLine match={upcoming} onPress={() => open(upcoming)} styles={styles}>
            <View style={styles.top}>
              <MaterialIcons name="event" size={14} color={colors.onSurfaceVariant} />
              <Text style={styles.score} numberOfLines={1}>
                {upcoming.scheduled_at ? formatBookingWhen(upcoming.scheduled_at) : 'Sin fecha'}
              </Text>
              <Text style={styles.side} numberOfLines={1}>
                {upcoming.club ?? upcoming.phase}
              </Text>
            </View>
            <Text style={styles.opponent} numberOfLines={1}>
              vs {upcoming.opponent}
            </Text>
          </MatchLine>
        </View>
      )}

      {played.length > 0 && (
        <View style={styles.group}>
          <Text style={styles.label}>RESULTADOS</Text>
          {played.map((match) => (
            <MatchLine key={match.id} match={match} onPress={() => open(match)} styles={styles}>
              <View style={styles.top}>
                <View
                  style={[
                    styles.resultDot,
                    match.result
                      ? { backgroundColor: RESULT_COLORS[match.result] }
                      : { borderWidth: 1, borderColor: colors.onSurfaceVariant },
                  ]}
                />
                <Text style={styles.score} numberOfLines={1}>
                  {match.score}
                </Text>
                <Text style={styles.side} numberOfLines={1}>
                  {match.result ? match.phase : 'Por validar'}
                </Text>
              </View>
              <Text style={styles.opponent} numberOfLines={1}>
                vs {match.opponent}
              </Text>
            </MatchLine>
          ))}
        </View>
      )}
    </View>
  );
}

function matchSummary(match: StandingMatch): string {
  if (match.score === null) return `Próximo partido contra ${match.opponent}`;
  const outcome = match.result === 'won' ? 'Ganado' : match.result === 'lost' ? 'Perdido' : 'Pendiente de validar';
  return `${outcome} ${match.score} contra ${match.opponent}, ${match.phase}`;
}

function MatchLine({
  match,
  onPress,
  styles,
  children,
}: {
  match: StandingMatch;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="link"
      accessibilityLabel={matchSummary(match)}
      style={({ pressed }) => [styles.line, pressed && styles.pressed]}>
      {children}
    </Pressable>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    wrap: {
      gap: Spacing.sm,
    },
    group: {
      gap: 2,
    },
    label: {
      fontFamily: FontFamilies.bodyBold,
      fontSize: 10,
      letterSpacing: 1,
      color: colors.onSurfaceVariant,
      marginBottom: 2,
    },
    line: {
      paddingVertical: 6,
      gap: 1,
    },
    top: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pressed: {
      opacity: 0.6,
    },
    resultDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    score: {
      ...Typography.bodySm,
      fontFamily: FontFamilies.bodyBold,
      color: colors.onSurface,
      fontVariant: ['tabular-nums'],
      flexShrink: 0,
    },
    side: {
      ...Typography.bodySm,
      fontSize: 12,
      color: colors.onSurfaceVariant,
      flexShrink: 1,
      marginLeft: 'auto',
    },
    opponent: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
      paddingLeft: 14,
    },
    empty: {
      ...Typography.bodySm,
      color: colors.onSurfaceVariant,
    },
  });
