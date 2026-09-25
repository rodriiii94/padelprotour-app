import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { IconName } from '@/components/ui/section-label';
import { Colors, FontFamilies, Radii, Spacing } from '@/theme/tokens';

type Tone = 'default' | 'danger' | 'accent';

const TONES: Record<Tone, { color: string; border: string; background: string }> = {
  default: { color: Colors.onSurface, border: Colors.glassBorder, background: Colors.glassFill },
  danger: { color: Colors.error, border: 'rgba(255, 180, 171, 0.35)', background: 'rgba(147, 0, 10, 0.12)' },
  accent: { color: Colors.primaryContainer, border: 'rgba(182, 247, 0, 0.4)', background: 'rgba(182, 247, 0, 0.08)' },
};

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
  const { color, border, background } = TONES[tone];
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
