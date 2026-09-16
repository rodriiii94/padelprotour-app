import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

import { Colors, FontFamilies, Radii, Spacing } from '@/theme/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
};

export function Button({ title, variant = 'primary', style, disabled, ...rest }: ButtonProps) {
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

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: Colors.secondaryContainer,
  },
  secondary: {
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.primaryContainer,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.errorContainer,
  },
});

const variantLabelStyles = StyleSheet.create({
  primary: {
    color: Colors.onSecondaryContainer,
  },
  secondary: {
    color: Colors.onSurface,
  },
  ghost: {
    color: Colors.primaryContainer,
  },
  danger: {
    color: Colors.onErrorContainer,
  },
});
