import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { useColors } from '@/hooks/use-theme';
import { FontFamilies, Radii, Spacing, type ColorPalette } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
};

export function Button({ title, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
  const colors = useColors();
  const { variantStyles, variantLabelStyles } = useMemo(() => makeVariantStyles(colors), [colors]);

  return (
    <Pressable
      style={(state) => [
        styles.base,
        variantStyles[variant],
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
      disabled={disabled}
      {...rest}>
      <Text style={[styles.label, variantLabelStyles[variant]]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: FontFamilies.headline,
    fontSize: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

const makeVariantStyles = (colors: ColorPalette) => ({
  variantStyles: StyleSheet.create({
    primary: {
      backgroundColor: colors.secondaryContainer,
    },
    secondary: {
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.primaryContainer,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: colors.errorContainer,
    },
  }),
  variantLabelStyles: StyleSheet.create({
    primary: {
      color: colors.onSecondaryContainer,
    },
    secondary: {
      color: colors.onSurface,
    },
    ghost: {
      color: colors.primaryContainer,
    },
    danger: {
      color: colors.onErrorContainer,
    },
  }),
});
