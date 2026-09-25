import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/hooks/use-auth';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

const NAV_ITEMS: {
  href: '/' | '/buscar' | '/competiciones' | '/perfil';
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/buscar', label: 'Buscar', icon: 'search' },
  { href: '/competiciones', label: 'Competiciones', icon: 'emoji-events' },
  { href: '/perfil', label: 'Perfil', icon: 'person' },
];

/** Bottom tab bar for narrow viewports; logout lives in the Perfil screen. */
export function WebBottomBar() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomBar, { paddingBottom: Spacing.xs + insets.bottom }]}>
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        return (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={styles.bottomItem}
            accessibilityLabel={item.label}>
            <MaterialIcons
              name={item.icon}
              size={24}
              color={active ? Colors.primaryContainer : Colors.onSurfaceVariant}
            />
            <Text style={[styles.bottomLabel, active && styles.bottomLabelActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Only rendered from `*.web.tsx` layouts — never bundled into the native app. */
export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <View style={styles.sidebar}>
      <View>
        <Text style={styles.brand}>PadelProTour</Text>

        <View style={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Pressable
                key={item.href}
                onPress={() => router.push(item.href)}
                style={[styles.navItem, active && styles.navItemActive]}>
                <MaterialIcons
                  name={item.icon}
                  size={20}
                  color={active ? Colors.onPrimaryContainer : Colors.onSurfaceVariant}
                />
                <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user?.email}
          </Text>
        </View>
        <Pressable onPress={logout} style={styles.logoutButton} accessibilityLabel="Cerrar sesión">
          <MaterialIcons name="logout" size={18} color={Colors.onSurfaceVariant} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    borderRightWidth: 1,
    borderRightColor: Colors.glassBorder,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  brand: {
    ...Typography.headlineSm,
    color: Colors.primary,
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  nav: {
    gap: Spacing.base,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radii.md,
  },
  navItemActive: {
    backgroundColor: Colors.primaryContainer,
  },
  navLabel: {
    ...Typography.bodyMd,
    color: Colors.onSurfaceVariant,
  },
  navLabelActive: {
    color: Colors.onPrimaryContainer,
    fontFamily: FontFamilies.bodyBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.bodySm,
    color: Colors.primary,
  },
  userEmail: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
  },
  logoutButton: {
    padding: Spacing.base,
  },
  bottomBar: {
    // Sticky, no fixed: queda al final del contenido y se pega al borde inferior de la
    // ventana mientras se hace scroll, sin tapar el último trozo de la página.
    position: 'sticky' as 'relative',
    bottom: 0,
    zIndex: 10,
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    paddingTop: Spacing.xs,
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Spacing.base,
  },
  bottomLabel: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.onSurfaceVariant,
  },
  bottomLabelActive: {
    color: Colors.primaryContainer,
    fontFamily: FontFamilies.bodyBold,
  },
});
