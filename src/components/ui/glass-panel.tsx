import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radii } from '@/theme/tokens';

type GlassPanelProps = ViewProps & {
  radius?: number;
};

export function GlassPanel({ style, radius = Radii.xl, children, ...rest }: GlassPanelProps) {
  return (
    <View style={[styles.container, { borderRadius: radius }, style]} {...rest}>
      <BlurView
        intensity={30}
        tint="dark"
        style={StyleSheet.absoluteFill}
        experimentalBlurMethod={Platform.OS === 'android' ? 'dimezisBlurView' : undefined}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
});
