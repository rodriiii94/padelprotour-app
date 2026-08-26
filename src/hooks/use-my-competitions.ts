import { useCallback, useEffect, useState } from 'react';

import { listMyCompetitions } from '@/api/competitions';
import type { Competition } from '@/api/types';

export function useMyCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      setCompetitions(await listMyCompetitions());
    } catch {
      setError('No se pudieron cargar tus competiciones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        setCompetitions(await listMyCompetitions());
      } catch {
        setError('No se pudieron cargar tus competiciones.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { competitions, isLoading, error, refetch };
}
