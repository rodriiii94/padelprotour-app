import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamilies } from '@/theme/tokens';

/** Campo con su etiqueta en mayúsculas encima y, opcionalmente, un dato a la derecha (p. ej. un contador). */
export function LabeledField({
  label,
  right,
  children,
}: {
  label: string;
  right?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {right ? <Text style={styles.right}>{right}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontFamily: FontFamilies.bodyBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Colors.onSurfaceVariant,
  },
  right: {
    fontFamily: FontFamilies.body,
    fontSize: 11,
    color: Colors.onSurfaceVariant,
  },
});
