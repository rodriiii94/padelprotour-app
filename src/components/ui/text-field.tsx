import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { Colors, FontFamilies, Radii, Spacing } from '@/theme/tokens';

export function TextField({ style, ...rest }: TextInputProps) {
  return (
    <TextInput style={[styles.input, style]} placeholderTextColor={Colors.onSurfaceVariant} {...rest} />
  );
}

const styles = StyleSheet.create({
  input: {
    // En web el BlurView absoluto de GlassPanel se pinta encima de los <input>
    // sin posición propia y los deja borrosos; los View/Text de RN web ya la tienen.
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    color: Colors.onSurface,
    fontFamily: FontFamilies.body,
    fontSize: 16,
  },
});
