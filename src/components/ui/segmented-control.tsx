import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

type Props<T extends string> = {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Volver a pulsar la opción activa la deja sin elegir (para campos opcionales). */
  allowClear?: boolean;
};

export function SegmentedControl<T extends string>({ options, value, onChange, allowClear = false }: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = value === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(active && allowClear ? null : option.value)}
            style={[styles.button, active && styles.buttonActive]}>
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.full,
    padding: 4,
  },
  button: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  label: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  labelActive: {
    color: Colors.onPrimary,
    fontFamily: FontFamilies.bodyBold,
  },
});
