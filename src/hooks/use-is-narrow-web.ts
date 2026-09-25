import { useWindowDimensions } from 'react-native';

/**
 * Por debajo de este ancho la web se comporta como en un móvil: barra inferior en
 * vez de barra lateral y scroll del propio documento. Mantener igual que el
 * `@media (min-width: 768px)` de `src/app/+html.tsx`.
 */
export const NARROW_BREAKPOINT = 768;

export function useIsNarrowWeb(): boolean {
  return useWindowDimensions().width < NARROW_BREAKPOINT;
}
