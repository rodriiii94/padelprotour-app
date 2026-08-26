import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlassPanel } from '@/components/ui/glass-panel';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/hooks/use-auth';
import { Colors, FontFamilies, Radii, Spacing, Typography } from '@/theme/tokens';

type Role = 'jugador' | 'organizador';

export default function HomeScreen() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role>('jugador');

  return (
    <Screen>
      <View>
        <Text style={styles.greeting}>¡Hola, {user?.name.split(' ')[0] ?? ''}!</Text>
        {user?.level && <Text style={styles.level}>Nivel {user.level}</Text>}
      </View>

      <View style={styles.roleSelector}>
        <RoleButton label="Jugador" active={role === 'jugador'} onPress={() => setRole('jugador')} />
        <RoleButton
          label="Organizador"
          active={role === 'organizador'}
          onPress={() => setRole('organizador')}
        />
      </View>

      <GlassPanel style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>
          {role === 'jugador' ? 'Próximos partidos y ligas activas' : 'Tus competiciones organizadas'}
        </Text>
        <Text style={styles.placeholderBody}>
          Esta sección se conectará a la API de competiciones en la siguiente pasada.
        </Text>
      </GlassPanel>
    </Screen>
  );
}

function RoleButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.roleButton, active && styles.roleButtonActive]}>
      <Text style={[styles.roleButtonLabel, active && styles.roleButtonLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  greeting: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  level: {
    ...Typography.bodySm,
    color: Colors.primaryContainer,
    marginTop: Spacing.base,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.glassFill,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    borderRadius: Radii.full,
    padding: 4,
  },
  roleButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radii.full,
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: Colors.primaryContainer,
  },
  roleButtonLabel: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
  roleButtonLabelActive: {
    color: Colors.onPrimary,
    fontFamily: FontFamilies.bodyBold,
  },
  placeholderCard: {
    padding: Spacing.sm,
    gap: Spacing.base,
  },
  placeholderTitle: {
    ...Typography.headlineSm,
    color: Colors.primary,
  },
  placeholderBody: {
    ...Typography.bodySm,
    color: Colors.onSurfaceVariant,
  },
});
