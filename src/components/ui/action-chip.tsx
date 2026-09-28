import { MaterialIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { IconName } from '@/components/ui/section-label';
import { useColors } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, type ColorPalette } from '@/theme/tokens';

type Tone = 'default' | 'danger' | 'accent';

const makeTones = (colors: ColorPalette): Record<Tone, { color: string; border: string; background: string }> => ({
  default: { color: colors.onSurface, border: colors.glassBorder, background: colors.glassFill },
  // primaryContainer/errorContainer no cambian entre temas (son rellenos de acento fijos),
  // así que un tinte a partir de ellos vale igual en claro y en oscuro.
  danger: { color: colors.error, border: colors.errorContainer + '59', background: colors.errorContainer + '1f' },
  accent: { color: colors.primaryContainer, border: colors.primaryContainer + '66', background: colors.primaryContainer + '14' },
});

/** Botón de acción secundario: borde fino y fondo tenue, con icono opcional. */
export function ActionChip({
  label,
  icon,
  onPress,
  disabled = false,
  tone = 'default',
  fill = true,
}: {
  label: string;
  icon?: IconName;
  onPress: () => void;
  disabled?: boolean;
  tone?: Tone;
  /** true: ocupa el ancho disponible (filas de acciones). false: solo lo que mide. */
  fill?: boolean;
}) {
  const colors = useColors();
  const tones = useMemo(() => makeTones(colors), [colors]);
  const { color, border, background } = tones[tone];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.chip,
        fill && styles.fill,
        { borderColor: border, backgroundColor: background },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      {icon ? <MaterialIcons name={icon} size={18} color={color} /> : null}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
  fill: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 14,
  },
});
