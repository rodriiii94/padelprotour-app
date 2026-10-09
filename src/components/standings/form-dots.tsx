import { StyleSheet, View } from 'react-native';

import type { FormResult } from '@/api/types';
import { RESULT_COLORS } from '@/lib/standings';

const SLOTS = 5;

/** Racha: un punto por cada uno de los últimos 5 partidos (verde ganado, rojo perdido), el más reciente a la derecha. */
export function FormDots({ form, emptyColor }: { form: FormResult[]; emptyColor: string }) {
  const padded: (FormResult | null)[] = [...Array<null>(Math.max(0, SLOTS - form.length)).fill(null), ...form];
  const summary = form.length
    ? `Racha: ${form.map((result) => (result === 'W' ? 'ganado' : 'perdido')).join(', ')}`
    : 'Sin partidos todavía';

  return (
    <View style={styles.row} accessible accessibilityLabel={summary}>
      {padded.map((result, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            result
              ? { backgroundColor: result === 'W' ? RESULT_COLORS.won : RESULT_COLORS.lost }
              : { borderWidth: 1, borderColor: emptyColor },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
