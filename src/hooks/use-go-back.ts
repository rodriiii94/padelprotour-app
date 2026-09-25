import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Vuelve a la pantalla anterior; si no hay (la página se abrió por URL directa o desde un
 * enlace), va al inicio en lugar de no hacer nada.
 */
export function useGoBack(): () => void {
  const router = useRouter();

  return useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);
}
