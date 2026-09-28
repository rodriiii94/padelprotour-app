import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Match, PublicUserSummary } from '@/api/types';
import { Avatar } from '@/components/ui/avatar';
import { PlayerNames } from '@/components/ui/player-names';
import { useColors } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, Typography, type ColorPalette } from '@/theme/tokens';

const makeStatusBadge = (colors: ColorPalette): Record<Match['status'], { label: string; color: string }> => ({
  scheduled: { label: 'Programado', color: colors.onSurfaceVariant },
  in_progress: { label: 'En juego', color: colors.secondaryContainer },
  pending_validation: { label: 'Pendiente de validar', color: colors.secondaryContainer },
  completed: { label: 'Finalizado', color: colors.primaryContainer },
});

/** Insignia con el estado del partido. */
export function MatchStatusBadge({ status, small = false }: { status: Match['status']; small?: boolean }) {
  const colorsPalette = useColors();
  const styles = useMemo(() => makeStyles(colorsPalette), [colorsPalette]);
  const statusBadge = useMemo(() => makeStatusBadge(colorsPalette), [colorsPalette]);
  const { label, color } = statusBadge[status];

  return (
    <View style={[styles.badge, small && styles.badgeSmall, { borderColor: color + '80' }]}>
      <Text style={[styles.badgeLabel, small && styles.badgeLabelSmall, { color }]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function sidePlayers(match: Match, side: 1 | 2): PublicUserSummary[] {
  const ids =
    side === 1
      ? [match.side1_player1_id, match.side1_player2_id]
      : [match.side2_player1_id, match.side2_player2_id];
  const summaries =
    side === 1 ? [match.side1_player1, match.side1_player2] : [match.side2_player1, match.side2_player2];
  return ids.map((id, index) => summaries[index] ?? emptyPlayer(id));
}

function emptyPlayer(id: number): PublicUserSummary {
  return {
    id,
    name: `Jugador #${id}`,
    level: null,
    club: null,
    city: null,
    avatar_color: null,
    avatar_emoji: null,
    avatar_url: null,
  };
}

/**
 * Las dos parejas, una fila cada una, con los juegos de cada set en columnas. La pareja
 * ganadora (partido finalizado) lleva trofeo y nombre destacado; el set ganado, en verde.
 * Cada nombre lleva su foto de perfil al lado, y el del usuario que ha iniciado sesión
 * sale en negrita para poder identificar sus partidos de un vistazo.
 */
export function ScoreRows({
  match,
  compact = false,
  currentUserId,
}: {
  match: Match;
  compact?: boolean;
  currentUserId?: number;
}) {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const avatarSize = compact ? 22 : 28;

  return (
    <View>
      {([1, 2] as const).map((side) => {
        const isWinner = match.status === 'completed' && match.winner_side === side;
        const players = sidePlayers(match, side);
        return (
          <View
            key={side}
            style={[
              styles.row,
              compact && styles.rowCompact,
              side === 1 && styles.rowDivider,
              isWinner && styles.rowWinner,
            ]}>
            <View style={styles.marker}>
              {isWinner ? (
                <MaterialIcons name="emoji-events" size={compact ? 16 : 18} color={colors.secondaryContainer} />
              ) : (
                <View style={styles.dot} />
              )}
            </View>
            <View style={styles.avatars}>
              {players.map((player, index) => (
                <View key={player.id} style={[index > 0 && { marginLeft: -avatarSize * 0.35 }, { zIndex: -index }]}>
                  <Avatar
                    name={player.name}
                    imageUrl={player.avatar_url}
                    color={player.avatar_color}
                    emoji={player.avatar_emoji}
                    size={avatarSize}
                  />
                </View>
              ))}
            </View>
            <View style={styles.names}>
              <PlayerNames
                style={[styles.name, compact && styles.nameCompact, isWinner && styles.nameWinner]}
                players={players}
                boldIds={currentUserId != null ? [currentUserId] : undefined}
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

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      paddingHorizontal: Spacing.xs,
      borderRadius: Radii.DEFAULT,
    },
    rowCompact: {
      paddingVertical: 6,
    },
    rowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.glassBorder,
    },
    rowWinner: {
      backgroundColor: colors.primaryContainer + '14',
    },
    marker: {
      width: 20,
      alignItems: 'center',
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.outlineVariant,
    },
    avatars: {
      flexDirection: 'row',
    },
    names: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      ...Typography.bodyMd,
      color: colors.onSurface,
    },
    nameCompact: {
      fontSize: 15,
    },
    nameWinner: {
      fontFamily: FontFamilies.bodyBold,
      color: colors.primary,
    },
    set: {
      width: 28,
      textAlign: 'center',
      fontFamily: FontFamilies.display,
      fontSize: 22,
      color: colors.onSurfaceVariant,
    },
    setCompact: {
      width: 24,
      fontSize: 18,
    },
    setWon: {
      color: colors.primaryContainer,
    },
  });
