import { useMemo } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, type ColorPalette } from '@/theme/tokens';

export function TextField({ style, ...rest }: TextInputProps) {
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors, scheme), [colors, scheme]);

  return (
    <TextInput style={[styles.input, style]} placeholderTextColor={colors.onSurfaceVariant} {...rest} />
  );
}

const makeStyles = (colors: ColorPalette, scheme: 'light' | 'dark') =>
  StyleSheet.create({
    input: {
      // En web el BlurView absoluto de GlassPanel se pinta encima de los <input>
      // sin posición propia y los deja borrosos; los View/Text de RN web ya la tienen.
      position: 'relative',
      // Un <input> no baja de su ancho intrínseco dentro de una fila flex; sin esto
      // desborda las filas estrechas (redes sociales) y la página se desplaza al enfocarlo.
      minWidth: 0,
      backgroundColor: scheme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(0, 0, 0, 0.2)',
      borderWidth: 1,
      borderColor: colors.glassBorder,
      borderRadius: Radii.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.xs,
      color: colors.onSurface,
      fontFamily: FontFamilies.body,
      fontSize: 16,
    },
  });
