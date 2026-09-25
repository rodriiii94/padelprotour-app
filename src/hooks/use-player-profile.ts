import { useCallback, useEffect, useState } from 'react';

import { getPlayerProfile } from '@/api/users';
import type { PlayerProfile } from '@/api/types';

export function usePlayerProfile(id: number) {
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    try {
      setProfile(await getPlayerProfile(id));
    } catch {
      setError('No se pudo cargar el perfil.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Misma forma que use-competition-detail: la carga inicial va en una IIFE
  // propia para no llamar a setState de forma síncrona dentro del efecto.
  useEffect(() => {
    (async () => {
      try {
        setProfile(await getPlayerProfile(id));
      } catch {
        setError('No se pudo cargar el perfil.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  return { profile, isLoading, error, refetch };
}
