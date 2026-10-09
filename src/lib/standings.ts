import type { Ranking, StandingMatch } from '@/api/types';

/** Oro, plata y bronce para las tres primeras posiciones. */
export const PODIUM_COLORS: Record<number, string> = {
  1: '#ffc857',
  2: '#c9d1c0',
  3: '#d99a6c',
};

/**
 * Cómo nombrar una fila: el nombre de la pareja si lo tiene (con sus jugadores debajo, para
 * que se sepa quiénes son), o directamente "Jugador 1 / Jugador 2".
 */
export function standingName(ranking: Ranking): { title: string; subtitle: string | null } {
  if (ranking.pair) {
    const players = [ranking.pair.player1?.name, ranking.pair.player2?.name].filter(Boolean).join(' / ');
    return ranking.pair.name
      ? { title: ranking.pair.name, subtitle: players || null }
      : { title: players || `Pareja #${ranking.pair.id}`, subtitle: null };
  }
  return { title: ranking.player?.name ?? `Jugador #${ranking.player_id}`, subtitle: null };
}

/**
 * La misma fila en líneas cortas para la tabla de móvil: cada jugador en su línea, o el
 * nombre de la pareja y debajo, en secundario, quiénes son.
 */
export function standingLines(ranking: Ranking): { text: string; secondary: boolean }[] {
  if (!ranking.pair) return [{ text: standingName(ranking).title, secondary: false }];

  const players = [ranking.pair.player1?.name, ranking.pair.player2?.name].filter(
    (name): name is string => !!name
  );
  if (ranking.pair.name) {
    return [
      { text: ranking.pair.name, secondary: false },
      ...(players.length ? [{ text: players.join(' / '), secondary: true }] : []),
    ];
  }
  return players.length
    ? players.map((text) => ({ text, secondary: false }))
    : [{ text: `Pareja #${ranking.pair.id}`, secondary: false }];
}

/** Ids de los jugadores de la fila, para saber si es la del usuario. */
export function standingPlayerIds(ranking: Ranking): number[] {
  if (ranking.pair) return [ranking.pair.player1_id, ranking.pair.player2_id];
  return ranking.player_id !== null ? [ranking.player_id] : [];
}

/** Diferencia con signo: "+3", "0", "−2". */
export function signedDiff(won: number, lost: number): string {
  const diff = won - lost;
  if (diff > 0) return `+${diff}`;
  return diff < 0 ? `−${Math.abs(diff)}` : '0';
}

/** Resumen de una fila para lectores de pantalla. */
export function standingSummary(ranking: Ranking): string {
  const { title, subtitle } = standingName(ranking);
  return [
    `Posición ${ranking.position}: ${title}${subtitle ? ` (${subtitle})` : ''}`,
    `${ranking.points} puntos`,
    `${ranking.played} jugados, ${ranking.won} ganados, ${ranking.lost} perdidos`,
    `sets ${ranking.sets_won} a favor y ${ranking.sets_lost} en contra`,
    `juegos ${ranking.games_won} a favor y ${ranking.games_lost} en contra`,
  ].join(', ');
}

/** Colores de un resultado en la racha y en la lista de partidos. */
export const RESULT_COLORS = { won: '#7ad151', lost: '#f2726a' } as const;

/** Partidos con resultado (confirmado o pendiente de validar), del más reciente al más antiguo. */
export function playedMatches(ranking: Ranking): StandingMatch[] {
  return (ranking.matches ?? []).filter((match) => match.score !== null).reverse();
}

/** El siguiente partido por jugar: la API ya los da ordenados por fecha, sin fecha al final. */
export function nextMatch(ranking: Ranking): StandingMatch | null {
  return (ranking.matches ?? []).find((match) => match.score === null) ?? null;
}
