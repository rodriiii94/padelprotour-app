import { useCallback, useEffect, useState } from 'react';

import { getCompetition, listCategories, updateCompetition } from '@/api/competitions';
import type { Category, Competition } from '@/api/types';

export function useCompetitionDetail(id: number) {
  const [competition, setCompetition] = useState<Competition | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const [competitionData, categoriesData] = await Promise.all([
        getCompetition(id),
        listCategories(id),
      ]);
      setCompetition(competitionData);
      setCategories(categoriesData);
    } catch {
      setError('No se pudo cargar la competición.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const [competitionData, categoriesData] = await Promise.all([
          getCompetition(id),
          listCategories(id),
        ]);
        setCompetition(competitionData);
        setCategories(categoriesData);
      } catch {
        setError('No se pudo cargar la competición.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const togglePrivacy = useCallback(async () => {
    if (!competition) return;
    setIsUpdating(true);
    try {
      setCompetition(await updateCompetition(competition.id, { is_private: !competition.is_private }));
    } catch {
      setError('No se pudo actualizar la privacidad.');
    } finally {
      setIsUpdating(false);
    }
  }, [competition]);

  return { competition, categories, isLoading, isUpdating, error, refetch, togglePrivacy };
}
