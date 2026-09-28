import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useColors } from '@/hooks/use-theme';
import { FontFamilies, type ColorPalette } from '@/theme/tokens';

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
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

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

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
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
      color: colors.onSurfaceVariant,
    },
    right: {
      fontFamily: FontFamilies.body,
      fontSize: 11,
      color: colors.onSurfaceVariant,
    },
  });
