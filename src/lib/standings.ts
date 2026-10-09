import type { Ranking } from '@/api/types';

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
