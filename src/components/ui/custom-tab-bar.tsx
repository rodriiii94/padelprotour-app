import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Colors, Radii, Spacing } from '@/theme/tokens';

const ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  index: 'home',
  competiciones: 'emoji-events',
  perfil: 'person',
};

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <GlassPanel style={[styles.bar, { bottom: insets.bottom + Spacing.xs }]} radius={Radii.full}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const icon = ICONS[route.name] ?? 'circle';

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            accessibilityLabel={options.title ?? route.name}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.item}>
            <MaterialIcons
              name={icon}
              size={26}
              color={focused ? Colors.secondaryContainer : Colors.onSurfaceVariant}
            />
            {focused && <View style={styles.dot} />}
          </Pressable>
        );
      })}
    </GlassPanel>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: Spacing.safeMargin,
    right: Spacing.safeMargin,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.base,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.secondaryContainer,
  },
});
