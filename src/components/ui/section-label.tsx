import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-theme';
import { FontFamilies } from '@/theme/tokens';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];

/** Título pequeño en mayúsculas con icono que encabeza cada bloque de un panel. */
export function SectionLabel({
  icon,
  label,
  tone = 'default',
}: {
  icon: IconName;
  label: string;
  tone?: 'default' | 'danger';
}) {
  const colors = useColors();
  const color = tone === 'danger' ? colors.error : colors.onSurfaceVariant;
  return (
    <View style={styles.row}>
      <MaterialIcons name={icon} size={16} color={color} />
      <Text style={[styles.text, { color }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
