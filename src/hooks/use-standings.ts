import { useCallback, useEffect, useState } from 'react';

import { getCategory, listRankings } from '@/api/categories';
import { getCompetition } from '@/api/competitions';
import type { Category, Competition, Ranking } from '@/api/types';

/** `invite`: código del enlace, para leer una competición privada antes de participar en ella. */
export function useStandings(categoryId: number, invite?: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [rankings, setRankings] = useState<Ranking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const [cat, rankingList] = await Promise.all([
          getCategory(categoryId, invite),
          listRankings(categoryId, invite),
        ]);
        setCategory(cat);
        setRankings(rankingList);
        setCompetition(await getCompetition(cat.competition_id, invite));
      } catch {
        setError('No se pudo cargar la clasificación.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [categoryId, invite, reloadKey]);

  return { category, competition, rankings, isLoading, error, refetch };
}
