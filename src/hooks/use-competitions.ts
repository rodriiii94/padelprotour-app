import { useCallback, useEffect, useState } from 'react';

import { listCompetitions } from '@/api/competitions';
import type { Competition } from '@/api/types';

export function useCompetitions() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      const page = await listCompetitions();
      setCompetitions(page.data);
    } catch {
      setError('No se pudieron cargar las competiciones.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setError(null);
      try {
        const page = await listCompetitions();
        setCompetitions(page.data);
      } catch {
        setError('No se pudieron cargar las competiciones.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { competitions, isLoading, error, refetch };
}
