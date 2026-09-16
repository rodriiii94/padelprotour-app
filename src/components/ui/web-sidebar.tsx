import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

const NAV_ITEMS: {
  href: '/' | '/competiciones' | '/perfil';
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}[] = [
  { href: '/', label: 'Inicio', icon: 'home' },
  { href: '/competiciones', label: 'Competiciones', icon: 'emoji-events' },
  { href: '/perfil', label: 'Perfil', icon: 'person' },
];

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
});
