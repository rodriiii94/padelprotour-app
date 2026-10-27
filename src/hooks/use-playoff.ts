import { useCallback, useEffect, useState } from 'react';

import { getCategory, getPlayoff } from '@/api/categories';
import { getCompetition } from '@/api/competitions';
import type { Category, Competition, PlayoffBracket } from '@/api/types';

/** `invite`: código del enlace, para leer una competición privada antes de participar en ella. */
export function usePlayoff(categoryId: number, invite?: string) {
  const [category, setCategory] = useState<Category | null>(null);
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [bracket, setBracket] = useState<PlayoffBracket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const [cat, playoff] = await Promise.all([getCategory(categoryId, invite), getPlayoff(categoryId, invite)]);
        setCategory(cat);
        setBracket(playoff);
        setCompetition(await getCompetition(cat.competition_id, invite));
      } catch {
        setError('No se pudo cargar el playoff.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [categoryId, invite, reloadKey]);

  return { category, competition, bracket, isLoading, error, refetch };
}
