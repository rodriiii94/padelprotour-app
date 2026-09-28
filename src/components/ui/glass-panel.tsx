import { BlurView } from 'expo-blur';
import { useMemo } from 'react';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Radii, type ColorPalette } from '@/theme/tokens';

type GlassPanelProps = ViewProps & {
  radius?: number;
};

export function GlassPanel({ style, radius = Radii.xl, children, ...rest }: GlassPanelProps) {
  const { colors, scheme } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  return (
    <View style={[styles.container, { borderRadius: radius }, style]} {...rest}>
      <BlurView
        intensity={30}
        tint={scheme === 'light' ? 'light' : 'dark'}
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      {children}
    </View>
  );
}

const makeStyles = (colors: ColorPalette) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.glassFill,
      borderWidth: 1,
      borderColor: colors.glassBorder,
      overflow: 'hidden',
    },
  });
