import { useCallback, useEffect, useState } from 'react';

import { listCompetitions } from '@/api/competitions';
import type { Competition } from '@/api/types';

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const result = await listCompetitions(1);
      setCompetitions(result.data);
      setPage(1);
      setHasMore(result.current_page < result.last_page);
    } catch {
      setError('No se pudieron cargar las competiciones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await listCompetitions(nextPage);
      setCompetitions((current) => [...current, ...result.data]);
      setPage(nextPage);
      setHasMore(result.current_page < result.last_page);
    } catch {
      setError('No se pudieron cargar más competiciones.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const result = await listCompetitions(1);
        setCompetitions(result.data);
        setHasMore(result.current_page < result.last_page);
      } catch {
        setError('No se pudieron cargar las competiciones.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { competitions, isLoading, isLoadingMore, hasMore, error, refetch, loadMore };
}
