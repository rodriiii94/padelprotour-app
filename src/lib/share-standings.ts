import { Share } from 'react-native';

import type { Ranking } from '@/api/types';
import { standingName } from '@/lib/standings';

export interface StandingsShareInput {
  /** Nombre de la categoría. */
  title: string;
  /** Nombre de la competición. */
  subtitle: string;
  rankings: Ranking[];
}

/** En las apps nativas se comparte como texto; la versión web genera una imagen. */
export async function shareStandings({ title, subtitle, rankings }: StandingsShareInput): Promise<void> {
  const rows = rankings.map(
    (ranking) => `${ranking.position}. ${standingName(ranking).title} · ${ranking.points} pts (${ranking.won}-${ranking.lost})`
  );

  await Share.share({
    message: [`Clasificación · ${title}`, subtitle, '', ...rows, '', 'padelprotour.net'].join('\n'),
  });
}
