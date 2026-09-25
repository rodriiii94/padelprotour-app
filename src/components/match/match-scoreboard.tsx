import { MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { Match } from '@/api/types';
import { PlayerNames } from '@/components/ui/player-names';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

const STATUS_BADGE: Record<Match['status'], { label: string; color: string }> = {
  scheduled: { label: 'Programado', color: Colors.onSurfaceVariant },
  in_progress: { label: 'En juego', color: Colors.secondaryContainer },
  pending_validation: { label: 'Pendiente de validar', color: Colors.secondaryContainer },
  completed: { label: 'Finalizado', color: Colors.primaryContainer },
};

/** Insignia con el estado del partido. */
export function MatchStatusBadge({ status, small = false }: { status: Match['status']; small?: boolean }) {
  const { label, color } = STATUS_BADGE[status];
  return (
    <View style={[styles.badge, small && styles.badgeSmall, { borderColor: color + '80' }]}>
      <Text style={[styles.badgeLabel, small && styles.badgeLabelSmall, { color }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function sidePlayers(match: Match, side: 1 | 2): { id: number; name: string }[] {
  const ids =
    side === 1
      ? [match.side1_player1_id, match.side1_player2_id]
      : [match.side2_player1_id, match.side2_player2_id];
  const summaries =
    side === 1 ? [match.side1_player1, match.side1_player2] : [match.side2_player1, match.side2_player2];
  return ids.map((id, index) => ({ id, name: summaries[index]?.name ?? `Jugador #${id}` }));
}

/**
 * Las dos parejas, una fila cada una, con los juegos de cada set en columnas. La pareja
 * ganadora (partido finalizado) lleva trofeo y nombre destacado; el set ganado, en verde.
 */
export function ScoreRows({ match, compact = false }: { match: Match; compact?: boolean }) {
  return (
    <View>
      {([1, 2] as const).map((side) => {
        const isWinner = match.status === 'completed' && match.winner_side === side;
        return (
          <View
            key={side}
            style={[styles.row, compact && styles.rowCompact, side === 1 && styles.rowDivider]}>
            <View style={styles.marker}>
              {isWinner ? (
                <MaterialIcons name="emoji-events" size={compact ? 16 : 18} color={Colors.secondaryContainer} />
              ) : (
                <View style={styles.dot} />
              )}
            </View>
            <View style={styles.names}>
              <PlayerNames
                style={[styles.name, compact && styles.nameCompact, isWinner && styles.nameWinner]}
                players={sidePlayers(match, side)}
              />
            </View>
            {(match.match_sets ?? []).map((set) => {
              const mine = side === 1 ? set.side1_games : set.side2_games;
              const theirs = side === 1 ? set.side2_games : set.side1_games;
              return (
                <Text
                  key={set.id}
                  style={[styles.set, compact && styles.setCompact, mine > theirs && styles.setWon]}>
                  {mine}
                </Text>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing.xs + 2,
    paddingVertical: 4,
  },
  badgeSmall: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  badgeLabel: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 11,
    letterSpacing: 1,
  },
  badgeLabelSmall: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs + 2,
  },
  rowCompact: {
    paddingVertical: 6,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.glassBorder,
  },
  marker: {
    width: 20,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.outlineVariant,
  },
  names: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...Typography.bodyMd,
    color: Colors.onSurface,
  },
  nameCompact: {
    fontSize: 15,
  },
  nameWinner: {
    fontFamily: FontFamilies.bodyBold,
    color: Colors.primary,
  },
  set: {
    width: 28,
    textAlign: 'center',
    fontFamily: FontFamilies.display,
    fontSize: 22,
    color: Colors.onSurfaceVariant,
  },
  setCompact: {
    width: 24,
    fontSize: 18,
  },
  setWon: {
    color: Colors.primaryContainer,
  },
});
