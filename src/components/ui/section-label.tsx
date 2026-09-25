import { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamilies } from '@/theme/tokens';

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
  const color = tone === 'danger' ? Colors.error : Colors.onSurfaceVariant;
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
